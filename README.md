# LPU Campus Guide — Full-Stack Edition (Node.js + Express + SQLite)

A full-stack student guide for **Lovely Professional University (LPU), Phagwara** built with **Node.js, Express, and native SQLite (`node:sqlite`)**. It combines a clean warm-editorial UI with live IST dining hours, database-driven weekly regional menus, an interactive 2026–27 mess + hostel fee estimator, student mess reviews/ratings, a fresher doubt box, and an **Admin Control Panel (`/admin`)**.

![LPU Campus Guide preview](preview.png)

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, inline vector SVGs (`public/index.html`, `public/admin.html`)
- **Backend:** Node.js + Express 5 (`server.js`)
- **Database:** Native SQLite (`node:sqlite` -> `data/campus.db`, auto-created & seeded via `db.js`)

## Run Locally

```bash
npm install
npm start
```

- **Main Website:** `http://127.0.0.1:3000`
- **Admin Dashboard:** `http://127.0.0.1:3000/admin` (Default passcode: `lpu2026`)

## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server & SQLite health status |
| `GET` | `/api/bootstrap` | Hydrates timings, weekly menus, mess plans, room tiers, reviews & resolved Q&As |
| `GET` | `/api/menu` | Fetch all or specific day/cuisine menu (`?cuisine=north&day=1`) |
| `GET` | `/api/plans` | Fetch 2026–27 mess plans & hostel room tiers |
| `GET` | `/api/reviews` | Fetch student mess reviews & average star rating |
| `POST` | `/api/reviews` | Submit a new student mess review (`1–5` stars) into SQLite |
| `POST` | `/api/queries` | Save a student/fresher campus question into SQLite |
| `GET` | `/api/admin/overview` | Protected overview for Admin Dashboard (`x-admin-key` header) |
| `PUT` | `/api/admin/menu` | Edit any day/cuisine menu in SQLite |
| `PUT` | `/api/admin/plans/:id` | Update any 2026–27 mess plan fee or subtitle |
| `PATCH` | `/api/admin/queries/:id` | Reply to & resolve a student query (surfaces in public FAQs) |
| `DELETE` | `/api/admin/reviews/:id` | Moderate/remove a student review |

## Project Structure

```text
lpu-campus-guide/
├── data/
│   └── campus.db        # Auto-generated SQLite database
├── public/
│   ├── index.html       # Main full-stack frontend
│   └── admin.html       # Admin Control Panel (/admin)
├── db.js                # SQLite schema & initial seed data
├── server.js            # Express REST API & static file server
├── package.json
├── preview.png
└── README.md
```
