const path = require('node:path');
const express = require('express');
const { state, saveStore, getISTDateKey, ensureTodayPolls } = require('./db');

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

function summarizeReviews() {
  const total = state.reviews.length;
  const sum = state.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  return { total, average };
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
    engine: 'Node.js + Express + JSON Store',
    timestamp: new Date().toISOString()
  });
});

// Single fast bootstrap payload for frontend hydration
app.get('/api/bootstrap', (_req, res) => {
  const todayDate = getISTDateKey();
  const todayPolls = ensureTodayPolls(todayDate);
  const reviewsSorted = [...state.reviews].sort((a, b) => b.id - a.id);
  const resolvedQueries = state.queries
    .filter((q) => q.status === 'resolved' && q.admin_reply)
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  res.json({
    timings: state.meal_timings,
    menu: state.weekly_menu,
    plans: state.mess_plans,
    rooms: state.hostel_rooms,
    blocks: state.campus_blocks,
    todayDate,
    todayPolls,
    reviewSummary: summarizeReviews(),
    reviews: reviewsSorted.slice(0, 12),
    resolvedQueries
  });
});

// Query weekly menu
app.get('/api/menu', (req, res) => {
  const { cuisine, day } = req.query;
  if (cuisine && day !== undefined) {
    const row = state.weekly_menu.find(
      (m) => m.cuisine === String(cuisine) && m.day_of_week === Number(day)
    );
    if (!row) return res.status(404).json({ error: 'Menu entry not found.' });
    return res.json(row);
  }
  res.json(state.weekly_menu);
});

// Query mess plans & hostel rooms
app.get('/api/plans', (_req, res) => {
  res.json({ plans: state.mess_plans, rooms: state.hostel_rooms });
});

// List student mess reviews
app.get('/api/reviews', (_req, res) => {
  const reviews = [...state.reviews].sort((a, b) => b.id - a.id).slice(0, 20);
  res.json({ summary: summarizeReviews(), reviews });
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

  const nextId = state.reviews.reduce((mx, r) => Math.max(mx, r.id), 0) + 1;
  const created = {
    id: nextId,
    student_name: studentName,
    hostel_block: hostelBlock,
    mess_type: messType,
    rating,
    comment,
    created_at: new Date().toISOString()
  };
  state.reviews.push(created);
  saveStore();

  res.status(201).json({
    message: 'Review posted!',
    review: created,
    summary: summarizeReviews()
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

  const nextId = state.queries.reduce((mx, q) => Math.max(mx, q.id), 0) + 1;
  state.queries.push({
    id: nextId,
    name,
    contact,
    topic,
    question,
    status: 'pending',
    admin_reply: '',
    created_at: new Date().toISOString()
  });
  saveStore();

  res.status(201).json({
    message: 'Question saved! You can view & answer it in the Admin Dashboard (/admin).',
    id: nextId
  });
});

// Campus Blocks & Landmarks Directory
app.get('/api/blocks', (req, res) => {
  const q = cleanText(req.query.q || '', 80).toLowerCase();
  const category = cleanText(req.query.category || '', 40);
  let rows = [...state.campus_blocks];
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

// Live Daily Meal Poll
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

  const row = state.meal_polls.find(
    (p) => p.poll_date === todayDate && p.cuisine === cuisine && p.meal_slot === mealSlot
  );

  if (row && prevVote !== vote) {
    if (prevVote === 'up') row.up_votes = Math.max(0, row.up_votes - 1);
    if (prevVote === 'down') row.down_votes = Math.max(0, row.down_votes - 1);
    if (vote === 'up') row.up_votes += 1;
    if (vote === 'down') row.down_votes += 1;
    saveStore();
  }

  const polls = state.meal_polls.filter((p) => p.poll_date === todayDate);
  res.json({ message: 'Vote recorded!', todayDate, polls });
});

// "Ask LPU Buddy" Smart Campus Assistant (JavaScript JSON Store backed)
function buildBuddyAnswer(rawMessage) {
  const q = rawMessage.toLowerCase();
  const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayDay = istNow.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

  if (/(kettle|iron|press|heater|induction|rod|toaster|banned|not allowed|mana hai|curfew|in-time|intime|document|reporting|pack|checklist|laundry)/.test(q)) {
    if (/(document|reporting|admission doc)/.test(q)) {
      return `📋 **Reporting Documents Checklist (Block 32):**\n• 10th & 12th Original Marksheets + 4 self-attested copies\n• Provisional Allotment Letter & Fee Receipt\n• Aadhaar Card + 6 passport-size photos\n• Anti-Ragging Affidavit & Medical Fitness Certificate`;
    }
    return `⚠️ **Hostel Rules & Banned Items:**\n• **Strictly Banned:** Electric kettle, immersion rod, clothes iron/press, induction cooktop, heater & toaster.\n• **Campus Alternatives:** Hot/cold RO water dispensers on every hostel floor + dedicated **Laundry & Pressing shop** inside each hostel.\n• **Must Pack:** 2 strong padlocks, single bedsheets, surge-protected extension board & toiletries.`;
  }

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
      const b = state.campus_blocks.find((row) => row.code === item.code);
      if (b) {
        return `📍 **${b.code} — ${b.title}**\n• **Nearest Entry:** ${b.nearest_gate} (${b.walk_mins})\n• **E-Rickshaw:** ${b.erickshaw_route}\n• **Inside:** ${b.highlights}`;
      }
    }
  }

  if (/(phagwara|jalandhar|cantt|station|train|airport|amritsar|chandigarh|reach|kaise aaye|kaise pahunch|auto|cab|nh-?44|address)/.test(q)) {
    return `🚆 **How to Reach LPU (NH-44, Phagwara):**\n• **Phagwara Jn (PGW):** ~7 km (12–15 min by direct auto/cab to Main Gate)\n• **Jalandhar Cantt (JRC):** ~14 km (20–25 min via NH-44 highway bus or shared auto)\n• **Jalandhar City (JUC):** ~20 km (30–35 min)\n• **Airports:** Amritsar (ATQ ~110 km) & Chandigarh (IXC ~145 km).`;
  }

  if (/(fee|fees|kitna|price|cost|kharcha|budget|seater|cooler|mess plan|a la carte|alacarte|non-?veg|chicken|edb)/.test(q)) {
    const plans = state.mess_plans;
    const rooms = state.hostel_rooms;

    if (/(non-?veg|chicken|egg|mutton)/.test(q)) {
      return `🍗 **Non-Veg Option Info:**\nInside campus all dining halls are 100% vegetarian, while an independent vendor adjacent to campus offers:\n• **3 Meals:** ₹75,000/yr · **2 Meals:** ₹65,000/yr · **1 Meal:** ₹55,000/yr.`;
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

    return `💰 **2026–27 Mess & Hostel Rates Overview:**\n• **Veg Mess Plans:** Standard 2-Meal (**₹37,800**), 3-Meal (**₹41,400**), 4-Meal (**₹45,000**), A la carte (**₹52,200**)\n• **Hostel Rooms:** 4-Seater Cooler (**₹93,000**), 4-Seater AC (**₹1,03,000**), 3-Seater AC (**₹1,23,000**), 2-Seater AC (**₹1,43,000**), 1-Seater AC (**₹1,63,000**).`;
  }

  if (/(menu|khana|breakfast|nashta|lunch|snacks|chai|dinner|raat|parantha|paneer|biryani|dosa|south indian|north indian|timing|kab khulta|mess open|aaj|kal|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.test(q)) {
    const cuisine = /south|dosa|idli|sambar|uttapam/.test(q) ? 'south' : 'north';
    let targetDay = todayDay;
    if (/kal|tomorrow/.test(q)) targetDay = (todayDay + 1) % 7;
    dayNames.forEach((name, idx) => {
      if (q.includes(name.toLowerCase())) targetDay = idx;
    });

    const row = state.weekly_menu.find((m) => m.cuisine === cuisine && m.day_of_week === targetDay);
    const cuisineLabel = cuisine === 'south' ? 'South Indian' : 'North Indian';
    const dayLabel = targetDay === todayDay ? `Today (${dayNames[targetDay]})` : dayNames[targetDay];

    if (row) {
      if (/dinner|raat/.test(q)) return `🍽️ **${dayLabel} · ${cuisineLabel} Dinner (7:00 – 9:00 PM):**\n${row.dinner}`;
      if (/lunch|dopahar/.test(q)) return `🍛 **${dayLabel} · ${cuisineLabel} Lunch (11:15 AM – 3:00 PM):**\n${row.lunch}`;
      if (/breakfast|nashta|subah/.test(q)) return `🥞 **${dayLabel} · ${cuisineLabel} Breakfast (7:15 – 9:30 AM):**\n${row.breakfast}`;
      if (/snack|chai|sham/.test(q)) return `☕ **${dayLabel} · ${cuisineLabel} Snacks (5:00 – 6:00 PM):**\n${row.snacks}`;
      return `🍴 **${dayLabel} · ${cuisineLabel} Mess Menu:**\n• **Breakfast:** ${row.breakfast}\n• **Lunch:** ${row.lunch}\n• **Snacks:** ${row.snacks}\n• **Dinner:** ${row.dinner}`;
    }
  }

  if (/(review|rating|worth|kaisa hai|accha hai|poll)/.test(q)) {
    const stats = summarizeReviews();
    const todayPolls = ensureTodayPolls(getISTDateKey());
    const totUp = todayPolls.reduce((s, r) => s + r.up_votes, 0);
    const totAll = todayPolls.reduce((s, r) => s + r.up_votes + r.down_votes, 0);
    const hitPct = totAll ? Math.round((totUp / totAll) * 100) : 86;
    return `⭐ **Live Student Mess Pulse:**\n• **Overall Rating:** **${stats.average} / 5 ★** (${stats.total} student reviews)\n• **Today's Live Food Poll:** **${hitPct}% Worth it 👍** across campus kitchens.`;
  }

  return `👋 **Hello! I am LPU Buddy** (Live API connected). Ask me in English or Hinglish:\n• *"What's for dinner today?"* or *"Sunday South Indian menu"*\n• *"Where is Block 34?"* or *"Nearest gate to Uni Hospital?"*\n• *"4-seater AC + 3 meal total fee?"*\n• *"Hostel banned items?"* or *"Route from Phagwara Jn?"*`;
}

app.post('/api/chat', (req, res) => {
  const message = cleanText(req.body.message, 300);
  if (!message) return res.status(400).json({ error: 'Please enter a question.' });
  res.json({ reply: buildBuddyAnswer(message), timestamp: new Date().toISOString() });
});

// ---------------- ADMIN API ----------------

app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const reviews = [...state.reviews].sort((a, b) => b.id - a.id);
  const queries = [...state.queries].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return b.id - a.id;
  });

  res.json({
    counts: {
      menuItems: state.weekly_menu.length,
      plans: state.mess_plans.length,
      reviews: reviews.length,
      pendingQueries: queries.filter((q) => q.status === 'pending').length,
      totalQueries: queries.length
    },
    menu: state.weekly_menu,
    plans: state.mess_plans,
    reviews,
    queries
  });
});

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

  const row = state.weekly_menu.find((m) => m.cuisine === cuisine && m.day_of_week === day);
  if (!row) return res.status(404).json({ error: 'Menu slot not found.' });
  row.breakfast = breakfast;
  row.lunch = lunch;
  row.snacks = snacks;
  row.dinner = dinner;
  saveStore();

  res.json({ message: 'Menu updated in JSON data store.', entry: row });
});

app.put('/api/admin/plans/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const fee = Number(req.body.fee);
  const subtitle = cleanText(req.body.subtitle, 180);

  if (!Number.isInteger(id) || !Number.isFinite(fee) || fee < 0 || !subtitle) {
    return res.status(400).json({ error: 'Valid plan ID, non-negative fee, and subtitle are required.' });
  }

  const plan = state.mess_plans.find((p) => p.id === id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });
  plan.fee = Math.round(fee);
  plan.subtitle = subtitle;
  saveStore();

  res.json({ message: 'Mess plan updated.', plan });
});

app.patch('/api/admin/queries/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status === 'pending' ? 'pending' : 'resolved';
  const adminReply = cleanText(req.body.admin_reply, 500);

  const query = state.queries.find((q) => q.id === id);
  if (!query) return res.status(404).json({ error: 'Query not found.' });
  query.status = status;
  query.admin_reply = adminReply;
  saveStore();

  res.json({ message: 'Query updated.', query });
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const idx = state.reviews.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Review not found.' });
  state.reviews.splice(idx, 1);
  saveStore();
  res.json({ message: 'Review removed.' });
});

app.get('/admin', (_req, res) => {
  res.sendFile('admin.html', { root: path.join(__dirname, 'public') });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`LPU Campus Guide Server running on port ${PORT}`);
  console.log(`Admin Dashboard available at /admin`);
});

function gracefulShutdown() {
  try { saveStore(); } catch {}
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
