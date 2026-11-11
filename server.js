const path = require('node:path');
const express = require('express');
const { db, getISTDateKey, ensureTodayPolls } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'lpu2026';

app.use(express.json({ limit: '64kb' }));
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

function cleanText(val, maxLen = 400) {
  return String(val ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLen);
}

function requireAdmin(req, res, next) {
  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Invalid admin passcode. Default local key is lpu2026.' });
  }
  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    engine: 'Node.js + Express + SQLite (node:sqlite)',
    timestamp: new Date().toISOString()
  });
});

// Single fast bootstrap payload for frontend hydration
app.get('/api/bootstrap', (_req, res) => {
  const timings = db.prepare('SELECT * FROM meal_timings ORDER BY sort_order ASC').all();
  const menuRows = db.prepare('SELECT * FROM weekly_menu ORDER BY cuisine ASC, day_of_week ASC').all();
  const plans = db.prepare('SELECT * FROM mess_plans ORDER BY sort_order ASC').all();
  const rooms = db.prepare('SELECT * FROM hostel_rooms ORDER BY sort_order ASC').all();
  const blocks = db.prepare('SELECT * FROM campus_blocks ORDER BY sort_order ASC').all();
  const todayDate = getISTDateKey();
  const todayPolls = ensureTodayPolls(todayDate);
  const reviewStats = db.prepare(`
    SELECT COUNT(*) AS total, ROUND(COALESCE(AVG(rating), 0), 1) AS average
    FROM reviews
  `).get();
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY id DESC LIMIT 12').all();
  const resolvedQueries = db.prepare(`
    SELECT id, name, topic, question, admin_reply, created_at
    FROM queries
    WHERE status = 'resolved' AND admin_reply != ''
    ORDER BY id DESC
    LIMIT 6
  `).all();

  res.json({
    timings,
    menu: menuRows,
    plans,
    rooms,
    blocks,
    todayDate,
    todayPolls,
    reviewSummary: {
      total: reviewStats.total,
      average: reviewStats.average
    },
    reviews,
    resolvedQueries
  });
});

// Query weekly menu
app.get('/api/menu', (req, res) => {
  const { cuisine, day } = req.query;
  if (cuisine && day !== undefined) {
    const row = db
      .prepare('SELECT * FROM weekly_menu WHERE cuisine = ? AND day_of_week = ?')
      .get(String(cuisine), Number(day));
    if (!row) return res.status(404).json({ error: 'Menu entry not found.' });
    return res.json(row);
  }
  const all = db.prepare('SELECT * FROM weekly_menu ORDER BY cuisine ASC, day_of_week ASC').all();
  res.json(all);
});

// Query mess plans & hostel rooms
app.get('/api/plans', (_req, res) => {
  const plans = db.prepare('SELECT * FROM mess_plans ORDER BY sort_order ASC').all();
  const rooms = db.prepare('SELECT * FROM hostel_rooms ORDER BY sort_order ASC').all();
  res.json({ plans, rooms });
});

// List student mess reviews
app.get('/api/reviews', (_req, res) => {
  const stats = db.prepare(`
    SELECT COUNT(*) AS total, ROUND(COALESCE(AVG(rating), 0), 1) AS average
    FROM reviews
  `).get();
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY id DESC LIMIT 20').all();
  res.json({ summary: stats, reviews });
});

// Submit a new student mess review
app.post('/api/reviews', (req, res) => {
  const studentName = cleanText(req.body.student_name, 60);
  const hostelBlock = cleanText(req.body.hostel_block, 30);
  const messType = cleanText(req.body.mess_type, 50);
  const rating = Number(req.body.rating);
  const comment = cleanText(req.body.comment, 360);

  if (!studentName || !hostelBlock || !messType || !comment) {
    return res.status(400).json({ error: 'Please fill in your name, hostel block, mess plan, and review comment.' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }

  const result = db.prepare(`
    INSERT INTO reviews (student_name, hostel_block, mess_type, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentName, hostelBlock, messType, rating, comment);

  const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  const stats = db.prepare(`
    SELECT COUNT(*) AS total, ROUND(COALESCE(AVG(rating), 0), 1) AS average
    FROM reviews
  `).get();

  res.status(201).json({
    message: 'Review posted!',
    review: created,
    summary: stats
  });
});

// Submit a student / fresher query
app.post('/api/queries', (req, res) => {
  const name = cleanText(req.body.name, 70);
  const contact = cleanText(req.body.contact, 90);
  const topic = cleanText(req.body.topic, 40) || 'General';
  const question = cleanText(req.body.question, 500);

  if (!name || !contact || !question) {
    return res.status(400).json({ error: 'Please enter your name, email/phone, and question.' });
  }

  const result = db.prepare(`
    INSERT INTO queries (name, contact, topic, question)
    VALUES (?, ?, ?, ?)
  `).run(name, contact, topic, question);

  res.status(201).json({
    message: 'Question saved! You can view & answer it in the Admin Dashboard (/admin).',
    id: Number(result.lastInsertRowid)
  });
});

// Campus Blocks & Landmarks Directory
app.get('/api/blocks', (req, res) => {
  const q = cleanText(req.query.q || '', 80).toLowerCase();
  const category = cleanText(req.query.category || '', 40);
  let rows = db.prepare('SELECT * FROM campus_blocks ORDER BY sort_order ASC').all();
  if (category && category.toLowerCase() !== 'all') {
    rows = rows.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    rows = rows.filter((b) =>
      `${b.code} ${b.title} ${b.highlights} ${b.nearest_gate}`.toLowerCase().includes(q)
    );
  }
  res.json({ blocks: rows });
});

// Live Daily Meal Poll ("Aaj Ka Khana Kaisa Tha?")
app.get('/api/polls', (_req, res) => {
  const todayDate = getISTDateKey();
  const polls = ensureTodayPolls(todayDate);
  res.json({ todayDate, polls });
});

app.post('/api/polls/vote', (req, res) => {
  const cuisine = cleanText(req.body.cuisine, 20).toLowerCase();
  const mealSlot = cleanText(req.body.meal_slot, 20).toLowerCase();
  const vote = cleanText(req.body.vote, 10).toLowerCase();
  const prevVote = cleanText(req.body.previous_vote || '', 10).toLowerCase();

  if (!['north', 'south'].includes(cuisine)) {
    return res.status(400).json({ error: 'Valid cuisine (north/south) required.' });
  }
  if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealSlot)) {
    return res.status(400).json({ error: 'Valid meal_slot required.' });
  }
  if (!['up', 'down'].includes(vote)) {
    return res.status(400).json({ error: 'Vote must be up or down.' });
  }

  const todayDate = getISTDateKey();
  ensureTodayPolls(todayDate);

  if (prevVote === vote) {
    const polls = db.prepare('SELECT * FROM meal_polls WHERE poll_date = ?').all(todayDate);
    return res.json({ message: 'Vote already counted.', todayDate, polls });
  }

  if (prevVote === 'up') {
    db.prepare(`
      UPDATE meal_polls
      SET up_votes = MAX(0, up_votes - 1), down_votes = down_votes + 1
      WHERE poll_date = ? AND cuisine = ? AND meal_slot = ?
    `).run(todayDate, cuisine, mealSlot);
  } else if (prevVote === 'down') {
    db.prepare(`
      UPDATE meal_polls
      SET down_votes = MAX(0, down_votes - 1), up_votes = up_votes + 1
      WHERE poll_date = ? AND cuisine = ? AND meal_slot = ?
    `).run(todayDate, cuisine, mealSlot);
  } else if (vote === 'up') {
    db.prepare(`
      UPDATE meal_polls
      SET up_votes = up_votes + 1
      WHERE poll_date = ? AND cuisine = ? AND meal_slot = ?
    `).run(todayDate, cuisine, mealSlot);
  } else {
    db.prepare(`
      UPDATE meal_polls
      SET down_votes = down_votes + 1
      WHERE poll_date = ? AND cuisine = ? AND meal_slot = ?
    `).run(todayDate, cuisine, mealSlot);
  }

  const polls = db.prepare('SELECT * FROM meal_polls WHERE poll_date = ?').all(todayDate);
  res.json({ message: 'Vote recorded!', todayDate, polls });
});

// "Ask LPU Buddy" Smart Campus Assistant (SQLite-backed Hinglish + English QA)
function buildBuddyAnswer(rawMessage) {
  const q = rawMessage.toLowerCase();
  const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayDay = istNow.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

  // 1. Check for Banned Items / Hostel Rules / Packing / Reporting Docs
  if (/(kettle|iron|press|heater|induction|rod|toaster|banned|not allowed|mana hai|curfew|in-time|intime|document|reporting|pack|checklist|laundry)/.test(q)) {
    if (/(document|reporting|admission doc)/.test(q)) {
      return `📋 **Reporting Documents Checklist (Block 32):**\n• 10th & 12th Original Marksheets + 4 self-attested copies\n• Provisional Allotment Letter & Fee Receipt\n• Aadhaar Card + 6 passport-size photos\n• Anti-Ragging Affidavit & Medical Fitness Certificate\n*(Tip: Page ke **Fresher Checklist** section me tick lagake WhatsApp par save kar lo!)*`;
    }
    return `⚠️ **Hostel Rules & Banned Items:**\n• **Strictly Banned:** Electric kettle, immersion rod, clothes iron/press, induction cooktop, heater & toaster (security gate par confiscate ho jate hain).\n• **Campus Alternatives:** Har hostel floor par hot/cold RO water dispenser laga hai, aur har hostel ke andar dedicated **Laundry & Pressing shop** hai.\n• **Pack Zaroor Karein:** 2 strong padlocks (almirah + room), single bedsheets, surge-protected extension board, aur toiletries.`;
  }

  // 2. Check for Block / Landmark / Hostel / Gate Location
  const blocks = db.prepare('SELECT * FROM campus_blocks ORDER BY sort_order ASC').all();
  const blockKeywords = [
    { re: /\b(block\s*32|\b32\b|ums|reporting|admission block)/, code: 'Block 32' },
    { re: /\b(block\s*34|\b34\b|cse|computer science|\bit\b|coding)/, code: 'Block 34' },
    { re: /\b(block\s*33|block\s*36|\b33\b|\b36\b|ece|mechanical|robotics)/, code: 'Block 33 & 36' },
    { re: /\b(block\s*14|\b14\b|msb|mba|bba|business|mittal school)/, code: 'Block 14' },
    { re: /\b(block\s*15|\b15\b|uni\s*mall|unimall|mall|atm|bank|food court)/, code: 'Block 15 · Uni Mall' },
    { re: /\b(block\s*37|\b37\b|library|central library|study room)/, code: 'Block 37' },
    { re: /\b(block\s*6|\b6\b|hospital|medical|doctor|chemist|ambulance|sick)/, code: 'Block 6 · Hospital' },
    { re: /\b(unipolis|auditorium|sdm|orientation|freshers venue)/, code: 'Unipolis & SDM' },
    { re: /\b(robopark|robo park|helipad)/, code: 'RoboPark' },
    { re: /\b(stadium|sports|swimming|pool|badminton|shooting)/, code: 'Indoor Stadium' },
    { re: /\b(bh-?[1-4]|boys hostel 1|boys hostel 2|boys hostel 3|boys hostel 4)/, code: 'BH-1 to BH-4' },
    { re: /\b(bh-?[5-8]|studio apartment|apartments)/, code: 'BH-5 to BH-8 & Apts' },
    { re: /\b(gh-?[1-6]|girls hostel)/, code: 'GH-1 to GH-6' },
    { re: /\b(block\s*29|block\s*30|\b29\b|\b30\b|chancellor|exam wing|transcript)/, code: 'Block 29 & 30' },
    { re: /\b(block\s*2[5-8]|law|design|architecture|hotel management|fashion)/, code: 'Block 25–28' },
    { re: /\b(block\s*5[5-7]|agriculture|pharmacy|bioengineering)/, code: 'Block 55–57' }
  ];
  for (const item of blockKeywords) {
    if (item.re.test(q) && !/(fee|kitna|price|cost|budget)/.test(q)) {
      const b = blocks.find((row) => row.code === item.code);
      if (b) {
        return `📍 **${b.code} — ${b.title}**\n• **Nearest Entry:** ${b.nearest_gate} (${b.walk_mins})\n• **E-Rickshaw:** ${b.erickshaw_route}\n• **Inside:** ${b.highlights}`;
      }
    }
  }

  // 3. Check for Transit / Station / Airport / Directions
  if (/(phagwara|jalandhar|cantt|station|train|airport|amritsar|chandigarh|reach|kaise aaye|kaise pahunch|auto|cab|nh-?44|address)/.test(q)) {
    return `🚆 **How to Reach LPU (NH-44, Phagwara):**\n• **Phagwara Jn (PGW):** ~7 km (12–15 min) — Station ke bahar se direct auto/cab Main Gate tak milti hai.\n• **Jalandhar Cantt (JRC):** ~14 km (20–25 min) — NH-44 highway bus ya shared auto seedha LPU gate par utarti hai.\n• **Jalandhar City (JUC):** ~20 km (30–35 min).\n• **Airports:** Amritsar (ATQ ~110 km) & Chandigarh (IXC ~145 km).`;
  }

  // 4. Check for Fees / Hostel + Mess Calculation
  if (/(fee|fees|kitna|price|cost|kharcha|budget|seater|cooler|mess plan|a la carte|alacarte|non-?veg|chicken|edb)/.test(q)) {
    const plans = db.prepare('SELECT * FROM mess_plans ORDER BY sort_order ASC').all();
    const rooms = db.prepare('SELECT * FROM hostel_rooms ORDER BY sort_order ASC').all();

    if (/(non-?veg|chicken|egg|mutton)/.test(q)) {
      return `🍗 **Non-Veg Option Info:**\nLPU campus ke andar mess 100% vegetarian hai, par campus ke bilkul bahar independent vendor non-veg mess chalata hai:\n• **3 Meals:** ₹75,000/yr · **2 Meals:** ₹65,000/yr · **1 Meal:** ₹55,000/yr.`;
    }

    let pickedRoom = null;
    if (/1\s*-?\s*seater|single/.test(q)) pickedRoom = rooms.find((r) => r.room_key === '1s_ac');
    else if (/2\s*-?\s*seater/.test(q)) pickedRoom = rooms.find((r) => r.room_key === '2s_ac');
    else if (/3\s*-?\s*seater.*cooler/.test(q)) pickedRoom = rooms.find((r) => r.room_key === '3s_cooler');
    else if (/3\s*-?\s*seater/.test(q)) pickedRoom = rooms.find((r) => r.room_key === '3s_ac');
    else if (/4\s*-?\s*seater.*cooler/.test(q)) pickedRoom = rooms.find((r) => r.room_key === '4s_cooler');
    else if (/apartment/.test(q)) pickedRoom = rooms.find((r) => r.room_key === 'apt_4s');
    else if (/4\s*-?\s*seater/.test(q)) pickedRoom = rooms.find((r) => r.room_key === '4s_ac');

    let pickedPlan = null;
    if (/carte|choice/.test(q)) pickedPlan = plans.find((p) => p.plan_key === 'alacarte');
    else if (/2\s*meal/.test(q)) pickedPlan = plans.find((p) => p.plan_key === 'std2');
    else if (/3\s*meal/.test(q)) pickedPlan = plans.find((p) => p.plan_key === 'std3');
    else if (/4\s*meal/.test(q)) pickedPlan = plans.find((p) => p.plan_key === 'std4');

    if (pickedRoom || pickedPlan) {
      const r = pickedRoom || rooms.find((x) => x.room_key === '4s_ac');
      const p = pickedPlan || plans.find((x) => x.plan_key === 'std4');
      const total = r.fee + p.fee;
      const withEdb = Math.max(0, r.fee - 10000) + p.fee;
      return `💰 **2026–27 Estimated Session Fee (~10 Months):**\n• **Hostel:** ${r.name} — **${inr(r.fee)}** (${r.electricity_units})\n• **Mess:** ${p.name} — **${inr(p.fee)}**\n• **Combined Total:** **${inr(total)}** (~${inr(Math.round(total / 10))}/month)\n• **With EDB Benefit (−₹10k):** **${inr(withEdb)}**`;
    }

    return `💰 **2026–27 Mess & Hostel Rates Overview:**\n• **Veg Mess Plans:** Standard 2-Meal (**₹37,800**), 3-Meal (**₹41,400**), 4-Meal (**₹45,000**), A la carte (**₹52,200**)\n• **Hostel Rooms:** 4-Seater Cooler (**₹93,000**), 4-Seater AC (**₹1,03,000**), 3-Seater AC (**₹1,23,000**), 2-Seater AC (**₹1,43,000**), 1-Seater AC (**₹1,63,000**).\n*(Mujhse exact combo pucho jaise: "3 seater AC + 3 meal fee?")*`;
  }

  // 5. Check for Menu / Today's Khana / Meal Timings
  if (/(menu|khana|breakfast|nashta|lunch|snacks|chai|dinner|raat|parantha|paneer|biryani|dosa|south indian|north indian|timing|kab khulta|mess open|aaj|kal|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.test(q)) {
    const cuisine = /south|dosa|idli|sambar|uttapam/.test(q) ? 'south' : 'north';
    let targetDay = todayDay;
    if (/kal|tomorrow/.test(q)) targetDay = (todayDay + 1) % 7;
    dayNames.forEach((name, idx) => {
      if (q.includes(name.toLowerCase())) targetDay = idx;
    });

    const row = db
      .prepare('SELECT * FROM weekly_menu WHERE cuisine = ? AND day_of_week = ?')
      .get(cuisine, targetDay);
    const cuisineLabel = cuisine === 'south' ? 'South Indian' : 'North Indian';
    const dayLabel = targetDay === todayDay ? `Today (${dayNames[targetDay]})` : dayNames[targetDay];

    if (row) {
      if (/dinner|raat/.test(q)) {
        return `🍽️ **${dayLabel} · ${cuisineLabel} Dinner (7:00 – 9:00 PM):**\n${row.dinner}`;
      }
      if (/lunch|dopahar/.test(q)) {
        return `🍛 **${dayLabel} · ${cuisineLabel} Lunch (11:15 AM – 3:00 PM):**\n${row.lunch}`;
      }
      if (/breakfast|nashta|subah/.test(q)) {
        return `🥞 **${dayLabel} · ${cuisineLabel} Breakfast (7:15 – 9:30 AM):**\n${row.breakfast}`;
      }
      if (/snack|chai|sham/.test(q)) {
        return `☕ **${dayLabel} · ${cuisineLabel} Snacks (5:00 – 6:00 PM):**\n${row.snacks}`;
      }
      return `🍴 **${dayLabel} · ${cuisineLabel} Mess Menu:**\n• **Breakfast (7:15–9:30 AM):** ${row.breakfast}\n• **Lunch (11:15 AM–3:00 PM):** ${row.lunch}\n• **Snacks (5:00–6:00 PM):** ${row.snacks}\n• **Dinner (7:00–9:00 PM):** ${row.dinner}`;
    }
  }

  // 6. Check for Reviews / Mess Rating / Poll
  if (/(review|rating|worth|kaisa hai|accha hai|poll)/.test(q)) {
    const stats = db.prepare('SELECT COUNT(*) AS total, ROUND(COALESCE(AVG(rating), 0), 1) AS average FROM reviews').get();
    const todayPolls = ensureTodayPolls(getISTDateKey());
    const totUp = todayPolls.reduce((s, r) => s + r.up_votes, 0);
    const totAll = todayPolls.reduce((s, r) => s + r.up_votes + r.down_votes, 0);
    const hitPct = totAll ? Math.round((totUp / totAll) * 100) : 86;
    return `⭐ **Live Student Mess Pulse:**\n• **Overall Rating:** **${stats.average} / 5 ★** (${stats.total} student reviews in SQLite)\n• **Today's Live Food Poll:** **${hitPct}% Hit 👍** across campus kitchens.\n• Top student picks: Morning Aloo Parantha, South Indian Filter Coffee + Dosa, aur Sunday Veg Biryani!`;
  }

  // Default helpful response
  return `👋 **Namaste! Main LPU Buddy hoon** (Live SQLite connected). Aap mujhse Hinglish ya English me kuch bhi pooch sakte ho:\n• *"Aaj dinner me kya hai?"* ya *"Sunday South Indian menu"*\n• *"Block 34 kahan hai?"* ya *"Uni Hospital / Library kis gate ke paas hai?"*\n• *"4-seater AC + 3 meal ka total kharcha?"*\n• *"Hostel me kettle/iron allowed hai kya?"* ya *"Phagwara station se kaise aaye?"*`;
}

app.post('/api/chat', (req, res) => {
  const message = cleanText(req.body.message, 300);
  if (!message) {
    return res.status(400).json({ error: 'Please enter a question.' });
  }
  const reply = buildBuddyAnswer(message);
  res.json({ reply, timestamp: new Date().toISOString() });
});

// ---------------- ADMIN API ----------------

app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const menu = db.prepare('SELECT * FROM weekly_menu ORDER BY cuisine ASC, day_of_week ASC').all();
  const plans = db.prepare('SELECT * FROM mess_plans ORDER BY sort_order ASC').all();
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY id DESC').all();
  const queries = db.prepare('SELECT * FROM queries ORDER BY status ASC, id DESC').all();

  res.json({
    counts: {
      menuItems: menu.length,
      plans: plans.length,
      reviews: reviews.length,
      pendingQueries: queries.filter((q) => q.status === 'pending').length,
      totalQueries: queries.length
    },
    menu,
    plans,
    reviews,
    queries
  });
});

// Update a day's menu in SQLite
app.put('/api/admin/menu', requireAdmin, (req, res) => {
  const cuisine = cleanText(req.body.cuisine, 20);
  const day = Number(req.body.day_of_week);
  const breakfast = cleanText(req.body.breakfast, 250);
  const lunch = cleanText(req.body.lunch, 250);
  const snacks = cleanText(req.body.snacks, 250);
  const dinner = cleanText(req.body.dinner, 250);

  if (!['north', 'south'].includes(cuisine) || !Number.isInteger(day) || day < 0 || day > 6) {
    return res.status(400).json({ error: 'Valid cuisine (north/south) and day (0-6) required.' });
  }
  if (!breakfast || !lunch || !snacks || !dinner) {
    return res.status(400).json({ error: 'All four meal descriptions are required.' });
  }

  db.prepare(`
    UPDATE weekly_menu
    SET breakfast = ?, lunch = ?, snacks = ?, dinner = ?, updated_at = datetime('now')
    WHERE cuisine = ? AND day_of_week = ?
  `).run(breakfast, lunch, snacks, dinner, cuisine, day);

  const updated = db
    .prepare('SELECT * FROM weekly_menu WHERE cuisine = ? AND day_of_week = ?')
    .get(cuisine, day);

  res.json({ message: 'Menu updated in SQLite database.', entry: updated });
});

// Update a mess plan's fee or subtitle in SQLite
app.put('/api/admin/plans/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const fee = Number(req.body.fee);
  const subtitle = cleanText(req.body.subtitle, 180);

  if (!Number.isInteger(id) || !Number.isFinite(fee) || fee < 0 || !subtitle) {
    return res.status(400).json({ error: 'Valid plan ID, non-negative fee, and subtitle are required.' });
  }

  const info = db.prepare('UPDATE mess_plans SET fee = ?, subtitle = ? WHERE id = ?').run(Math.round(fee), subtitle, id);
  if (info.changes === 0) return res.status(404).json({ error: 'Plan not found.' });

  const updated = db.prepare('SELECT * FROM mess_plans WHERE id = ?').get(id);
  res.json({ message: 'Mess plan updated in SQLite.', plan: updated });
});

// Reply & resolve a student query
app.patch('/api/admin/queries/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status === 'pending' ? 'pending' : 'resolved';
  const adminReply = cleanText(req.body.admin_reply, 500);

  const info = db
    .prepare('UPDATE queries SET status = ?, admin_reply = ? WHERE id = ?')
    .run(status, adminReply, id);

  if (info.changes === 0) return res.status(404).json({ error: 'Query not found.' });
  const updated = db.prepare('SELECT * FROM queries WHERE id = ?').get(id);
  res.json({ message: 'Query updated.', query: updated });
});

// Delete a review
app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Review not found.' });
  res.json({ message: 'Review removed from database.' });
});

// Clean /admin URL route
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LPU Campus Guide Full-Stack Server running on port ${PORT}`);
  console.log(`Admin Dashboard available at /admin`);
});
