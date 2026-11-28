const fs = require('node:fs');
const path = require('node:path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const jsonPath = path.join(dataDir, 'campus-data.json');

function getISTDateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

const INITIAL_DATA = {
  meal_timings: [
    { id: 1, slot_key: 'breakfast', title: 'Breakfast', time_label: '7:15 – 9:30 AM', start_min: 435, end_min: 570, summary: 'Parantha, idli/poha, stuffed toast, curd, tea & milk', sort_order: 1 },
    { id: 2, slot_key: 'lunch', title: 'Lunch', time_label: '11:15 AM – 3:00 PM', start_min: 675, end_min: 900, summary: 'Rajmah/dal, seasonal subzi, raita, rice & hot chapati', sort_order: 2 },
    { id: 3, slot_key: 'snacks', title: 'Tea & snacks', time_label: '5:00 – 6:00 PM', start_min: 1020, end_min: 1080, summary: 'Masala tea or coffee with rotating hot evening snacks', sort_order: 3 },
    { id: 4, slot_key: 'dinner', title: 'Dinner', time_label: '7:00 – 9:00 PM', start_min: 1140, end_min: 1260, summary: 'Dal, paneer/seasonal veg, chapati, rice, salad & dessert', sort_order: 4 }
  ],
  weekly_menu: [
    { id: 1, cuisine: 'north', day_of_week: 1, breakfast: 'Aloo parantha, plain curd, mango pickle, bread-butter & masala tea', lunch: 'Rajmah masala, aloo jeera, boondi raita, steamed rice, salad & chapati', snacks: 'Crisp samosa with tamarind chutney & cardamom chai', dinner: 'Dal makhani, mix seasonal veg, jeera rice, chapati, salad & rice kheer' },
    { id: 2, cuisine: 'north', day_of_week: 2, breakfast: 'Vegetable poha, stuffed besan toast, boiled sweet corn, milk & tea', lunch: 'Kadhi pakora, aloo gobhi, plain rice, chapati, papad & green salad', snacks: 'Bread pakora with mint chutney & hot tea', dinner: 'Yellow dal tadka, matar paneer, steamed rice, chapati & gulab jamun' },
    { id: 3, cuisine: 'north', day_of_week: 3, breakfast: 'Gobhi parantha, curd, pickle, cornflakes with milk & masala tea', lunch: 'Amritsari chole, khatte aloo, veg raita, pulao, chapati & onion salad', snacks: 'Veg Maggi / masala pasta & evening coffee', dinner: 'Dal fry, bhindi do pyaza / seasonal veg, rice, chapati & salad' },
    { id: 4, cuisine: 'north', day_of_week: 4, breakfast: 'Puri bhaji, sweet dalia, brown bread, jam & ginger tea', lunch: 'Black chana curry, lauki kofta, curd, steamed rice, chapati & fryums', snacks: 'Khasta kachori with tangy chutney & masala chai', dinner: 'Panchratan dal, kadai paneer / soya chaap, rice, chapati & halwa' },
    { id: 5, cuisine: 'north', day_of_week: 5, breakfast: 'Paneer/onion uttapam or stuffed kulcha, chutney, milk & tea', lunch: 'Rajmah raseela, aloo matar, cucumber raita, jeera rice & chapati', snacks: 'Aloo tikki / veg cutlet with sauce & hot tea', dinner: 'Dal tadka, dum aloo Kashmiri, rice, chapati, salad & custard' },
    { id: 6, cuisine: 'north', day_of_week: 6, breakfast: 'Ajwain parantha with aloo bhaji, curd, bread-butter & tea', lunch: 'White chana, seasonal tawa veg, veg pulao, boondi raita & chapati', snacks: 'Bhel puri / chana chaat & masala tea', dinner: 'Dal makhani, veg manchurian / hakka noodles combo, rice & chapati' },
    { id: 7, cuisine: 'north', day_of_week: 0, breakfast: 'Chole bhature / stuffed paneer parantha, sweet lassi or curd & tea', lunch: 'Special veg biryani, mirchi salan / mix veg raita, papad & salad', snacks: 'Veg grilled sandwich / patty with hot coffee or tea', dinner: 'Arhar dal tadka, shahi paneer, jeera rice, chapati & ice cream / sweet' },
    { id: 8, cuisine: 'south', day_of_week: 1, breakfast: 'Steamed idli, medu vada, drumstick sambar, coconut chutney & filter coffee', lunch: 'Sambar, rasam, cabbage poriyal, steamed rice, curd, chapati & appalam', snacks: 'Onion bajji with coconut chutney & hot tea/coffee', dinner: 'Tomato pappu, veg kurma, lemon rice, plain rice, chapati & payasam' },
    { id: 9, cuisine: 'south', day_of_week: 2, breakfast: 'Masala dosa, sambar, roasted gram & tomato chutneys, milk & tea', lunch: 'Kara kuzhambu, beans carrot poriyal, rasam, rice, buttermilk & chapati', snacks: 'Masala vada & hot cardamom tea', dinner: 'Dal fry, paneer chettinad-style veg, steamed rice, chapati & banana' },
    { id: 10, cuisine: 'south', day_of_week: 3, breakfast: 'Rava upma, kesari bath, coconut chutney, bread-butter & coffee', lunch: 'Arachuvitta sambar, aloo podimas, pepper rasam, rice, curd & papad', snacks: 'Sweet corn sundal & evening tea', dinner: 'Spinach dal (keerai kootu), mix veg curry, tamarind rice & chapati' },
    { id: 11, cuisine: 'south', day_of_week: 4, breakfast: 'Onion uttapam, sambar, ginger chutney, boiled sprouts & tea', lunch: 'Mor kuzhambu, beetroot poriyal, rasam, steamed rice, curd & chapati', snacks: 'Punugulu / mysore bonda with peanut chutney & tea', dinner: 'Toor dal tadka, meal-maker / paneer masala, jeera rice, chapati & sweet' },
    { id: 12, cuisine: 'south', day_of_week: 5, breakfast: 'Pongal, medu vada, sambar, coconut chutney & hot coffee', lunch: 'Vegetable sambar, tindora fry, garlic rasam, rice, curd & fryums', snacks: 'Veg puff / samosa & hot tea', dinner: 'Dal tadka, avial, steamed rice, chapati, pickle & semiya payasam' },
    { id: 13, cuisine: 'south', day_of_week: 6, breakfast: 'Set dosa, vegetable sagu, coconut chutney & filter coffee', lunch: 'Vatha kuzhambu, snake gourd kootu, rasam, steamed rice, curd & chapati', snacks: 'Murukku / masala peanuts & ginger chai', dinner: 'Tomato dal, gobi masala, veg fried rice, plain rice & chapati' },
    { id: 14, cuisine: 'south', day_of_week: 0, breakfast: 'Paper roast dosa / poori masala, sambar, chutney & coffee', lunch: 'Hyderabadi veg dum biryani, onion pachadi, mirchi gravy & papad', snacks: 'Banana bajji / pakora & hot tea', dinner: 'Sambar, paneer butter masala, puliyodarai, steamed rice, chapati & sweet' }
  ],
  mess_plans: [
    { id: 1, plan_key: 'std4', name: 'Standard · 4 meals', subtitle: 'Breakfast, lunch, evening snacks & dinner (~₹150/day)', fee: 45000, category: 'veg', period_label: '/ session', sort_order: 1 },
    { id: 2, plan_key: 'std3', name: 'Standard · 3 meals', subtitle: 'Breakfast, lunch & dinner (~₹138/day)', fee: 41400, category: 'veg', period_label: '/ session', sort_order: 2 },
    { id: 3, plan_key: 'std2', name: 'Standard · 2 meals', subtitle: 'Breakfast + dinner, lunch + dinner, or breakfast + lunch', fee: 37800, category: 'veg', period_label: '/ session', sort_order: 3 },
    { id: 4, plan_key: 'alacarte', name: 'A la carte · 4 meals', subtitle: 'Choice of dishes across offered cuisines at selected locations', fee: 52200, category: 'veg', period_label: '/ session', sort_order: 4 },
    { id: 5, plan_key: 'nv3', name: '3 meals plan', subtitle: 'Independent vendor outside campus', fee: 75000, category: 'nonveg_vendor', period_label: '/ year', sort_order: 5 },
    { id: 6, plan_key: 'nv2', name: '2 meals plan', subtitle: 'Independent vendor outside campus', fee: 65000, category: 'nonveg_vendor', period_label: '/ year', sort_order: 6 },
    { id: 7, plan_key: 'nv1', name: '1 meal plan', subtitle: 'Independent vendor outside campus', fee: 55000, category: 'nonveg_vendor', period_label: '/ year', sort_order: 7 }
  ],
  hostel_rooms: [
    { id: 1, room_key: 'none', name: 'Mess only (Exclude room fee)', fee: 0, electricity_units: 'Mess only', sort_order: 1 },
    { id: 2, room_key: '4s_cooler', name: '4-Seater Air-Cooled', fee: 93000, electricity_units: '300 free electricity units', sort_order: 2 },
    { id: 3, room_key: '4s_ac', name: '4-Seater AC Room', fee: 103000, electricity_units: '500 free electricity units', sort_order: 3 },
    { id: 4, room_key: '3s_cooler', name: '3-Seater Air-Cooled', fee: 108000, electricity_units: '350 free electricity units', sort_order: 4 },
    { id: 5, room_key: '3s_ac', name: '3-Seater AC Room', fee: 123000, electricity_units: '550 free electricity units', sort_order: 5 },
    { id: 6, room_key: '2s_ac', name: '2-Seater AC Room', fee: 143000, electricity_units: '750 free electricity units', sort_order: 6 },
    { id: 7, room_key: '1s_ac', name: '1-Seater AC Room', fee: 163000, electricity_units: '1,000 free electricity units', sort_order: 7 },
    { id: 8, room_key: 'apt_4s', name: '4-Seater AC Apartment', fee: 110000, electricity_units: 'Studio apartment policy', sort_order: 8 }
  ],
  reviews: [
    { id: 1, student_name: 'Rohan Sharma', hostel_block: 'BH-1', mess_type: 'Standard · 4 meals (North)', rating: 4, comment: 'Breakfast aloo parantha and evening samosa + chai slot are genuinely solid. Automated chapatis stay soft during peak hours.', created_at: '2026-11-10T10:00:00Z' },
    { id: 2, student_name: 'Ananya Nair', hostel_block: 'GH-3', mess_type: 'South Indian Mess', rating: 5, comment: 'Really glad LPU has a dedicated South Indian mess option—morning idli/dosa with filter coffee feels close to home.', created_at: '2026-11-10T10:05:00Z' },
    { id: 3, student_name: 'Harshvardhan Verma', hostel_block: 'BH-5', mess_type: 'A la carte · 4 meals', rating: 4, comment: 'Slightly higher fee than standard mess, but picking paneer/chaap dishes and skipping fixed plates is worth it during exams.', created_at: '2026-11-10T10:10:00Z' },
    { id: 4, student_name: 'Simran Kaur', hostel_block: 'GH-2', mess_type: 'Standard · 3 meals', rating: 4, comment: 'Clean dining hall and Sunday veg biryani + paneer dinner is great. Packed breakfast works well when 8 AM labs are scheduled.', created_at: '2026-11-10T10:15:00Z' }
  ],
  queries: [
    {
      id: 1,
      name: 'Aman Gupta (B.Tech CSE Fresher)',
      contact: 'aman.fresher@example.com',
      topic: 'Mess Plan',
      question: 'Can I book Standard 3 meals right now during Early Decision and upgrade to 4 meals after reaching campus?',
      status: 'resolved',
      admin_reply: 'Yes! UMS allows upgrading from 2/3 meals to 4 meals or A la carte by paying the pro-rata difference.',
      created_at: '2026-11-10T09:00:00Z'
    }
  ],
  campus_blocks: [
    { id: 1, code: 'Block 32', title: 'Admission & UMS Student Relationship Hub', category: 'Admin', nearest_gate: 'Main Gate 1A', walk_mins: '6 min walk', erickshaw_route: 'Gate 1A → Block 32 Plaza (₹10)', highlights: 'Fresher reporting, document verification, fee counter, ID card & biometric desk', map_query: 'Block 32 Lovely Professional University Phagwara', sort_order: 1 },
    { id: 2, code: 'Block 34', title: 'School of Computer Science & Engineering (CSE)', category: 'Academic', nearest_gate: 'Main Gate 1B', walk_mins: '11 min walk', erickshaw_route: 'Gate 1B → Block 34 Stand (₹10)', highlights: 'CSE/IT labs, coding studios, placement cells, basement Nescafe & print shop', map_query: 'Block 34 Lovely Professional University Phagwara', sort_order: 2 },
    { id: 3, code: 'Block 33 & 36', title: 'ECE, Robotics & Mechanical Engineering', category: 'Academic', nearest_gate: 'Main Gate 1B', walk_mins: '12 min walk', erickshaw_route: 'Gate 1B → Engineering Spine (₹10)', highlights: 'Electronics labs, CAD studios, workshops & student innovation garages', map_query: 'Block 33 Lovely Professional University Phagwara', sort_order: 3 },
    { id: 4, code: 'Block 14', title: 'Mittal School of Business (MSB)', category: 'Academic', nearest_gate: 'Main Gate 1A', walk_mins: '7 min walk', erickshaw_route: 'Gate 1A → MSB Chowk (₹10)', highlights: 'MBA/BBA/B.Com lecture theatres, finance terminal lab & corporate auditoriums', map_query: 'Mittal School of Business LPU Phagwara', sort_order: 4 },
    { id: 5, code: 'Block 15 · Uni Mall', title: 'Uni Mall & Central Food Plaza', category: 'Food & Retail', nearest_gate: 'Main Gate 1A', walk_mins: '8 min walk', erickshaw_route: 'Gate 1A → Uni Mall Drop (₹10)', highlights: 'Multi-storey student mall: food courts, banks/ATMs, stationery, salon & bowling', map_query: 'Uni Mall Lovely Professional University', sort_order: 5 },
    { id: 6, code: 'Block 37', title: 'Central Library & Knowledge Centre', category: 'Academic', nearest_gate: 'Main Gate 1B', walk_mins: '10 min walk', erickshaw_route: 'Uni Mall → Library Square (₹10)', highlights: '9-storey central library, silent reading halls, e-journals & exam study zones', map_query: 'Central Library Lovely Professional University', sort_order: 6 },
    { id: 7, code: 'Block 6 · Hospital', title: 'Uni Hospital (24×7 Medical & Pharmacy)', category: 'Medical', nearest_gate: 'Main Gate 1A', walk_mins: '4 min walk', erickshaw_route: 'Right inside Gate 1A · 24×7 Ambulance', highlights: '24×7 emergency & OPD doctors, in-house chemist shop, physiotherapy & sick bay', map_query: 'Uni Hospital Lovely Professional University', sort_order: 7 },
    { id: 8, code: 'Unipolis & SDM', title: 'Baldev Raj Mittal Unipolis & SDM Auditorium', category: 'Landmarks', nearest_gate: 'Main Gate 1A', walk_mins: '5 min walk', erickshaw_route: 'Gate 1A Main Avenue', highlights: 'Freshers Induction, convocations, YouthVibe fests & major celebrity events', map_query: 'Unipolis Lovely Professional University', sort_order: 8 },
    { id: 9, code: 'RoboPark', title: 'RoboPark & Innovation Lawn', category: 'Landmarks', nearest_gate: 'Main Gate 1B', walk_mins: '9 min walk', erickshaw_route: 'Uni Mall → Block 32 Crossing (₹10)', highlights: 'Giant scrap-metal robot sculptures, open-air hangout lawn & tech expos', map_query: 'Lovely Professional University Phagwara', sort_order: 9 },
    { id: 10, code: 'Indoor Stadium', title: 'Shanti Devi Mittal Sports Complex & Pool', category: 'Landmarks', nearest_gate: 'Gate 2', walk_mins: '13 min walk', erickshaw_route: 'Gate 1B → Sports Complex Shuttle (₹10)', highlights: 'Olympic-size pool, badminton courts, gym, shooting range & basketball arena', map_query: 'Indoor Sports Complex Lovely Professional University', sort_order: 10 },
    { id: 11, code: 'BH-1 to BH-4', title: 'Boys Hostels (Central Residential Zone)', category: 'Hostels', nearest_gate: 'Main Gate 1B', walk_mins: '13 min walk', erickshaw_route: 'Gate 1B → Boys Hostel Spine (₹10)', highlights: '4/3/2-seater AC & cooler rooms, North/South mess halls, laundry, tuck shop & gym', map_query: 'Boys Hostel BH1 Lovely Professional University', sort_order: 11 },
    { id: 12, code: 'BH-5 to BH-8 & Apts', title: 'Boys Hostels (North Spine) & Studio Apartments', category: 'Hostels', nearest_gate: 'Gate 2', walk_mins: '17 min walk', erickshaw_route: 'Gate 1B / Gate 2 → BH-6 Shuttle (₹10)', highlights: 'High-rise hostel blocks, A la carte dining counters, night canteens & outdoor courts', map_query: 'Boys Hostel BH5 Lovely Professional University', sort_order: 12 },
    { id: 13, code: 'GH-1 to GH-6', title: 'Girls Hostels (Gated Central Zone)', category: 'Hostels', nearest_gate: 'Main Gate 1A', walk_mins: '8 min walk', erickshaw_route: 'Gate 1A → Girls Hostel Gate (₹10)', highlights: '24×7 biometric security near Uni Mall, in-house mess, tuck shops, parlor & study room', map_query: 'Girls Hostel GH1 Lovely Professional University', sort_order: 13 },
    { id: 14, code: 'Block 29 & 30', title: 'Chancellor’s Office & Examination Wing', category: 'Admin', nearest_gate: 'Main Gate 1A', walk_mins: '6 min walk', erickshaw_route: 'Gate 1A → Admin Plaza', highlights: 'Examination controller, transcripts, international office & central administration', map_query: 'Block 30 Lovely Professional University', sort_order: 14 },
    { id: 15, code: 'Block 25–28', title: 'Law, Architecture, Design & Hotel Mgmt', category: 'Academic', nearest_gate: 'Main Gate 1A', walk_mins: '9 min walk', erickshaw_route: 'Uni Mall → Design Spine (₹10)', highlights: 'Moot court, fashion & interior studios, culinary kitchens & training restaurant', map_query: 'School of Design Lovely Professional University', sort_order: 15 },
    { id: 16, code: 'Block 55–57', title: 'Agriculture, Pharmacy & Bioengineering', category: 'Academic', nearest_gate: 'Gate 2', walk_mins: '15 min walk', erickshaw_route: 'Main Gate → Block 55 E-Rickshaw (₹10)', highlights: 'Pharmaceutical labs, polyhouses, agronomy research plots & food-tech labs', map_query: 'Block 55 Lovely Professional University', sort_order: 16 }
  ],
  meal_polls: []
};

function loadStore() {
  if (fs.existsSync(jsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return { ...INITIAL_DATA, ...parsed };
    } catch {}
  }
  const copy = JSON.parse(JSON.stringify(INITIAL_DATA));
  fs.writeFileSync(jsonPath, JSON.stringify(copy, null, 2), 'utf8');
  return copy;
}

let state = loadStore();

function saveStore() {
  const tmpPath = `${jsonPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmpPath, jsonPath);
}

function ensureTodayPolls(dateKey = getISTDateKey()) {
  const todayRows = state.meal_polls.filter((p) => p.poll_date === dateKey);
  if (todayRows.length === 0) {
    const baseline = [
      ['north', 'breakfast', 22, 3],
      ['north', 'lunch', 29, 5],
      ['north', 'snacks', 19, 2],
      ['north', 'dinner', 34, 4],
      ['south', 'breakfast', 18, 2],
      ['south', 'lunch', 21, 3],
      ['south', 'snacks', 15, 2],
      ['south', 'dinner', 24, 3]
    ];
    for (const [cuisine, meal_slot, up_votes, down_votes] of baseline) {
      state.meal_polls.push({ poll_date: dateKey, cuisine, meal_slot, up_votes, down_votes });
    }
    saveStore();
  }
  return state.meal_polls.filter((p) => p.poll_date === dateKey);
}

ensureTodayPolls();

module.exports = { state, saveStore, jsonPath, getISTDateKey, ensureTodayPolls };
