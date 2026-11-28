// LPU Campus Guide (2026-27) — Main Frontend JavaScript

(() => {
  // 1. Mobile Nav & Theme Toggle
  const menuBtn = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('navlinks');
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  const themeBtn = document.getElementById('theme-toggle');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun = document.getElementById('icon-sun');
  const metaTheme = document.getElementById('meta-theme-color');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
      metaTheme.setAttribute('content', '#0e1916');
    } else {
      document.documentElement.removeAttribute('data-theme');
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
      metaTheme.setAttribute('content', '#f7f6f1');
    }
  }
  const savedTheme = localStorage.getItem('lpu-guide-theme');
  if (savedTheme) applyTheme(savedTheme);
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('lpu-guide-theme', next);
  });

  // 2. Live IST Dining Status
  let mealWindows = [
    { id: 'breakfast', name: 'Breakfast', start: 435, end: 570, label: '7:15 – 9:30 AM' },
    { id: 'lunch', name: 'Lunch', start: 675, end: 900, label: '11:15 AM – 3:00 PM' },
    { id: 'snacks', name: 'Tea & Snacks', start: 1020, end: 1080, label: '5:00 – 6:00 PM' },
    { id: 'dinner', name: 'Dinner', start: 1140, end: 1260, label: '7:00 – 9:00 PM' }
  ];

  function getISTTimeParts() {
    const istString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);
    return {
      day: istDate.getDay(),
      minutes: istDate.getHours() * 60 + istDate.getMinutes(),
      formatted: istDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
    };
  }

  function formatDiff(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    return h > 0 ? `${h}h` : `${m}m`;
  }

  function updateDiningStatus() {
    const { minutes, formatted } = getISTTimeParts();
    const pill = document.getElementById('hero-live-pill');
    const statusText = document.getElementById('hero-live-status');
    const titleEl = document.getElementById('hero-meal-title');
    const subEl = document.getElementById('hero-meal-sub');

    let activeMeal = null;
    let nextMeal = null;
    let minsUntilNext = 0;

    for (const m of mealWindows) {
      if (minutes >= m.start && minutes < m.end) { activeMeal = m; break; }
      if (minutes < m.start && !nextMeal) { nextMeal = m; minsUntilNext = m.start - minutes; }
    }
    if (!activeMeal && !nextMeal) {
      nextMeal = mealWindows[0];
      minsUntilNext = (24 * 60 - minutes) + nextMeal.start;
    }

    document.querySelectorAll('.slot-pill').forEach((el) => {
      el.classList.remove('active', 'next');
      if (activeMeal && el.dataset.slot === activeMeal.id) el.classList.add('active');
      else if (!activeMeal && nextMeal && el.dataset.slot === nextMeal.id) el.classList.add('next');
    });

    document.querySelectorAll('[data-meal-card]').forEach((card) => {
      card.classList.remove('is-active', 'is-next');
      const badge = card.querySelector('.meal-badge');
      if (activeMeal && card.dataset.mealCard === activeMeal.id) {
        card.classList.add('is-active');
        badge.textContent = 'Serving now';
      } else if (!activeMeal && nextMeal && card.dataset.mealCard === nextMeal.id) {
        card.classList.add('is-next');
        badge.textContent = 'Up next';
      }
    });

    if (activeMeal) {
      pill.classList.remove('closed');
      statusText.textContent = `Open now · ${formatted} IST`;
      titleEl.textContent = `${activeMeal.name} is open`;
      subEl.textContent = `Closes in ${formatDiff(activeMeal.end - minutes)} (${activeMeal.label})`;
    } else {
      pill.classList.add('closed');
      statusText.textContent = `Closed · ${formatted} IST`;
      titleEl.textContent = `Next: ${nextMeal.name}`;
      subEl.textContent = `Opens in ${formatDiff(minsUntilNext)} (${nextMeal.label})`;
    }
  }
  updateDiningStatus();
  setInterval(updateDiningStatus, 30000);

  // 3. Copy Address & Transit Tabs
  const copyAddrBtn = document.getElementById('copy-address-btn');
  copyAddrBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('Lovely Professional University, Jalandhar-Delhi G.T. Road, Phagwara, Punjab 144411, India');
      copyAddrBtn.textContent = 'Copied ✓';
      setTimeout(() => { copyAddrBtn.textContent = 'Copy address'; }, 2000);
    } catch {
      copyAddrBtn.textContent = 'Phagwara 144411';
    }
  });

  const transitData = {
    pgw: { dist: '~7 km · 12–15 min', note: 'Direct autos & cabs outside Phagwara Railway Station right to LPU Main Gate.' },
    jrc: { dist: '~14 km · 20–25 min', note: 'Frequent highway buses & shared autos along NH-44 from Jalandhar Cantt.' },
    juc: { dist: '~20 km · 30–35 min', note: 'Regular Phagwara/Ludhiana-bound buses & cabs drop directly at LPU.' },
    air: { dist: 'ATQ ~110 km · IXC ~145 km', note: 'Amritsar (ATQ) & Chandigarh (IXC) airports connect smoothly via NH-44 highway.' }
  };
  document.querySelectorAll('.transit-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.transit-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const info = transitData[tab.dataset.hub];
      document.getElementById('transit-dist').textContent = info.dist;
      document.getElementById('transit-note').innerHTML = `<span>${info.note}</span>`;
    });
  });

  // 4. State for Dynamic Menu, Plans, Rooms & Reviews
  const menuDB = { north: {}, south: {} };
  let activeCuisine = 'north';
  let activeDay = getISTTimeParts().day;

  document.querySelectorAll('.day-btn').forEach((btn) => {
    const d = Number(btn.dataset.day);
    if (d === activeDay) btn.classList.add('is-today', 'active');
    btn.addEventListener('click', () => {
      activeDay = d;
      document.querySelectorAll('.day-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu();
    });
  });

  document.querySelectorAll('.cuisine-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCuisine = btn.dataset.cuisine;
      document.querySelectorAll('.cuisine-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu();
      renderPoll();
    });
  });

  function renderMenu() {
    const entry = menuDB[activeCuisine]?.[activeDay];
    if (!entry) return;
    document.getElementById('m-breakfast').textContent = entry.breakfast;
    document.getElementById('m-lunch').textContent = entry.lunch;
    document.getElementById('m-snacks').textContent = entry.snacks;
    document.getElementById('m-dinner').textContent = entry.dinner;
  }

  // Feature 1: Campus Blocks State & Filter
  let allBlocks = [];
  let activeBlockCat = 'all';
  const blockSearchInput = document.getElementById('block-search-input');
  const blockSearchClear = document.getElementById('block-search-clear');
  const blocksGrid = document.getElementById('blocks-grid');

  function renderBlocks() {
    const q = blockSearchInput.value.trim().toLowerCase();
    blockSearchClear.style.display = q ? 'block' : 'none';
    const filtered = allBlocks.filter((b) => {
      const catOk = activeBlockCat === 'all' || b.category.toLowerCase() === activeBlockCat.toLowerCase();
      if (!catOk) return false;
      if (!q) return true;
      return `${b.code} ${b.title} ${b.highlights} ${b.nearest_gate} ${b.category}`.toLowerCase().includes(q);
    });

    if (!filtered.length) {
      blocksGrid.innerHTML = `<div class="blocks-empty">No campus block matched "<strong>${escapeHTML(blockSearchInput.value)}</strong>". Try "Block 34", "CSE", "Hospital", "Uni Mall", or "BH-1".</div>`;
      return;
    }

    blocksGrid.innerHTML = filtered.map((b) => {
      const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.map_query || (b.code + ' LPU Phagwara'))}`;
      return `
        <article class="block-card">
          <div>
            <div class="block-card-top">
              <span class="block-code">${escapeHTML(b.code)}</span>
              <span class="block-cat-tag">${escapeHTML(b.category)}</span>
            </div>
            <h3>${escapeHTML(b.title)}</h3>
            <p>${escapeHTML(b.highlights)}</p>
            <div class="block-meta-list">
              <span class="block-meta-pill">🚪 ${escapeHTML(b.nearest_gate)}</span>
              <span class="block-meta-pill">🚶 ${escapeHTML(b.walk_mins)}</span>
              <span class="block-meta-pill">🛺 ${escapeHTML(b.erickshaw_route)}</span>
            </div>
          </div>
          <a class="block-map-link" href="${mapHref}" target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
        </article>
      `;
    }).join('');
  }

  blockSearchInput.addEventListener('input', renderBlocks);
  blockSearchClear.addEventListener('click', () => {
    blockSearchInput.value = '';
    renderBlocks();
    blockSearchInput.focus();
  });
  document.querySelectorAll('[data-block-cat]').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeBlockCat = chip.dataset.blockCat;
      document.querySelectorAll('[data-block-cat]').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      renderBlocks();
    });
  });

  // Feature 2: Live Daily Meal Poll ("Aaj Ka Khana Kaisa Tha?")
  let todayPolls = [];
  let todayPollDate = new Date().toISOString().slice(0, 10);
  const istMinsNow = getISTTimeParts().minutes;
  let activePollSlot = istMinsNow < 600 ? 'breakfast' : istMinsNow < 960 ? 'lunch' : istMinsNow < 1110 ? 'snacks' : 'dinner';

  document.querySelectorAll('.poll-slot-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.pollSlot === activePollSlot);
    btn.addEventListener('click', () => {
      activePollSlot = btn.dataset.pollSlot;
      document.querySelectorAll('.poll-slot-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPoll();
    });
  });

  function pollVoteStorageKey() {
    return `lpu_poll_vote_${todayPollDate}_${activeCuisine}_${activePollSlot}`;
  }

  function renderPoll() {
    const row = todayPolls.find((p) => p.cuisine === activeCuisine && p.meal_slot === activePollSlot) || { up_votes: 0, down_votes: 0 };
    const up = Number(row.up_votes) || 0;
    const down = Number(row.down_votes) || 0;
    const total = up + down;
    const pct = total > 0 ? Math.round((up / total) * 100) : 85;

    document.getElementById('vote-up-count').textContent = String(up);
    document.getElementById('vote-down-count').textContent = String(down);
    document.getElementById('poll-bar-fill').style.width = `${pct}%`;
    const cuisineName = activeCuisine === 'south' ? 'South' : 'North';
    document.getElementById('poll-stat-text').textContent = `${pct}% Hit · ${total} votes (${cuisineName} ${activePollSlot})`;

    const myVote = localStorage.getItem(pollVoteStorageKey());
    document.getElementById('vote-up-btn').classList.toggle('voted-up', myVote === 'up');
    document.getElementById('vote-down-btn').classList.toggle('voted-down', myVote === 'down');
  }

  async function handlePollVote(voteType) {
    const key = pollVoteStorageKey();
    const prev = localStorage.getItem(key) || '';
    if (prev === voteType) return;
    try {
      const res = await window.CampusAPI.votePoll({
        cuisine: activeCuisine,
        meal_slot: activePollSlot,
        vote: voteType,
        previous_vote: prev
      });
      localStorage.setItem(key, voteType);
      if (res && res.polls) todayPolls = res.polls;
      renderPoll();
    } catch {}
  }
  document.getElementById('vote-up-btn').addEventListener('click', () => handlePollVote('up'));
  document.getElementById('vote-down-btn').addEventListener('click', () => handlePollVote('down'));

  // Estimator Logic
  const messSelect = document.getElementById('calc-mess');
  const roomSelect = document.getElementById('calc-room');
  const edbCheck = document.getElementById('edb-check');
  const estTotalEl = document.getElementById('est-total');
  const estBreakdownEl = document.getElementById('est-breakdown');

  function formatINR(num) {
    return '₹' + Number(num).toLocaleString('en-IN');
  }

  function updateEstimate() {
    if (!messSelect.options.length || !roomSelect.options.length) return;
    const messFee = Number(messSelect.value);
    let roomFee = Number(roomSelect.value);
    const edbApplied = edbCheck.checked && roomFee > 0;
    if (edbApplied) roomFee = Math.max(0, roomFee - 10000);

    const total = messFee + roomFee;
    const monthly = Math.round(total / 10);
    const selectedRoomOpt = roomSelect.options[roomSelect.selectedIndex];
    const unitsText = selectedRoomOpt.dataset.units || '';

    estTotalEl.textContent = formatINR(total);
    estBreakdownEl.textContent = `~${formatINR(monthly)}/mo (10 mos) · ${unitsText}${edbApplied ? ' · EDB applied' : ''}`;

    const selectedPlanKey = messSelect.options[messSelect.selectedIndex].dataset.planKey;
    document.querySelectorAll('.price-row').forEach((row) => {
      row.classList.toggle('selected', row.dataset.plan === selectedPlanKey);
    });
  }

  messSelect.addEventListener('change', updateEstimate);
  roomSelect.addEventListener('change', updateEstimate);
  edbCheck.addEventListener('change', updateEstimate);

  document.getElementById('copy-est-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const messLabel = messSelect.options[messSelect.selectedIndex]?.text || '';
    const roomLabel = roomSelect.options[roomSelect.selectedIndex]?.text || '';
    const summary = `LPU 2026–27 Estimate:\n• Mess: ${messLabel}\n• Hostel: ${roomLabel}\n• Total: ${estTotalEl.textContent} (${estBreakdownEl.textContent})`;
    try {
      await navigator.clipboard.writeText(summary);
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = 'Copy summary'; }, 2000);
    } catch {
      btn.textContent = 'Done ✓';
    }
  });

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function starsString(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function renderReviews(summary, reviews) {
    document.getElementById('avg-rating-num').textContent = Number(summary.average || 0).toFixed(1);
    document.getElementById('avg-rating-stars').textContent = starsString(Math.round(summary.average || 0));
    document.getElementById('total-reviews-count').textContent = `Based on ${summary.total} student review${summary.total === 1 ? '' : 's'}`;

    const listEl = document.getElementById('reviews-list');
    listEl.innerHTML = reviews.slice(0, 6).map((r) => `
      <article class="review-card">
        <div class="review-top">
          <div class="review-author">
            <b>${escapeHTML(r.student_name)}</b>
            <span class="review-meta">
              <span class="chip-mini">${escapeHTML(r.hostel_block)}</span>
              <span class="chip-mini">${escapeHTML(r.mess_type)}</span>
            </span>
          </div>
          <span class="rating-stars" aria-label="${r.rating} out of 5 stars">${starsString(r.rating)}</span>
        </div>
        <p>${escapeHTML(r.comment)}</p>
      </article>
    `).join('');
  }

  // Hydrate everything via CampusAPI (Express + JSON Store or Cloud Persistent Store)
  async function loadBackendData() {
    try {
      const data = await window.CampusAPI.getBootstrap();

      // Menu
      data.menu.forEach((row) => {
        if (!menuDB[row.cuisine]) menuDB[row.cuisine] = {};
        menuDB[row.cuisine][row.day_of_week] = row;
      });
      renderMenu();

      // Campus Blocks & Today's Live Poll
      if (data.blocks && data.blocks.length) {
        allBlocks = data.blocks;
        renderBlocks();
      }
      if (data.todayDate) todayPollDate = data.todayDate;
      if (data.todayPolls && data.todayPolls.length) {
        todayPolls = data.todayPolls;
      }
      renderPoll();

      // Plans
      const vegPlans = data.plans.filter((p) => p.category === 'veg');
      const nvPlans = data.plans.filter((p) => p.category === 'nonveg_vendor');

      const vegContainer = document.getElementById('veg-plans-rows');
      vegContainer.innerHTML = vegPlans.map((p, idx) => `
        <button class="price-row ${idx === 0 ? 'selected' : ''}" type="button" data-plan="${escapeHTML(p.plan_key)}" data-fee="${p.fee}">
          <span class="radio-dot" aria-hidden="true"></span>
          <span>
            <b>${escapeHTML(p.name)}</b>
            <small>${escapeHTML(p.subtitle)}</small>
          </span>
          <span class="price">${formatINR(p.fee)} <em>${escapeHTML(p.period_label)}</em></span>
        </button>
      `).join('');

      vegContainer.querySelectorAll('.price-row').forEach((row) => {
        row.addEventListener('click', () => {
          const key = row.dataset.plan;
          for (let i = 0; i < messSelect.options.length; i++) {
            if (messSelect.options[i].dataset.planKey === key) {
              messSelect.selectedIndex = i;
              break;
            }
          }
          updateEstimate();
        });
      });

      if (nvPlans.length) {
        document.getElementById('nonveg-plans-rows').innerHTML = nvPlans.map((p) => `
          <div><span>${escapeHTML(p.name)}</span><b>${formatINR(p.fee)} ${escapeHTML(p.period_label)}</b></div>
        `).join('');
      }

      // Calculator selects
      messSelect.innerHTML = vegPlans.map((p) =>
        `<option value="${p.fee}" data-plan-key="${escapeHTML(p.plan_key)}">${escapeHTML(p.name)} (${formatINR(p.fee)})</option>`
      ).join('') + `<option value="0" data-plan-key="none">Self-managed / No mess (₹0)</option>`;

      roomSelect.innerHTML = data.rooms.map((r) =>
        `<option value="${r.fee}" data-units="${escapeHTML(r.electricity_units)}" ${r.room_key === '4s_ac' ? 'selected' : ''}>${escapeHTML(r.name)}${r.fee > 0 ? ` (${formatINR(r.fee)})` : ''}</option>`
      ).join('');

      updateEstimate();

      // Reviews
      renderReviews(data.reviewSummary, data.reviews);

      // Resolved Community Q&As appended into FAQ Grid
      if (data.resolvedQueries && data.resolvedQueries.length) {
        const faqGrid = document.getElementById('faq-grid');
        data.resolvedQueries.forEach((q) => {
          const det = document.createElement('details');
          det.className = 'faq-item';
          det.dataset.cat = 'food';
          det.innerHTML = `
            <summary>${escapeHTML(q.question)}</summary>
            <p><strong>Answered for ${escapeHTML(q.name)}:</strong> ${escapeHTML(q.admin_reply)}</p>
          `;
          faqGrid.appendChild(det);
        });
      }

      document.getElementById('db-status-badge').textContent =
        data.mode === 'server' ? '● Live API Connected' : '● Live Guide Ready';
    } catch (err) {
      document.getElementById('db-status-badge').textContent = '● Live Guide Ready';
    }
  }
  loadBackendData();

  // 5. Submit Student Review Form
  let chosenStars = 5;
  const starBtns = document.querySelectorAll('.star-btn');
  starBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      chosenStars = Number(btn.dataset.val);
      starBtns.forEach((b) => b.classList.toggle('lit', Number(b.dataset.val) <= chosenStars));
    });
  });

  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('rev-msg');
    msgEl.className = 'form-msg';
    msgEl.textContent = 'Saving review…';

    const payload = {
      student_name: document.getElementById('rev-name').value,
      hostel_block: document.getElementById('rev-hostel').value,
      mess_type: document.getElementById('rev-plan').value,
      rating: chosenStars,
      comment: document.getElementById('rev-comment').value
    };

    try {
      await window.CampusAPI.postReview(payload);
      msgEl.textContent = 'Review saved ✓';
      e.target.reset();
      chosenStars = 5;
      starBtns.forEach((b) => b.classList.add('lit'));

      const listData = await window.CampusAPI.getReviews();
      renderReviews(listData.summary, listData.reviews);
    } catch (err) {
      msgEl.className = 'form-msg err';
      msgEl.textContent = err.message;
    }
  });

  // 6. Submit Student Query Form
  document.getElementById('query-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('q-msg');
    msgEl.className = 'form-msg';
    msgEl.textContent = 'Sending…';

    const payload = {
      name: document.getElementById('q-name').value,
      contact: document.getElementById('q-contact').value,
      topic: document.getElementById('q-topic').value,
      question: document.getElementById('q-text').value
    };

    try {
      await window.CampusAPI.postQuery(payload);
      msgEl.textContent = 'Question saved! Open Admin Panel to reply ✓';
      e.target.reset();
    } catch (err) {
      msgEl.className = 'form-msg err';
      msgEl.textContent = err.message;
    }
  });

  // 7. Feature 6: Fresher Hostel Packing & Reporting Checklist
  const CHECK_STORAGE_KEY = 'lpu_fresher_checklist_v1';
  const checkInputs = Array.from(document.querySelectorAll('[data-check-id]'));

  function loadChecklistState() {
    try {
      return JSON.parse(localStorage.getItem(CHECK_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveChecklistState(state) {
    try {
      localStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function syncChecklistUI() {
    const state = loadChecklistState();
    let doneCount = 0;
    checkInputs.forEach((inp) => {
      const checked = Boolean(state[inp.dataset.checkId]);
      inp.checked = checked;
      inp.closest('.check-row')?.classList.toggle('done', checked);
      if (checked) doneCount += 1;
    });
    const total = checkInputs.length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    document.getElementById('checklist-count-label').textContent = `${doneCount} / ${total} packed (${pct}%)`;
    document.getElementById('checklist-fill').style.width = `${pct}%`;
  }

  checkInputs.forEach((inp) => {
    inp.addEventListener('change', () => {
      const state = loadChecklistState();
      state[inp.dataset.checkId] = inp.checked;
      saveChecklistState(state);
      syncChecklistUI();
    });
  });
  syncChecklistUI();

  function buildChecklistText() {
    const done = [];
    const pending = [];
    checkInputs.forEach((inp) => {
      const txt = inp.parentElement.querySelector('span')?.textContent?.trim() || '';
      if (inp.checked) done.push(`✅ ${txt}`);
      else pending.push(`⬜ ${txt}`);
    });
    return `🎒 *LPU 2026–27 Fresher Packing & Reporting Checklist* (${done.length}/${checkInputs.length} ready)\n\n` +
      (pending.length ? `*Remaining:*\n${pending.join('\n')}\n\n` : '') +
      (done.length ? `*Packed:*\n${done.join('\n')}\n\n` : '') +
      `Guide: ${location.href.split('#')[0]}`;
  }

  document.getElementById('checklist-wa-btn').addEventListener('click', () => {
    const text = buildChecklistText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });

  document.getElementById('checklist-copy-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(buildChecklistText());
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = 'Copy list'; }, 2000);
    } catch {}
  });

  document.getElementById('checklist-print-btn').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('checklist-reset-btn').addEventListener('click', () => {
    saveChecklistState({});
    syncChecklistUI();
  });

  // 8. Feature 4: "Ask LPU Buddy" Floating Smart Chatbot
  const buddyFab = document.getElementById('buddy-fab');
  const buddyPanel = document.getElementById('buddy-panel');
  const buddyClose = document.getElementById('buddy-close');
  const buddyForm = document.getElementById('buddy-form');
  const buddyInput = document.getElementById('buddy-input');
  const buddyMessages = document.getElementById('buddy-messages');

  function formatBotMarkdown(raw) {
    const safe = escapeHTML(raw);
    return safe
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function appendBuddyMsg(role, content) {
    const bubble = document.createElement('div');
    bubble.className = `buddy-msg ${role}`;
    if (role === 'bot') bubble.innerHTML = formatBotMarkdown(content);
    else bubble.textContent = content;
    buddyMessages.appendChild(bubble);
    buddyMessages.scrollTop = buddyMessages.scrollHeight;
    return bubble;
  }

  function toggleBuddy(forceState) {
    const open = typeof forceState === 'boolean' ? forceState : !buddyPanel.classList.contains('open');
    buddyPanel.classList.toggle('open', open);
    buddyFab.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => buddyInput.focus(), 60);
  }

  buddyFab.addEventListener('click', () => toggleBuddy());
  buddyClose.addEventListener('click', () => toggleBuddy(false));

  async function sendBuddyQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed) return;
    appendBuddyMsg('user', trimmed);
    buddyInput.value = '';
    const thinking = appendBuddyMsg('bot', 'Checking live LPU database…');
    try {
      const res = await window.CampusAPI.askBuddy(trimmed);
      thinking.innerHTML = formatBotMarkdown(res.reply || 'Check out the sections above for details!');
    } catch {
      thinking.textContent = 'Could not reach server right now—try checking the Menu or Block Finder above!';
    }
    buddyMessages.scrollTop = buddyMessages.scrollHeight;
  }

  buddyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendBuddyQuestion(buddyInput.value);
  });

  document.querySelectorAll('.buddy-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      sendBuddyQuestion(chip.dataset.ask);
    });
  });

  // 9. FAQ Filter & Scroll Spy
  document.querySelectorAll('[data-faq-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.faqFilter;
      document.querySelectorAll('[data-faq-filter]').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.hidden = !(filter === 'all' || item.dataset.cat === filter);
      });
    });
  });

  const sections = ['map', 'blocks', 'mess', 'menu', 'plans', 'reviews', 'checklist', 'faq']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navItems = document.querySelectorAll('.navlinks a.nav-item');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          navItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
        }
      });
    },
    { rootMargin: '-28% 0px -60% 0px' }
  );
  sections.forEach((sec) => observer.observe(sec));
})();
