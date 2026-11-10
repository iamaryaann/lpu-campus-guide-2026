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

  let serverAvailable = null;

  async function tryServer(path, options = {}) {
    if (serverAvailable === false) return null;
    try {
      const res = await fetch(path, options);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        serverAvailable = false;
        return null;
      }
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404 && path.includes('bootstrap')) {
          serverAvailable = false;
          return null;
        }
        throw new Error(data.error || 'Request failed');
      }
      serverAvailable = true;
      return data;
    } catch (err) {
      if (serverAvailable === true) throw err;
      serverAvailable = false;
      return null;
    }
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
        reviewSummary: summarize(st.reviews),
        reviews: st.reviews.slice(0, 12),
        resolvedQueries: st.queries.filter((q) => q.status === 'resolved' && q.admin_reply),
        mode: 'cloud-static'
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
