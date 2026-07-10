# Sunny's Kitchen — Frontend

A Next.js 14 (App Router) storefront for "Sunny's Kitchen," a home-style
cloud kitchen brand. This is the **frontend only** — it talks to a separate
NestJS + MongoDB backend for the product catalog, stock, and orders. See
`../sunny-kitchen-backend`.

## Running the full stack

```bash
# 1. Backend (in sunny-kitchen-backend/)
npm install
cp .env.example .env      # edit MONGODB_URI at minimum
npm run seed               # loads the starting menu into MongoDB
npm run start:dev          # runs on http://localhost:4000

# 2. Frontend (this folder, in a separate terminal)
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                 # runs on http://localhost:3000
```

Then open http://localhost:3000. The menu, stock, and order flow are all
live against the backend — nothing here is mocked or hardcoded anymore.

## What's wired to the backend now

- **Home `/` and `/menu`** — fetch the live product list (`GET /products`)
  on every request, so stock and out-of-stock state are always current
- **Add to cart** — disabled with an "Out of stock" label when a product's
  `outOfStock` is true
- **`/checkout`** — submits the real order (`POST /orders`); the backend
  re-validates stock and re-prices every line itself, decrements stock, and
  returns a real order number. An optional email field lets the customer
  get notified as their order status changes.
- **`/admin/login` → `/admin/dashboard`** — the admin dashboard:
  - Stat cards up top: total orders, orders needing attention, revenue, and
    out-of-stock count
  - **Orders tab**: every incoming order, newest first, color-coded by
    status, with a dropdown to move it through pending → confirmed →
    preparing → out for delivery → delivered/cancelled — each change
    emails the customer automatically if they gave an email
  - **Products tab**: edit price and stock count inline, toggle
    out-of-stock, delete items, add new menu items

Admin login is a single account configured via the backend's `.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — see the backend README for details.

## Pages

- `/` — Home: hero with sun mascot, live menu grid, combo deal, trust badges
- `/menu` — Full menu (same live grid, standalone page)
- `/cart` — Cart with quantity controls, subtotal, delivery fee, and totals
- `/checkout` — Delivery details, payment method, real order submission, confirmation screen
- `/about` — Kitchen story and facts
- `/contact` — General inquiries / feedback form
- `/admin/login`, `/admin/dashboard` — Kitchen operator dashboard (not linked from main nav — there's a small "Kitchen Admin" link in the footer)

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom theme — see `tailwind.config.ts` for the color/type tokens)
- Fonts: Caveat (script logo), Baloo 2 (display/headers), Quicksand (body) —
  self-hosted via `@fontsource/*` packages (the font files ship inside
  `node_modules` after `npm install`), **not** fetched from Google Fonts at
  build time. This avoids build failures on networks/firewalls that block
  `fonts.googleapis.com` — a real issue we hit while building this.
- Talks to the NestJS backend via `lib/api.ts` (plain `fetch`, no extra data-fetching library)

## Dish photos

Menu items currently use colored circular placeholders with an emoji
instead of real food photography (`components/DishPhoto.tsx`). Swap this
component for an `<Image>` pointing at your own photos in `/public` when
you have them — the emoji placeholders are there so the layout is complete
and ready to drop real photography into.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> Note: `next/font/google` fetches font files at build time, so the machine
> running `npm run build` or `npm run dev` needs normal internet access to
> reach fonts.googleapis.com.

## Where to customize

- **Menu items, prices, stock** — now managed through `/admin/dashboard`
  (or directly in MongoDB / via the API) rather than in frontend code
- **Delivery fee / free-delivery threshold display copy** — `lib/menu.ts`
  (keep in sync with the backend's `src/orders/orders.service.ts`, which is
  the actual source of truth used at checkout)
- **Cart behavior** — `lib/cart-context.tsx`
- **API base URL** — `NEXT_PUBLIC_API_URL` in `.env.local`
- **Colors, fonts, spacing tokens** — `tailwind.config.ts`
- **Homepage copy / hero** — `app/page.tsx`
- **Nav links / footer info** — `components/Header.tsx`, `components/Footer.tsx`

## Deploying

Works out of the box on Vercel, or anywhere that supports Next.js
(`npm run build && npm run start`).
