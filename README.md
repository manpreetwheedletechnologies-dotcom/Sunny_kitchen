# Sunny's Kitchen — Full Stack

Two projects, run together:

- **`cloud-kitchen/`** — Next.js 14 storefront (menu, cart, checkout, admin dashboard UI)
- **`sunny-kitchen-backend/`** — NestJS + MongoDB API (products/stock, orders, admin auth)

## Quick start

```bash
# Terminal 1 — backend
cd sunny-kitchen-backend
npm install
cp .env.example .env       # set MONGODB_URI to your local or Atlas MongoDB
npm run seed                # loads the starting 11-item menu
npm run start:dev           # http://localhost:4000

# Terminal 2 — frontend
cd cloud-kitchen
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                  # http://localhost:3000
```

You'll need a MongoDB database. Easiest options:
- **Local**: install MongoDB Community Server and use `mongodb://localhost:27017/sunnyskitchen`
- **Free hosted**: [MongoDB Atlas](https://www.mongodb.com/atlas) — create a free cluster, copy its connection string into `MONGODB_URI`

## What you get

- Customer side: browse the menu (live stock from the database), add to
  cart, checkout, place a real order — all persisted in MongoDB. Email is
  optional at checkout, used only for order-status notifications.
- `/admin/login` (also linked quietly in the site footer): sign in with the
  admin email/password from the backend's `.env`
- `/admin/dashboard`:
  - Stat cards: total orders, orders needing attention, revenue, out-of-stock count
  - **Orders tab** — every order that comes in through checkout, live,
    newest first, color-coded by status, with a dropdown to move it through
    pending → confirmed → preparing → out for delivery → delivered.
    **Every status change emails the customer automatically** (if they gave
    an email at checkout) — see "Order status emails" in the backend README
    for how to turn this on.
  - **Products tab** — edit **price and stock count inline**, toggle items
    out of stock, delete items, add new menu items — changes show up on the
    storefront immediately (no redeploy needed)

## Honest limitations to know about

- **Payments aren't processed.** "Cash on delivery" and "UPI" are just
  labels stored on the order — there's no Razorpay/Stripe integration. Add
  one before taking real online payments.
- **Admin auth is single-account and simple** (email/password checked
  against env vars, JWT-signed session). Fine for one kitchen operator;
  harden it (hashed credentials in a database, HTTPS, rate limiting) before
  running this in production with a team.
- **No customer-facing order tracking page** — customers see a confirmation
  screen after checkout but there's no "track my order" view. Status
  updates currently only surface in the admin dashboard.
- I built and compiled both projects in a sandboxed environment without
  outbound access to a real MongoDB server, so I verified: the backend
  compiles cleanly and boots correctly (all modules wire up, it reaches the
  point of connecting to MongoDB); the frontend type-checks and builds all
  routes including the admin pages. I was **not** able to run a live
  end-to-end test (place a real order against a real database) from here —
  please do that first spin locally before relying on it.
