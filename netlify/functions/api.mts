import type { Config, Context } from "@netlify/functions";
import { getDeployStore, getStore } from "@netlify/blobs";

interface TimingItem {
  id: number;
  slot_key: string;
  title: string;
  time_label: string;
  start_min: number;
  end_min: number;
  summary: string;
  sort_order: number;
}

interface MenuEntry {
  cuisine: "north" | "south";
  day_of_week: number;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

interface PlanItem {
  id: number;
  plan_key: string;
  name: string;
  subtitle: string;
  fee: number;
  category: "veg" | "nonveg_vendor";
  period_label: string;
  sort_order: number;
}

interface RoomItem {
  id: number;
  room_key: string;
  name: string;
  fee: number;
  electricity_units: string;
  sort_order: number;
}

interface ReviewItem {
  id: string;
  student_name: string;
  hostel_block: string;
  mess_type: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface QueryItem {
  id: string;
  name: string;
  contact: string;
  topic: string;
  question: string;
  status: "pending" | "resolved";
  admin_reply: string;
  created_at: string;
}

const DEFAULT_TIMINGS: TimingItem[] = [
  { id: 1, slot_key: "breakfast", title: "Breakfast", time_label: "7:15 – 9:30 AM", start_min: 435, end_min: 570, summary: "Parantha, idli/poha, stuffed toast, curd, tea & milk", sort_order: 1 },
  { id: 2, slot_key: "lunch", title: "Lunch", time_label: "11:15 AM – 3:00 PM", start_min: 675, end_min: 900, summary: "Rajmah/dal, seasonal subzi, raita, rice & hot chapati", sort_order: 2 },
  { id: 3, slot_key: "snacks", title: "Tea & snacks", time_label: "5:00 – 6:00 PM", start_min: 1020, end_min: 1080, summary: "Masala tea or coffee with rotating hot evening snacks", sort_order: 3 },
  { id: 4, slot_key: "dinner", title: "Dinner", time_label: "7:00 – 9:00 PM", start_min: 1140, end_min: 1260, summary: "Dal, paneer/seasonal veg, chapati, rice, salad & dessert", sort_order: 4 },
];

const DEFAULT_MENU: MenuEntry[] = [
  { cuisine: "north", day_of_week: 1, breakfast: "Aloo parantha, plain curd, mango pickle, bread-butter & masala tea", lunch: "Rajmah masala, aloo jeera, boondi raita, steamed rice, salad & chapati", snacks: "Crisp samosa with tamarind chutney & cardamom chai", dinner: "Dal makhani, mix seasonal veg, jeera rice, chapati, salad & rice kheer" },
  { cuisine: "north", day_of_week: 2, breakfast: "Vegetable poha, stuffed besan toast, boiled sweet corn, milk & tea", lunch: "Kadhi pakora, aloo gobhi, plain rice, chapati, papad & green salad", snacks: "Bread pakora with mint chutney & hot tea", dinner: "Yellow dal tadka, matar paneer, steamed rice, chapati & gulab jamun" },
  { cuisine: "north", day_of_week: 3, breakfast: "Gobhi parantha, curd, pickle, cornflakes with milk & masala tea", lunch: "Amritsari chole, khatte aloo, veg raita, pulao, chapati & onion salad", snacks: "Veg Maggi / masala pasta & evening coffee", dinner: "Dal fry, bhindi do pyaza / seasonal veg, rice, chapati & salad" },
  { cuisine: "north", day_of_week: 4, breakfast: "Puri bhaji, sweet dalia, brown bread, jam & ginger tea", lunch: "Black chana curry, lauki kofta, curd, steamed rice, chapati & fryums", snacks: "Khasta kachori with tangy chutney & masala chai", dinner: "Panchratan dal, kadai paneer / soya chaap, rice, chapati & halwa" },
  { cuisine: "north", day_of_week: 5, breakfast: "Paneer/onion uttapam or stuffed kulcha, chutney, milk & tea", lunch: "Rajmah raseela, aloo matar, cucumber raita, jeera rice & chapati", snacks: "Aloo tikki / veg cutlet with sauce & hot tea", dinner: "Dal tadka, dum aloo Kashmiri, rice, chapati, salad & custard" },
  { cuisine: "north", day_of_week: 6, breakfast: "Ajwain parantha with aloo bhaji, curd, bread-butter & tea", lunch: "White chana, seasonal tawa veg, veg pulao, boondi raita & chapati", snacks: "Bhel puri / chana chaat & masala tea", dinner: "Dal makhani, veg manchurian / hakka noodles combo, rice & chapati" },
  { cuisine: "north", day_of_week: 0, breakfast: "Chole bhature / stuffed paneer parantha, sweet lassi or curd & tea", lunch: "Special veg biryani, mirchi salan / mix veg raita, papad & salad", snacks: "Veg grilled sandwich / patty with hot coffee or tea", dinner: "Arhar dal tadka, shahi paneer, jeera rice, chapati & ice cream / sweet" },
  { cuisine: "south", day_of_week: 1, breakfast: "Steamed idli, medu vada, drumstick sambar, coconut chutney & filter coffee", lunch: "Sambar, rasam, cabbage poriyal, steamed rice, curd, chapati & appalam", snacks: "Onion bajji with coconut chutney & hot tea/coffee", dinner: "Tomato pappu, veg kurma, lemon rice, plain rice, chapati & payasam" },
  { cuisine: "south", day_of_week: 2, breakfast: "Masala dosa, sambar, roasted gram & tomato chutneys, milk & tea", lunch: "Kara kuzhambu, beans carrot poriyal, rasam, rice, buttermilk & chapati", snacks: "Masala vada & hot cardamom tea", dinner: "Dal fry, paneer chettinad-style veg, steamed rice, chapati & banana" },
  { cuisine: "south", day_of_week: 3, breakfast: "Rava upma, kesari bath, coconut chutney, bread-butter & coffee", lunch: "Arachuvitta sambar, aloo podimas, pepper rasam, rice, curd & papad", snacks: "Sweet corn sundal & evening tea", dinner: "Spinach dal (keerai kootu), mix veg curry, tamarind rice & chapati" },
  { cuisine: "south", day_of_week: 4, breakfast: "Onion uttapam, sambar, ginger chutney, boiled sprouts & tea", lunch: "Mor kuzhambu, beetroot poriyal, rasam, steamed rice, curd & chapati", snacks: "Punugulu / mysore bonda with peanut chutney & tea", dinner: "Toor dal tadka, meal-maker / paneer masala, jeera rice, chapati & sweet" },
  { cuisine: "south", day_of_week: 5, breakfast: "Pongal, medu vada, sambar, coconut chutney & hot coffee", lunch: "Vegetable sambar, tindora fry, garlic rasam, rice, curd & fryums", snacks: "Veg puff / samosa & hot tea", dinner: "Dal tadka, avial, steamed rice, chapati, pickle & semiya payasam" },
  { cuisine: "south", day_of_week: 6, breakfast: "Set dosa, vegetable sagu, coconut chutney & filter coffee", lunch: "Vatha kuzhambu, snake gourd kootu, rasam, steamed rice, curd & chapati", snacks: "Murukku / masala peanuts & ginger chai", dinner: "Tomato dal, gobi masala, veg fried rice, plain rice & chapati" },
  { cuisine: "south", day_of_week: 0, breakfast: "Paper roast dosa / poori masala, sambar, chutney & coffee", lunch: "Hyderabadi veg dum biryani, onion pachadi, mirchi gravy & papad", snacks: "Banana bajji / pakora & hot tea", dinner: "Sambar, paneer butter masala, puliyodarai, steamed rice, chapati & sweet" },
];

const DEFAULT_PLANS: PlanItem[] = [
  { id: 1, plan_key: "std4", name: "Standard · 4 meals", subtitle: "Breakfast, lunch, evening snacks & dinner (~₹150/day)", fee: 45000, category: "veg", period_label: "/ session", sort_order: 1 },
  { id: 2, plan_key: "std3", name: "Standard · 3 meals", subtitle: "Breakfast, lunch & dinner (~₹138/day)", fee: 41400, category: "veg", period_label: "/ session", sort_order: 2 },
  { id: 3, plan_key: "std2", name: "Standard · 2 meals", subtitle: "Breakfast + dinner, lunch + dinner, or breakfast + lunch", fee: 37800, category: "veg", period_label: "/ session", sort_order: 3 },
  { id: 4, plan_key: "alacarte", name: "A la carte · 4 meals", subtitle: "Choice of dishes across offered cuisines at selected locations", fee: 52200, category: "veg", period_label: "/ session", sort_order: 4 },
  { id: 5, plan_key: "nv3", name: "3 meals plan", subtitle: "Independent vendor outside campus", fee: 75000, category: "nonveg_vendor", period_label: "/ year", sort_order: 5 },
  { id: 6, plan_key: "nv2", name: "2 meals plan", subtitle: "Independent vendor outside campus", fee: 65000, category: "nonveg_vendor", period_label: "/ year", sort_order: 6 },
  { id: 7, plan_key: "nv1", name: "1 meal plan", subtitle: "Independent vendor outside campus", fee: 55000, category: "nonveg_vendor", period_label: "/ year", sort_order: 7 },
];

const DEFAULT_ROOMS: RoomItem[] = [
  { id: 1, room_key: "none", name: "Mess only (Exclude room fee)", fee: 0, electricity_units: "Mess only", sort_order: 1 },
  { id: 2, room_key: "4s_cooler", name: "4-Seater Air-Cooled", fee: 93000, electricity_units: "300 free electricity units", sort_order: 2 },
  { id: 3, room_key: "4s_ac", name: "4-Seater AC Room", fee: 103000, electricity_units: "500 free electricity units", sort_order: 3 },
  { id: 4, room_key: "3s_cooler", name: "3-Seater Air-Cooled", fee: 108000, electricity_units: "350 free electricity units", sort_order: 4 },
  { id: 5, room_key: "3s_ac", name: "3-Seater AC Room", fee: 123000, electricity_units: "550 free electricity units", sort_order: 5 },
  { id: 6, room_key: "2s_ac", name: "2-Seater AC Room", fee: 143000, electricity_units: "750 free electricity units", sort_order: 6 },
  { id: 7, room_key: "1s_ac", name: "1-Seater AC Room", fee: 163000, electricity_units: "1,000 free electricity units", sort_order: 7 },
  { id: 8, room_key: "apt_4s", name: "4-Seater AC Apartment", fee: 110000, electricity_units: "Studio apartment policy", sort_order: 8 },
];

const SEED_REVIEWS: ReviewItem[] = [
  { id: "seed-4", student_name: "Simran Kaur", hostel_block: "GH-2", mess_type: "Standard · 3 meals", rating: 4, comment: "Clean dining hall and Sunday veg biryani + paneer dinner is great. Packed breakfast works well when 8 AM labs are scheduled.", created_at: "2026-11-10T10:00:00Z" },
  { id: "seed-3", student_name: "Harshvardhan Verma", hostel_block: "BH-5", mess_type: "A la carte · 4 meals", rating: 4, comment: "Slightly higher fee than standard mess, but picking paneer/chaap dishes and skipping fixed plates is worth it during exams.", created_at: "2026-11-09T14:30:00Z" },
  { id: "seed-2", student_name: "Ananya Nair", hostel_block: "GH-3", mess_type: "South Indian Mess", rating: 5, comment: "Really glad LPU has a dedicated South Indian mess option—morning idli/dosa with filter coffee feels close to home.", created_at: "2026-11-08T08:15:00Z" },
  { id: "seed-1", student_name: "Rohan Sharma", hostel_block: "BH-1", mess_type: "Standard · 4 meals (North)", rating: 4, comment: "Breakfast aloo parantha and evening samosa + chai slot are genuinely solid. Automated chapatis stay soft during peak hours.", created_at: "2026-11-07T19:45:00Z" },
];

const SEED_QUERIES: QueryItem[] = [
  {
    id: "seed-q1",
    name: "Aman Gupta (B.Tech CSE Fresher)",
    contact: "aman.fresher@example.com",
    topic: "Mess Plan",
    question: "Can I book Standard 3 meals right now during Early Decision and upgrade to 4 meals after reaching campus?",
    status: "resolved",
    admin_reply: "Yes! UMS allows upgrading from 2/3 meals to 4 meals or A la carte by paying the pro-rata difference.",
    created_at: "2026-11-08T12:00:00Z",
  },
];

function cleanText(val: unknown, maxLen = 400): string {
  return String(val ?? "").trim().replace(/\s+/g, " ").slice(0, maxLen);
}

function openCampusStore(context: Context) {
  if (context.deploy?.context === "production") {
    return getStore({ name: "lpu-campus-guide-prod", consistency: "strong" });
  }
  return getDeployStore({ name: "lpu-campus-guide-preview" });
}

function makeSortableId(): string {
  const rev = String(9999999999999 - Date.now()).padStart(13, "0");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${rev}-${rand}`;
}

async function loadAllMenu(store: ReturnType<typeof openCampusStore>): Promise<MenuEntry[]> {
  const { blobs } = await store.list({ prefix: "menu/" });
  const overrides = new Map<string, MenuEntry>();
  await Promise.all(
    blobs.map(async (b) => {
      const item = await store.get(b.key, { type: "json" }) as MenuEntry | null;
      if (item) overrides.set(`${item.cuisine}-${item.day_of_week}`, item);
    })
  );
  return DEFAULT_MENU.map((m) => overrides.get(`${m.cuisine}-${m.day_of_week}`) ?? m);
}

async function loadAllPlans(store: ReturnType<typeof openCampusStore>): Promise<PlanItem[]> {
  const { blobs } = await store.list({ prefix: "plan/" });
  const overrides = new Map<number, Partial<PlanItem>>();
  await Promise.all(
    blobs.map(async (b) => {
      const item = await store.get(b.key, { type: "json" }) as Partial<PlanItem> | null;
      if (item && typeof item.id === "number") overrides.set(item.id, item);
    })
  );
  return DEFAULT_PLANS.map((p) => ({ ...p, ...(overrides.get(p.id) ?? {}) }));
}

async function loadAllReviews(store: ReturnType<typeof openCampusStore>): Promise<ReviewItem[]> {
  const { blobs } = await store.list({ prefix: "review/" });
  const customReviews = (
    await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" }) as Promise<ReviewItem | null>))
  ).filter((r): r is ReviewItem => r !== null);

  const deletedSeeds = new Set<string>();
  const { blobs: delBlobs } = await store.list({ prefix: "deleted-review/" });
  delBlobs.forEach((b) => deletedSeeds.add(b.key.replace("deleted-review/", "")));

  const seeds = SEED_REVIEWS.filter((s) => !deletedSeeds.has(s.id));
  return [...customReviews, ...seeds];
}

async function loadAllQueries(store: ReturnType<typeof openCampusStore>): Promise<QueryItem[]> {
  const { blobs } = await store.list({ prefix: "query/" });
  const customQueries = (
    await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" }) as Promise<QueryItem | null>))
  ).filter((q): q is QueryItem => q !== null);

  const customIds = new Set(customQueries.map((q) => q.id));
  const seeds = SEED_QUERIES.filter((s) => !customIds.has(s.id));
  return [...customQueries, ...seeds];
}

function summarizeReviews(reviews: ReviewItem[]) {
  const total = reviews.length;
  const average = total > 0
    ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10) / 10
    : 0;
  return { total, average };
}

function isAuthorizedAdmin(req: Request): boolean {
  const expected = Netlify.env.get("ADMIN_KEY");
  if (!expected) return false;
  const provided = req.headers.get("x-admin-key") ?? "";
  return provided === expected;
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = req.method.toUpperCase();
  const store = openCampusStore(context);

  try {
    if (path === "/api/health" && method === "GET") {
      return Response.json({
        ok: true,
        engine: "Netlify Functions + Netlify Blobs",
        timestamp: new Date().toISOString(),
      });
    }

    if (path === "/api/bootstrap" && method === "GET") {
      const [menu, plans, reviews, queries] = await Promise.all([
        loadAllMenu(store),
        loadAllPlans(store),
        loadAllReviews(store),
        loadAllQueries(store),
      ]);

      return Response.json({
        timings: DEFAULT_TIMINGS,
        menu,
        plans,
        rooms: DEFAULT_ROOMS,
        reviewSummary: summarizeReviews(reviews),
        reviews: reviews.slice(0, 12),
        resolvedQueries: queries.filter((q) => q.status === "resolved" && q.admin_reply !== "").slice(0, 6),
      });
    }

    if (path === "/api/menu" && method === "GET") {
      const menu = await loadAllMenu(store);
      const cuisine = url.searchParams.get("cuisine");
      const day = url.searchParams.get("day");
      if (cuisine && day !== null) {
        const found = menu.find((m) => m.cuisine === cuisine && m.day_of_week === Number(day));
        if (!found) return Response.json({ error: "Menu entry not found." }, { status: 404 });
        return Response.json(found);
      }
      return Response.json(menu);
    }

    if (path === "/api/plans" && method === "GET") {
      const plans = await loadAllPlans(store);
      return Response.json({ plans, rooms: DEFAULT_ROOMS });
    }

    if (path === "/api/reviews" && method === "GET") {
      const reviews = await loadAllReviews(store);
      return Response.json({
        summary: summarizeReviews(reviews),
        reviews: reviews.slice(0, 20),
      });
    }

    if (path === "/api/reviews" && method === "POST") {
      const body = await req.json();
      const student_name = cleanText(body.student_name, 60);
      const hostel_block = cleanText(body.hostel_block, 30);
      const mess_type = cleanText(body.mess_type, 50);
      const rating = Number(body.rating);
      const comment = cleanText(body.comment, 360);

      if (!student_name || !hostel_block || !mess_type || !comment) {
        return Response.json({ error: "Please fill in your name, hostel block, mess plan, and review comment." }, { status: 400 });
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return Response.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
      }

      const id = makeSortableId();
      const created: ReviewItem = {
        id,
        student_name,
        hostel_block,
        mess_type,
        rating,
        comment,
        created_at: new Date().toISOString(),
      };
      await store.setJSON(`review/${id}`, created, { onlyIfNew: true });
      const reviews = await loadAllReviews(store);

      return Response.json(
        { message: "Review posted!", review: created, summary: summarizeReviews(reviews) },
        { status: 201 }
      );
    }

    if (path === "/api/queries" && method === "POST") {
      const body = await req.json();
      const name = cleanText(body.name, 70);
      const contact = cleanText(body.contact, 90);
      const topic = cleanText(body.topic, 40) || "General";
      const question = cleanText(body.question, 500);

      if (!name || !contact || !question) {
        return Response.json({ error: "Please enter your name, email/phone, and question." }, { status: 400 });
      }

      const id = makeSortableId();
      const created: QueryItem = {
        id,
        name,
        contact,
        topic,
        question,
        status: "pending",
        admin_reply: "",
        created_at: new Date().toISOString(),
      };
      await store.setJSON(`query/${id}`, created, { onlyIfNew: true });
      return Response.json({ message: "Question saved!", id }, { status: 201 });
    }

    // Admin routes
    if (path.startsWith("/api/admin")) {
      if (!isAuthorizedAdmin(req)) {
        return Response.json({ error: "Invalid or unconfigured ADMIN_KEY." }, { status: 401 });
      }

      if (path === "/api/admin/overview" && method === "GET") {
        const [menu, plans, reviews, queries] = await Promise.all([
          loadAllMenu(store),
          loadAllPlans(store),
          loadAllReviews(store),
          loadAllQueries(store),
        ]);
        return Response.json({
          counts: {
            menuItems: menu.length,
            plans: plans.length,
            reviews: reviews.length,
            pendingQueries: queries.filter((q) => q.status === "pending").length,
            totalQueries: queries.length,
          },
          menu,
          plans,
          reviews,
          queries,
        });
      }

      if (path === "/api/admin/menu" && method === "PUT") {
        const body = await req.json();
        const cuisine = cleanText(body.cuisine, 20) as "north" | "south";
        const day_of_week = Number(body.day_of_week);
        const breakfast = cleanText(body.breakfast, 250);
        const lunch = cleanText(body.lunch, 250);
        const snacks = cleanText(body.snacks, 250);
        const dinner = cleanText(body.dinner, 250);

        if (!["north", "south"].includes(cuisine) || !Number.isInteger(day_of_week) || day_of_week < 0 || day_of_week > 6) {
          return Response.json({ error: "Valid cuisine and day required." }, { status: 400 });
        }
        const entry: MenuEntry = { cuisine, day_of_week, breakfast, lunch, snacks, dinner };
        await store.setJSON(`menu/${cuisine}-${day_of_week}`, entry);
        return Response.json({ message: "Menu updated.", entry });
      }

      const planMatch = path.match(/^\/api\/admin\/plans\/(\d+)$/);
      if (planMatch && method === "PUT") {
        const id = Number(planMatch[1]);
        const body = await req.json();
        const fee = Math.round(Number(body.fee));
        const subtitle = cleanText(body.subtitle, 180);
        if (!Number.isFinite(fee) || fee < 0 || !subtitle) {
          return Response.json({ error: "Valid fee and subtitle required." }, { status: 400 });
        }
        await store.setJSON(`plan/${id}`, { id, fee, subtitle });
        return Response.json({ message: "Mess plan updated." });
      }

      const queryMatch = path.match(/^\/api\/admin\/queries\/([^/]+)$/);
      if (queryMatch && method === "PATCH") {
        const id = decodeURIComponent(queryMatch[1]);
        const body = await req.json();
        const queries = await loadAllQueries(store);
        const existing = queries.find((q) => String(q.id) === id);
        if (!existing) return Response.json({ error: "Query not found." }, { status: 404 });

        const updated: QueryItem = {
          ...existing,
          status: body.status === "pending" ? "pending" : "resolved",
          admin_reply: cleanText(body.admin_reply, 500),
        };
        await store.setJSON(`query/${id}`, updated);
        return Response.json({ message: "Query updated.", query: updated });
      }

      const revMatch = path.match(/^\/api\/admin\/reviews\/([^/]+)$/);
      if (revMatch && method === "DELETE") {
        const id = decodeURIComponent(revMatch[1]);
        if (id.startsWith("seed-")) {
          await store.set(`deleted-review/${id}`, "1");
        } else {
          await store.delete(`review/${id}`);
        }
        return Response.json({ message: "Review removed." });
      }
    }

    return Response.json({ error: "Endpoint not found." }, { status: 404 });
  } catch (err) {
    console.error("API error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
};

export const config: Config = {
  path: ["/api/*"],
};
