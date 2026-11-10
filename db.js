const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'campus.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS meal_timings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    time_label TEXT NOT NULL,
    start_min INTEGER NOT NULL,
    end_min INTEGER NOT NULL,
    summary TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weekly_menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuisine TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    breakfast TEXT NOT NULL,
    lunch TEXT NOT NULL,
    snacks TEXT NOT NULL,
    dinner TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(cuisine, day_of_week)
  );

  CREATE TABLE IF NOT EXISTS mess_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    fee INTEGER NOT NULL,
    category TEXT NOT NULL,
    period_label TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hostel_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    fee INTEGER NOT NULL,
    electricity_units TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    hostel_block TEXT NOT NULL,
    mess_type TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_reply TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

function seedDatabase() {
  const timingCount = db.prepare('SELECT COUNT(*) AS count FROM meal_timings').get().count;
  if (timingCount === 0) {
    const insertTiming = db.prepare(`
      INSERT INTO meal_timings (slot_key, title, time_label, start_min, end_min, summary, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const timings = [
      ['breakfast', 'Breakfast', '7:15 – 9:30 AM', 435, 570, 'Parantha, idli/poha, stuffed toast, curd, tea & milk', 1],
      ['lunch', 'Lunch', '11:15 AM – 3:00 PM', 675, 900, 'Rajmah/dal, seasonal subzi, raita, rice & hot chapati', 2],
      ['snacks', 'Tea & snacks', '5:00 – 6:00 PM', 1020, 1080, 'Masala tea or coffee with rotating hot evening snacks', 3],
      ['dinner', 'Dinner', '7:00 – 9:00 PM', 1140, 1260, 'Dal, paneer/seasonal veg, chapati, rice, salad & dessert', 4]
    ];
    for (const row of timings) insertTiming.run(...row);
  }

  const menuCount = db.prepare('SELECT COUNT(*) AS count FROM weekly_menu').get().count;
  if (menuCount === 0) {
    const insertMenu = db.prepare(`
      INSERT INTO weekly_menu (cuisine, day_of_week, breakfast, lunch, snacks, dinner)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const northMenu = {
      1: ['Aloo parantha, plain curd, mango pickle, bread-butter & masala tea', 'Rajmah masala, aloo jeera, boondi raita, steamed rice, salad & chapati', 'Crisp samosa with tamarind chutney & cardamom chai', 'Dal makhani, mix seasonal veg, jeera rice, chapati, salad & rice kheer'],
      2: ['Vegetable poha, stuffed besan toast, boiled sweet corn, milk & tea', 'Kadhi pakora, aloo gobhi, plain rice, chapati, papad & green salad', 'Bread pakora with mint chutney & hot tea', 'Yellow dal tadka, matar paneer, steamed rice, chapati & gulab jamun'],
      3: ['Gobhi parantha, curd, pickle, cornflakes with milk & masala tea', 'Amritsari chole, khatte aloo, veg raita, pulao, chapati & onion salad', 'Veg Maggi / masala pasta & evening coffee', 'Dal fry, bhindi do pyaza / seasonal veg, rice, chapati & salad'],
      4: ['Puri bhaji, sweet dalia, brown bread, jam & ginger tea', 'Black chana curry, lauki kofta, curd, steamed rice, chapati & fryums', 'Khasta kachori with tangy chutney & masala chai', 'Panchratan dal, kadai paneer / soya chaap, rice, chapati & halwa'],
      5: ['Paneer/onion uttapam or stuffed kulcha, chutney, milk & tea', 'Rajmah raseela, aloo matar, cucumber raita, jeera rice & chapati', 'Aloo tikki / veg cutlet with sauce & hot tea', 'Dal tadka, dum aloo Kashmiri, rice, chapati, salad & custard'],
      6: ['Ajwain parantha with aloo bhaji, curd, bread-butter & tea', 'White chana, seasonal tawa veg, veg pulao, boondi raita & chapati', 'Bhel puri / chana chaat & masala tea', 'Dal makhani, veg manchurian / hakka noodles combo, rice & chapati'],
      0: ['Chole bhature / stuffed paneer parantha, sweet lassi or curd & tea', 'Special veg biryani, mirchi salan / mix veg raita, papad & salad', 'Veg grilled sandwich / patty with hot coffee or tea', 'Arhar dal tadka, shahi paneer, jeera rice, chapati & ice cream / sweet']
    };

    const southMenu = {
      1: ['Steamed idli, medu vada, drumstick sambar, coconut chutney & filter coffee', 'Sambar, rasam, cabbage poriyal, steamed rice, curd, chapati & appalam', 'Onion bajji with coconut chutney & hot tea/coffee', 'Tomato pappu, veg kurma, lemon rice, plain rice, chapati & payasam'],
      2: ['Masala dosa, sambar, roasted gram & tomato chutneys, milk & tea', 'Kara kuzhambu, beans carrot poriyal, rasam, rice, buttermilk & chapati', 'Masala vada & hot cardamom tea', 'Dal fry, paneer chettinad-style veg, steamed rice, chapati & banana'],
      3: ['Rava upma, kesari bath, coconut chutney, bread-butter & coffee', 'Arachuvitta sambar, aloo podimas, pepper rasam, rice, curd & papad', 'Sweet corn sundal & evening tea', 'Spinach dal (keerai kootu), mix veg curry, tamarind rice & chapati'],
      4: ['Onion uttapam, sambar, ginger chutney, boiled sprouts & tea', 'Mor kuzhambu, beetroot poriyal, rasam, steamed rice, curd & chapati', 'Punugulu / mysore bonda with peanut chutney & tea', 'Toor dal tadka, meal-maker / paneer masala, jeera rice, chapati & sweet'],
      5: ['Pongal, medu vada, sambar, coconut chutney & hot coffee', 'Vegetable sambar, tindora fry, garlic rasam, rice, curd & fryums', 'Veg puff / samosa & hot tea', 'Dal tadka, avial, steamed rice, chapati, pickle & semiya payasam'],
      6: ['Set dosa, vegetable sagu, coconut chutney & filter coffee', 'Vatha kuzhambu, snake gourd kootu, rasam, steamed rice, curd & chapati', 'Murukku / masala peanuts & ginger chai', 'Tomato dal, gobi masala, veg fried rice, plain rice & chapati'],
      0: ['Paper roast dosa / poori masala, sambar, chutney & coffee', 'Hyderabadi veg dum biryani, onion pachadi, mirchi gravy & papad', 'Banana bajji / pakora & hot tea', 'Sambar, paneer butter masala, puliyodarai, steamed rice, chapati & sweet']
    };

    for (const [day, meals] of Object.entries(northMenu)) {
      insertMenu.run('north', Number(day), ...meals);
    }
    for (const [day, meals] of Object.entries(southMenu)) {
      insertMenu.run('south', Number(day), ...meals);
    }
  }

  const plansCount = db.prepare('SELECT COUNT(*) AS count FROM mess_plans').get().count;
  if (plansCount === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO mess_plans (plan_key, name, subtitle, fee, category, period_label, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const plans = [
      ['std4', 'Standard · 4 meals', 'Breakfast, lunch, evening snacks & dinner (~₹150/day)', 45000, 'veg', '/ session', 1],
      ['std3', 'Standard · 3 meals', 'Breakfast, lunch & dinner (~₹138/day)', 41400, 'veg', '/ session', 2],
      ['std2', 'Standard · 2 meals', 'Breakfast + dinner, lunch + dinner, or breakfast + lunch', 37800, 'veg', '/ session', 3],
      ['alacarte', 'A la carte · 4 meals', 'Choice of dishes across offered cuisines at selected locations', 52200, 'veg', '/ session', 4],
      ['nv3', '3 meals plan', 'Independent vendor outside campus', 75000, 'nonveg_vendor', '/ year', 5],
      ['nv2', '2 meals plan', 'Independent vendor outside campus', 65000, 'nonveg_vendor', '/ year', 6],
      ['nv1', '1 meal plan', 'Independent vendor outside campus', 55000, 'nonveg_vendor', '/ year', 7]
    ];
    for (const p of plans) insertPlan.run(...p);
  }

  const roomsCount = db.prepare('SELECT COUNT(*) AS count FROM hostel_rooms').get().count;
  if (roomsCount === 0) {
    const insertRoom = db.prepare(`
      INSERT INTO hostel_rooms (room_key, name, fee, electricity_units, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    const rooms = [
      ['none', 'Mess only (Exclude room fee)', 0, 'Mess only', 1],
      ['4s_cooler', '4-Seater Air-Cooled', 93000, '300 free electricity units', 2],
      ['4s_ac', '4-Seater AC Room', 103000, '500 free electricity units', 3],
      ['3s_cooler', '3-Seater Air-Cooled', 108000, '350 free electricity units', 4],
      ['3s_ac', '3-Seater AC Room', 123000, '550 free electricity units', 5],
      ['2s_ac', '2-Seater AC Room', 143000, '750 free electricity units', 6],
      ['1s_ac', '1-Seater AC Room', 163000, '1,000 free electricity units', 7],
      ['apt_4s', '4-Seater AC Apartment', 110000, 'Studio apartment policy', 8]
    ];
    for (const r of rooms) insertRoom.run(...r);
  }

  const reviewsCount = db.prepare('SELECT COUNT(*) AS count FROM reviews').get().count;
  if (reviewsCount === 0) {
    const insertReview = db.prepare(`
      INSERT INTO reviews (student_name, hostel_block, mess_type, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);
    const sampleReviews = [
      ['Rohan Sharma', 'BH-1', 'Standard · 4 meals (North)', 4, 'Breakfast aloo parantha and evening samosa + chai slot are genuinely solid. Automated chapatis stay soft during peak hours.'],
      ['Ananya Nair', 'GH-3', 'South Indian Mess', 5, 'Really glad LPU has a dedicated South Indian mess option—morning idli/dosa with filter coffee feels close to home.'],
      ['Harshvardhan Verma', 'BH-5', 'A la carte · 4 meals', 4, 'Slightly higher fee than standard mess, but picking paneer/chaap dishes and skipping fixed plates is worth it during exams.'],
      ['Simran Kaur', 'GH-2', 'Standard · 3 meals', 4, 'Clean dining hall and Sunday veg biryani + paneer dinner is great. Packed breakfast works well when 8 AM labs are scheduled.']
    ];
    for (const rev of sampleReviews) insertReview.run(...rev);
  }

  const queriesCount = db.prepare('SELECT COUNT(*) AS count FROM queries').get().count;
  if (queriesCount === 0) {
    db.prepare(`
      INSERT INTO queries (name, contact, topic, question, status, admin_reply)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Aman Gupta (B.Tech CSE Fresher)',
      'aman.fresher@example.com',
      'Mess Plan',
      'Can I book Standard 3 meals right now during Early Decision and upgrade to 4 meals after reaching campus?',
      'resolved',
      'Yes! UMS allows upgrading from 2/3 meals to 4 meals or A la carte by paying the pro-rata difference.'
    );
  }
}

seedDatabase();

module.exports = { db, dbPath };
