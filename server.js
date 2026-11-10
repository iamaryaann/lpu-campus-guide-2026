const path = require('node:path');
const express = require('express');
const { db } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'lpu2026';

app.use(express.json({ limit: '64kb' }));
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

app.listen(PORT, () => {
  console.log(`LPU Campus Guide Full-Stack Server running at http://127.0.0.1:${PORT}`);
  console.log(`Admin Dashboard available at http://127.0.0.1:${PORT}/admin (Default key: ${ADMIN_KEY})`);
});
