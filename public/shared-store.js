(() => {
  const STORAGE_KEY = 'lpu_campus_guide_store_v2';

  const SEED_STATE = {
    timings: [
      { id: 1, slot_key: 'breakfast', title: 'Breakfast', time_label: '7:15 – 9:30 AM', start_min: 435, end_min: 570, summary: 'Parantha, idli/poha, stuffed toast, curd, tea & milk', sort_order: 1 },
      { id: 2, slot_key: 'lunch', title: 'Lunch', time_label: '11:15 AM – 3:00 PM', start_min: 675, end_min: 900, summary: 'Rajmah/dal, seasonal subzi, raita, rice & hot chapati', sort_order: 2 },
      { id: 3, slot_key: 'snacks', title: 'Tea & snacks', time_label: '5:00 – 6:00 PM', start_min: 1020, end_min: 1080, summary: 'Masala tea or coffee with rotating hot evening snacks', sort_order: 3 },
      { id: 4, slot_key: 'dinner', title: 'Dinner', time_label: '7:00 – 9:00 PM', start_min: 1140, end_min: 1260, summary: 'Dal, paneer/seasonal veg, chapati, rice, salad & dessert', sort_order: 4 }
    ],
    menu: [
      { cuisine: 'north', day_of_week: 1, breakfast: 'Aloo parantha, plain curd, mango pickle, bread-butter & masala tea', lunch: 'Rajmah masala, aloo jeera, boondi raita, steamed rice, salad & chapati', snacks: 'Crisp samosa with tamarind chutney & cardamom chai', dinner: 'Dal makhani, mix seasonal veg, jeera rice, chapati, salad & rice kheer' },
      { cuisine: 'north', day_of_week: 2, breakfast: 'Vegetable poha, stuffed besan toast, boiled sweet corn, milk & tea', lunch: 'Kadhi pakora, aloo gobhi, plain rice, chapati, papad & green salad', snacks: 'Bread pakora with mint chutney & hot tea', dinner: 'Yellow dal tadka, matar paneer, steamed rice, chapati & gulab jamun' },
      { cuisine: 'north', day_of_week: 3, breakfast: 'Gobhi parantha, curd, pickle, cornflakes with milk & masala tea', lunch: 'Amritsari chole, khatte aloo, veg raita, pulao, chapati & onion salad', snacks: 'Veg Maggi / masala pasta & evening coffee', dinner: 'Dal fry, bhindi do pyaza / seasonal veg, rice, chapati & salad' },
      { cuisine: 'north', day_of_week: 4, breakfast: 'Puri bhaji, sweet dalia, brown bread, jam & ginger tea', lunch: 'Black chana curry, lauki kofta, curd, steamed rice, chapati & fryums', snacks: 'Khasta kachori with tangy chutney & masala chai', dinner: 'Panchratan dal, kadai paneer / soya chaap, rice, chapati & halwa' },
      { cuisine: 'north', day_of_week: 5, breakfast: 'Paneer/onion uttapam or stuffed kulcha, chutney, milk & tea', lunch: 'Rajmah raseela, aloo matar, cucumber raita, jeera rice & chapati', snacks: 'Aloo tikki / veg cutlet with sauce & hot tea', dinner: 'Dal tadka, dum aloo Kashmiri, rice, chapati, salad & custard' },
      { cuisine: 'north', day_of_week: 6, breakfast: 'Ajwain parantha with aloo bhaji, curd, bread-butter & tea', lunch: 'White chana, seasonal tawa veg, veg pulao, boondi raita & chapati', snacks: 'Bhel puri / chana chaat & masala tea', dinner: 'Dal makhani, veg manchurian / hakka noodles combo, rice & chapati' },
      { cuisine: 'north', day_of_week: 0, breakfast: 'Chole bhature / stuffed paneer parantha, sweet lassi or curd & tea', lunch: 'Special veg biryani, mirchi salan / mix veg raita, papad & salad', snacks: 'Veg grilled sandwich / patty with hot coffee or tea', dinner: 'Arhar dal tadka, shahi paneer, jeera rice, chapati & ice cream / sweet' },
      { cuisine: 'south', day_of_week: 1, breakfast: 'Steamed idli, medu vada, drumstick sambar, coconut chutney & filter coffee', lunch: 'Sambar, rasam, cabbage poriyal, steamed rice, curd, chapati & appalam', snacks: 'Onion bajji with coconut chutney & hot tea/coffee', dinner: 'Tomato pappu, veg kurma, lemon rice, plain rice, chapati & payasam' },
      { cuisine: 'south', day_of_week: 2, breakfast: 'Masala dosa, sambar, roasted gram & tomato chutneys, milk & tea', lunch: 'Kara kuzhambu, beans carrot poriyal, rasam, rice, buttermilk & chapati', snacks: 'Masala vada & hot cardamom tea', dinner: 'Dal fry, paneer chettinad-style veg, steamed rice, chapati & banana' },
      { cuisine: 'south', day_of_week: 3, breakfast: 'Rava upma, kesari bath, coconut chutney, bread-butter & coffee', lunch: 'Arachuvitta sambar, aloo podimas, pepper rasam, rice, curd & papad', snacks: 'Sweet corn sundal & evening tea', dinner: 'Spinach dal (keerai kootu), mix veg curry, tamarind rice & chapati' },
      { cuisine: 'south', day_of_week: 4, breakfast: 'Onion uttapam, sambar, ginger chutney, boiled sprouts & tea', lunch: 'Mor kuzhambu, beetroot poriyal, rasam, steamed rice, curd & chapati', snacks: 'Punugulu / mysore bonda with peanut chutney & tea', dinner: 'Toor dal tadka, meal-maker / paneer masala, jeera rice, chapati & sweet' },
      { cuisine: 'south', day_of_week: 5, breakfast: 'Pongal, medu vada, sambar, coconut chutney & hot coffee', lunch: 'Vegetable sambar, tindora fry, garlic rasam, rice, curd & fryums', snacks: 'Veg puff / samosa & hot tea', dinner: 'Dal tadka, avial, steamed rice, chapati, pickle & semiya payasam' },
      { cuisine: 'south', day_of_week: 6, breakfast: 'Set dosa, vegetable sagu, coconut chutney & filter coffee', lunch: 'Vatha kuzhambu, snake gourd kootu, rasam, steamed rice, curd & chapati', snacks: 'Murukku / masala peanuts & ginger chai', dinner: 'Tomato dal, gobi masala, veg fried rice, plain rice & chapati' },
      { cuisine: 'south', day_of_week: 0, breakfast: 'Paper roast dosa / poori masala, sambar, chutney & coffee', lunch: 'Hyderabadi veg dum biryani, onion pachadi, mirchi gravy & papad', snacks: 'Banana bajji / pakora & hot tea', dinner: 'Sambar, paneer butter masala, puliyodarai, steamed rice, chapati & sweet' }
    ],
    plans: [
      { id: 1, plan_key: 'std4', name: 'Standard · 4 meals', subtitle: 'Breakfast, lunch, evening snacks & dinner (~₹150/day)', fee: 45000, category: 'veg', period_label: '/ session', sort_order: 1 },
      { id: 2, plan_key: 'std3', name: 'Standard · 3 meals', subtitle: 'Breakfast, lunch & dinner (~₹138/day)', fee: 41400, category: 'veg', period_label: '/ session', sort_order: 2 },
      { id: 3, plan_key: 'std2', name: 'Standard · 2 meals', subtitle: 'Breakfast + dinner, lunch + dinner, or breakfast + lunch', fee: 37800, category: 'veg', period_label: '/ session', sort_order: 3 },
      { id: 4, plan_key: 'alacarte', name: 'A la carte · 4 meals', subtitle: 'Choice of dishes across offered cuisines at selected locations', fee: 52200, category: 'veg', period_label: '/ session', sort_order: 4 },
      { id: 5, plan_key: 'nv3', name: '3 meals plan', subtitle: 'Independent vendor outside campus', fee: 75000, category: 'nonveg_vendor', period_label: '/ year', sort_order: 5 },
      { id: 6, plan_key: 'nv2', name: '2 meals plan', subtitle: 'Independent vendor outside campus', fee: 65000, category: 'nonveg_vendor', period_label: '/ year', sort_order: 6 },
      { id: 7, plan_key: 'nv1', name: '1 meal plan', subtitle: 'Independent vendor outside campus', fee: 55000, category: 'nonveg_vendor', period_label: '/ year', sort_order: 7 }
    ],
    rooms: [
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
      { id: 4, student_name: 'Simran Kaur', hostel_block: 'GH-2', mess_type: 'Standard · 3 meals', rating: 4, comment: 'Clean dining hall and Sunday veg biryani + paneer dinner is great. Packed breakfast works well when 8 AM labs are scheduled.' },
      { id: 3, student_name: 'Harshvardhan Verma', hostel_block: 'BH-5', mess_type: 'A la carte · 4 meals', rating: 4, comment: 'Slightly higher fee than standard mess, but picking paneer/chaap dishes and skipping fixed plates is worth it during exams.' },
      { id: 2, student_name: 'Ananya Nair', hostel_block: 'GH-3', mess_type: 'South Indian Mess', rating: 5, comment: 'Really glad LPU has a dedicated South Indian mess option—morning idli/dosa with filter coffee feels close to home.' },
      { id: 1, student_name: 'Rohan Sharma', hostel_block: 'BH-1', mess_type: 'Standard · 4 meals (North)', rating: 4, comment: 'Breakfast aloo parantha and evening samosa + chai slot are genuinely solid. Automated chapatis stay soft during peak hours.' }
    ],
    queries: [
      { id: 1, name: 'Aman Gupta (B.Tech CSE Fresher)', contact: 'aman.fresher@example.com', topic: 'Mess Plan', question: 'Can I book Standard 3 meals right now during Early Decision and upgrade to 4 meals after reaching campus?', status: 'resolved', admin_reply: 'Yes! UMS allows upgrading from 2/3 meals to 4 meals or A la carte by paying the pro-rata difference.' }
    ],
    blocks: [
      { code: 'Block 32', title: 'Admission & UMS Student Relationship Hub', category: 'Admin', nearest_gate: 'Main Gate 1A', walk_mins: '6 min walk', erickshaw_route: 'Gate 1A → Block 32 Plaza (₹10)', highlights: 'Fresher reporting, document verification, fee counter, ID card & biometric desk', map_query: 'Block 32 Lovely Professional University Phagwara' },
      { code: 'Block 34', title: 'School of Computer Science & Engineering (CSE)', category: 'Academic', nearest_gate: 'Main Gate 1B', walk_mins: '11 min walk', erickshaw_route: 'Gate 1B → Block 34 Stand (₹10)', highlights: 'CSE/IT labs, coding studios, placement cells, basement Nescafe & print shop', map_query: 'Block 34 Lovely Professional University Phagwara' },
      { code: 'Block 33 & 36', title: 'ECE, Robotics & Mechanical Engineering', category: 'Academic', nearest_gate: 'Main Gate 1B', walk_mins: '12 min walk', erickshaw_route: 'Gate 1B → Engineering Spine (₹10)', highlights: 'Electronics labs, CAD studios, workshops & student innovation garages', map_query: 'Block 33 Lovely Professional University Phagwara' },
      { code: 'Block 14', title: 'Mittal School of Business (MSB)', category: 'Academic', nearest_gate: 'Main Gate 1A', walk_mins: '7 min walk', erickshaw_route: 'Gate 1A → MSB Chowk (₹10)', highlights: 'MBA/BBA/B.Com lecture theatres, finance terminal lab & corporate auditoriums', map_query: 'Mittal School of Business LPU Phagwara' },
      { code: 'Block 15 · Uni Mall', title: 'Uni Mall & Central Food Plaza', category: 'Food & Retail', nearest_gate: 'Main Gate 1A', walk_mins: '8 min walk', erickshaw_route: 'Gate 1A → Uni Mall Drop (₹10)', highlights: 'Multi-storey student mall: food courts, banks/ATMs, stationery, salon & bowling', map_query: 'Uni Mall Lovely Professional University' },
      { code: 'Block 37', title: 'Central Library & Knowledge Centre', category: 'Academic', nearest_gate: 'Main Gate 1B', walk_mins: '10 min walk', erickshaw_route: 'Uni Mall → Library Square (₹10)', highlights: '9-storey central library, silent reading halls, e-journals & exam study zones', map_query: 'Central Library Lovely Professional University' },
      { code: 'Block 6 · Hospital', title: 'Uni Hospital (24×7 Medical & Pharmacy)', category: 'Medical', nearest_gate: 'Main Gate 1A', walk_mins: '4 min walk', erickshaw_route: 'Right inside Gate 1A · 24×7 Ambulance', highlights: '24×7 emergency & OPD doctors, in-house chemist shop, physiotherapy & sick bay', map_query: 'Uni Hospital Lovely Professional University' },
      { code: 'Unipolis & SDM', title: 'Baldev Raj Mittal Unipolis & SDM Auditorium', category: 'Landmarks', nearest_gate: 'Main Gate 1A', walk_mins: '5 min walk', erickshaw_route: 'Gate 1A Main Avenue', highlights: 'Freshers Induction, convocations, YouthVibe fests & major celebrity events', map_query: 'Unipolis Lovely Professional University' },
      { code: 'RoboPark', title: 'RoboPark & Innovation Lawn', category: 'Landmarks', nearest_gate: 'Main Gate 1B', walk_mins: '9 min walk', erickshaw_route: 'Uni Mall → Block 32 Crossing (₹10)', highlights: 'Giant scrap-metal robot sculptures, open-air hangout lawn & tech expos', map_query: 'Lovely Professional University Phagwara' },
      { code: 'Indoor Stadium', title: 'Shanti Devi Mittal Sports Complex & Pool', category: 'Landmarks', nearest_gate: 'Gate 2', walk_mins: '13 min walk', erickshaw_route: 'Gate 1B → Sports Complex Shuttle (₹10)', highlights: 'Olympic-size pool, badminton courts, gym, shooting range & basketball arena', map_query: 'Indoor Sports Complex Lovely Professional University' },
      { code: 'BH-1 to BH-4', title: 'Boys Hostels (Central Residential Zone)', category: 'Hostels', nearest_gate: 'Main Gate 1B', walk_mins: '13 min walk', erickshaw_route: 'Gate 1B → Boys Hostel Spine (₹10)', highlights: '4/3/2-seater AC & cooler rooms, North/South mess halls, laundry, tuck shop & gym', map_query: 'Boys Hostel BH1 Lovely Professional University' },
      { code: 'BH-5 to BH-8 & Apts', title: 'Boys Hostels (North Spine) & Studio Apartments', category: 'Hostels', nearest_gate: 'Gate 2', walk_mins: '17 min walk', erickshaw_route: 'Gate 1B / Gate 2 → BH-6 Shuttle (₹10)', highlights: 'High-rise hostel blocks, A la carte dining counters, night canteens & outdoor courts', map_query: 'Boys Hostel BH5 Lovely Professional University' },
      { code: 'GH-1 to GH-6', title: 'Girls Hostels (Gated Central Zone)', category: 'Hostels', nearest_gate: 'Main Gate 1A', walk_mins: '8 min walk', erickshaw_route: 'Gate 1A → Girls Hostel Gate (₹10)', highlights: '24×7 biometric security near Uni Mall, in-house mess, tuck shops, parlor & study room', map_query: 'Girls Hostel GH1 Lovely Professional University' },
      { code: 'Block 29 & 30', title: 'Chancellor’s Office & Examination Wing', category: 'Admin', nearest_gate: 'Main Gate 1A', walk_mins: '6 min walk', erickshaw_route: 'Gate 1A → Admin Plaza', highlights: 'Examination controller, transcripts, international office & central administration', map_query: 'Block 30 Lovely Professional University' },
      { code: 'Block 25–28', title: 'Law, Architecture, Design & Hotel Mgmt', category: 'Academic', nearest_gate: 'Main Gate 1A', walk_mins: '9 min walk', erickshaw_route: 'Uni Mall → Design Spine (₹10)', highlights: 'Moot court, fashion & interior studios, culinary kitchens & training restaurant', map_query: 'School of Design Lovely Professional University' },
      { code: 'Block 55–57', title: 'Agriculture, Pharmacy & Bioengineering', category: 'Academic', nearest_gate: 'Gate 2', walk_mins: '15 min walk', erickshaw_route: 'Main Gate → Block 55 E-Rickshaw (₹10)', highlights: 'Pharmaceutical labs, polyhouses, agronomy research plots & food-tech labs', map_query: 'Block 55 Lovely Professional University' }
    ],
    todayPolls: [
      { cuisine: 'north', meal_slot: 'breakfast', up_votes: 22, down_votes: 3 },
      { cuisine: 'north', meal_slot: 'lunch', up_votes: 29, down_votes: 5 },
      { cuisine: 'north', meal_slot: 'snacks', up_votes: 19, down_votes: 2 },
      { cuisine: 'north', meal_slot: 'dinner', up_votes: 34, down_votes: 4 },
      { cuisine: 'south', meal_slot: 'breakfast', up_votes: 18, down_votes: 2 },
      { cuisine: 'south', meal_slot: 'lunch', up_votes: 21, down_votes: 3 },
      { cuisine: 'south', meal_slot: 'snacks', up_votes: 15, down_votes: 2 },
      { cuisine: 'south', meal_slot: 'dinner', up_votes: 24, down_votes: 3 }
    ]
  };

  function readLocalStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const copy = JSON.parse(JSON.stringify(SEED_STATE));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(copy)); } catch {}
    return copy;
  }

  function writeLocalStore(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function summarize(reviews) {
    const total = reviews.length;
    const average = total ? Math.round((reviews.reduce((s, r) => s + Number(r.rating), 0) / total) * 10) / 10 : 0;
    return { total, average };
  }

  const CLOUD_API_ORIGIN = 'https://lpu-campus-guide-app-production.up.railway.app';
  let activeApiBase = null;
  let serverAvailable = null;

  async function probeAndFetch(base, cleanPath, options = {}) {
    const url = `${base}${cleanPath}`;
    const res = await fetch(url, options);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { notApi: true };
    }
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 404 && cleanPath.includes('bootstrap')) {
        return { notApi: true };
      }
      const apiErr = new Error(data.error || 'Request failed');
      apiErr.isApiError = true;
      throw apiErr;
    }
    return { data };
  }

  async function tryServer(path, options = {}) {
    if (serverAvailable === false) return null;
    const cleanPath = path.replace(/^\./, '');

    if (activeApiBase !== null) {
      try {
        const out = await probeAndFetch(activeApiBase, cleanPath, options);
        if (out.notApi) return null;
        return out.data;
      } catch (err) {
        if (err.isApiError || serverAvailable === true) throw err;
        return null;
      }
    }

    const candidates = ['.'];
    if (typeof location !== 'undefined' && location.origin !== CLOUD_API_ORIGIN) {
      candidates.push(CLOUD_API_ORIGIN);
    }

    for (const base of candidates) {
      try {
        const out = await probeAndFetch(base, cleanPath, options);
        if (!out.notApi) {
          activeApiBase = base;
          serverAvailable = true;
          return out.data;
        }
      } catch (err) {
        if (err.isApiError) {
          activeApiBase = base;
          serverAvailable = true;
          throw err;
        }
        // Network failure: try next candidate before falling back to localStorage
      }
    }

    serverAvailable = false;
    return null;
  }

  window.CampusAPI = {
    isServerMode: () => serverAvailable === true,

    async getBootstrap() {
      const srv = await tryServer('./api/bootstrap');
      if (srv) return { ...srv, mode: 'server' };
      const st = readLocalStore();
      return {
        timings: st.timings,
        menu: st.menu,
        plans: st.plans,
        rooms: st.rooms,
        blocks: st.blocks || SEED_STATE.blocks,
        todayPolls: st.todayPolls || SEED_STATE.todayPolls,
        reviewSummary: summarize(st.reviews),
        reviews: st.reviews.slice(0, 12),
        resolvedQueries: st.queries.filter((q) => q.status === 'resolved' && q.admin_reply),
        mode: 'cloud-static'
      };
    },

    async votePoll(payload) {
      const srv = await tryServer('./api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (srv) return srv;

      const st = readLocalStore();
      if (!st.todayPolls) st.todayPolls = JSON.parse(JSON.stringify(SEED_STATE.todayPolls));
      const row = st.todayPolls.find((p) => p.cuisine === payload.cuisine && p.meal_slot === payload.meal_slot);
      if (row && payload.previous_vote !== payload.vote) {
        if (payload.previous_vote === 'up') row.up_votes = Math.max(0, row.up_votes - 1);
        if (payload.previous_vote === 'down') row.down_votes = Math.max(0, row.down_votes - 1);
        if (payload.vote === 'up') row.up_votes += 1;
        if (payload.vote === 'down') row.down_votes += 1;
        writeLocalStore(st);
      }
      return { message: 'Vote saved!', polls: st.todayPolls };
    },

    async askBuddy(message) {
      const srv = await tryServer('./api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (srv) return srv;

      const st = readLocalStore();
      const blocks = st.blocks || SEED_STATE.blocks;
      const q = String(message || '').toLowerCase();
      const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
      const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const todayDay = istNow.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      if (/(kettle|iron|press|heater|induction|rod|banned|allowed|document|reporting|pack|checklist)/.test(q)) {
        return {
          reply: '⚠️ **Hostel Rules & Checklist:**\n• **Banned:** Electric kettle, clothes iron, immersion rod, induction & heater.\n• **Available inside Hostel:** Hot/cold RO water dispensers + laundry/ironing shop.\n• **Reporting Docs (Block 32):** 10th/12th marksheets, allotment letter, Aadhaar + 6 photos, medical & anti-ragging forms.'
        };
      }

      const matchedBlock = blocks.find((b) =>
        q.includes(b.code.toLowerCase()) ||
        (b.code === 'Block 34' && /\b(34|cse|computer)\b/.test(q)) ||
        (b.code === 'Block 32' && /\b(32|ums|admission)\b/.test(q)) ||
        (b.code.includes('Uni Mall') && /mall|atm|food court/.test(q)) ||
        (b.code.includes('Hospital') && /hospital|medical|doctor/.test(q)) ||
        (b.code === 'Block 37' && /library/.test(q))
      );
      if (matchedBlock && !/(fee|kitna|price|cost)/.test(q)) {
        return {
          reply: `📍 **${matchedBlock.code} — ${matchedBlock.title}**\n• **Nearest Gate:** ${matchedBlock.nearest_gate} (${matchedBlock.walk_mins})\n• **E-Rickshaw:** ${matchedBlock.erickshaw_route}\n• **Inside:** ${matchedBlock.highlights}`
        };
      }

      if (/(phagwara|jalandhar|cantt|station|train|airport|reach|kaise aaye|auto)/.test(q)) {
        return {
          reply: '🚆 **How to Reach LPU (NH-44):**\n• **Phagwara Jn:** ~7 km (12–15 min by direct auto/cab)\n• **Jalandhar Cantt:** ~14 km (20–25 min via NH-44 bus/auto)\n• **Jalandhar City:** ~20 km (30–35 min).'
        };
      }

      if (/(fee|fees|kitna|price|cost|seater|cooler|mess plan|carte|non-?veg|edb)/.test(q)) {
        const r = /3\s*-?\s*seater/.test(q) ? st.rooms.find((x) => x.room_key === '3s_ac') : st.rooms.find((x) => x.room_key === '4s_ac');
        const p = /3\s*meal/.test(q) ? st.plans.find((x) => x.plan_key === 'std3') : st.plans.find((x) => x.plan_key === 'std4');
        const tot = (r?.fee || 103000) + (p?.fee || 45000);
        return {
          reply: `💰 **2026–27 Session Estimate:**\n• **Hostel:** ${r.name} (${inr(r.fee)})\n• **Mess:** ${p.name} (${inr(p.fee)})\n• **Total:** **${inr(tot)}** (~${inr(Math.round(tot / 10))}/mo · With EDB: **${inr(tot - 10000)}**)`
        };
      }

      if (/(menu|khana|breakfast|lunch|snack|dinner|aaj|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.test(q)) {
        const cuisine = /south|dosa|idli/.test(q) ? 'south' : 'north';
        const row = st.menu.find((m) => m.cuisine === cuisine && m.day_of_week === todayDay);
        if (row) {
          return {
            reply: `🍴 **Today (${dayNames[todayDay]}) · ${cuisine === 'south' ? 'South' : 'North'} Indian Menu:**\n• **Breakfast:** ${row.breakfast}\n• **Lunch:** ${row.lunch}\n• **Snacks:** ${row.snacks}\n• **Dinner:** ${row.dinner}`
          };
        }
      }

      return {
        reply: '👋 **Namaste! Main LPU Buddy hoon.** Aap mujhse *"Aaj dinner me kya hai?"*, *"Block 34 kahan hai?"*, *"4-seater AC + 3 meal fee?"*, ya *"Banned items?"* pooch sakte hain!'
      };
    },

    async getReviews() {
      const srv = await tryServer('./api/reviews');
      if (srv) return srv;
      const st = readLocalStore();
      return { summary: summarize(st.reviews), reviews: st.reviews };
    },

    async postReview(payload) {
      const srv = await tryServer('./api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (srv) return srv;

      const st = readLocalStore();
      const created = {
        id: Date.now(),
        student_name: String(payload.student_name || '').trim(),
        hostel_block: String(payload.hostel_block || '').trim(),
        mess_type: String(payload.mess_type || '').trim(),
        rating: Number(payload.rating) || 5,
        comment: String(payload.comment || '').trim()
      };
      st.reviews.unshift(created);
      writeLocalStore(st);
      return { message: 'Review saved!', review: created, summary: summarize(st.reviews) };
    },

    async postQuery(payload) {
      const srv = await tryServer('./api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (srv) return srv;

      const st = readLocalStore();
      const created = {
        id: Date.now(),
        name: String(payload.name || '').trim(),
        contact: String(payload.contact || '').trim(),
        topic: String(payload.topic || 'General').trim(),
        question: String(payload.question || '').trim(),
        status: 'pending',
        admin_reply: ''
      };
      st.queries.unshift(created);
      writeLocalStore(st);
      return { message: 'Question saved!', id: created.id };
    },

    async adminOverview(key) {
      const srv = await tryServer('./api/admin/overview', {
        headers: { 'x-admin-key': key }
      });
      if (srv) return srv;
      if (key !== 'lpu2026' && key !== 'aryan2026') {
        throw new Error('Invalid admin passcode.');
      }
      const st = readLocalStore();
      return {
        counts: {
          menuItems: st.menu.length,
          plans: st.plans.length,
          reviews: st.reviews.length,
          pendingQueries: st.queries.filter((q) => q.status === 'pending').length,
          totalQueries: st.queries.length
        },
        menu: st.menu,
        plans: st.plans,
        reviews: st.reviews,
        queries: st.queries
      };
    },

    async adminSaveMenu(key, payload) {
      const srv = await tryServer('./api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(payload)
      });
      if (srv) return srv;
      const st = readLocalStore();
      const idx = st.menu.findIndex((m) => m.cuisine === payload.cuisine && m.day_of_week === Number(payload.day_of_week));
      if (idx >= 0) st.menu[idx] = { ...st.menu[idx], ...payload };
      writeLocalStore(st);
      return { message: 'Saved!' };
    },

    async adminSavePlan(key, id, payload) {
      const srv = await tryServer(`./api/admin/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(payload)
      });
      if (srv) return srv;
      const st = readLocalStore();
      const idx = st.plans.findIndex((p) => String(p.id) === String(id));
      if (idx >= 0) st.plans[idx] = { ...st.plans[idx], fee: Number(payload.fee), subtitle: payload.subtitle };
      writeLocalStore(st);
      return { message: 'Updated!' };
    },

    async adminResolveQuery(key, id, payload) {
      const srv = await tryServer(`./api/admin/queries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(payload)
      });
      if (srv) return srv;
      const st = readLocalStore();
      const idx = st.queries.findIndex((q) => String(q.id) === String(id));
      if (idx >= 0) st.queries[idx] = { ...st.queries[idx], status: payload.status, admin_reply: payload.admin_reply };
      writeLocalStore(st);
      return { message: 'Resolved!' };
    },

    async adminDeleteReview(key, id) {
      const srv = await tryServer(`./api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': key }
      });
      if (srv) return srv;
      const st = readLocalStore();
      st.reviews = st.reviews.filter((r) => String(r.id) !== String(id));
      writeLocalStore(st);
      return { message: 'Deleted!' };
    }
  };
})();
