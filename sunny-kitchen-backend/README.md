# Sunny's Kitchen — Backend API

A NestJS + MongoDB API powering the Sunny's Kitchen storefront: product
catalog with stock/out-of-stock management, and order intake for an admin
dashboard.

## Setup

```bash
npm install
cp .env.example .env     # then edit .env — at minimum set MONGODB_URI
npm run seed              # populates the initial menu into MongoDB
npm run start:dev
```

The API runs on `http://localhost:4000` by default (see `.env`).

You'll need a MongoDB instance — either running locally
(`mongodb://localhost:27017/sunnyskitchen`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster (use its connection
string as `MONGODB_URI`).

## Admin login

There's a single admin account, configured entirely via environment
variables — no signup flow, no separate admin-user database collection:

```
ADMIN_EMAIL=admin@sunnyskitchen.in
ADMIN_PASSWORD=changeme123
```

`POST /auth/login` with that email/password returns a JWT
(`{ accessToken }`). Send it as `Authorization: Bearer <token>` on every
admin-only request below. Tokens expire after `JWT_EXPIRES_IN` (default
12h).

> **Security note:** this is intentionally simple — one operator, one
> password, checked against plain env vars. It's fine for a single small
> kitchen running its own dashboard. Before handling real payments or
> multiple staff logins, swap this for hashed passwords in a database (or a
> proper auth provider) and put the API behind HTTPS.

## API reference

### Auth
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/login` | — | `{ email, password }` |

### Products (menu items)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/products` | public | Full menu with live stock state |
| GET | `/products/:id` | public | Single product |
| POST | `/products` | admin | Create a product |
| PATCH | `/products/:id` | admin | Update name/price/stockCount/outOfStock/etc |
| DELETE | `/products/:id` | admin | Remove a product |
| POST | `/products/:id/image` | admin | Upload/replace a product's photo — `multipart/form-data` with a field named `image` (jpg/png/webp/gif, max 5MB) |

Product fields: `name`, `price`, `emoji`, `imageUrl`, `stockCount`,
`outOfStock`, `isCombo` (shows in the combo-deal section), `sortOrder`.

Uploaded images are saved to `uploads/products/` and served at
`http://localhost:4000/uploads/products/<filename>`. `imageUrl` is set
automatically by the upload endpoint — you don't need to send it yourself.
If a product has no `imageUrl`, the storefront falls back to showing its
`emoji` instead, so uploading a photo is optional per item.

Marking something out of stock is just `PATCH /products/:id` with
`{ "outOfStock": true }`, or set `stockCount` — the API automatically flips
`outOfStock` to `true` once `stockCount` hits 0.

### Orders
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/orders` | public | Storefront checkout submits here |
| GET | `/orders` | admin | List all incoming orders, newest first. Optional `?status=` filter |
| GET | `/orders/:id` | admin | Single order |
| PATCH | `/orders/:id/status` | admin | `{ "status": "confirmed" \| "preparing" \| "out_for_delivery" \| "delivered" \| "cancelled" }` |

`POST /orders` re-validates and re-prices every line item against the live
product records server-side (never trusts price/availability from the
client), rejects the order if anything is out of stock, and decrements
`stockCount` on success — so stock counts and incoming orders are always
consistent with each other.

## Order status emails

If the customer provides an email at checkout, they get an email
automatically whenever their order's status changes — placed, confirmed,
preparing, out for delivery, delivered, or cancelled. This is handled by
`src/mail/mail.service.ts` using `nodemailer`.

To enable it, set these in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=<an app password, not your normal Gmail password>
MAIL_FROM="Sunny's Kitchen <no-reply@sunnyskitchen.in>"
```

Any SMTP provider works — Gmail (with an
[App Password](https://myaccount.google.com/apppasswords)), or a
transactional email service like Resend, Brevo, or Mailgun (all have free
tiers and give you SMTP credentials). **Leave these blank and the app keeps
working fine — emails are just silently skipped**, with a warning logged on
startup.

> **SMS instead of/as well as email?** That needs a paid SMS provider like
> Twilio (there's no free SMTP-style option for SMS). The mail service is
> structured so you could add a `sendOrderStatusSms` method alongside
> `sendOrderStatusEmail` if you want to wire that up later — it isn't
> included here since it requires signing up for and paying for a separate
> service.

## Deploying

Any Node host that can reach your MongoDB instance works — Render,
Railway, Fly.io, a VPS, etc. Build with `npm run build`, run with
`npm run start:prod`. Set `CORS_ORIGIN` to your deployed frontend's URL.

> **Uploaded images live on local disk** (`uploads/products/`). That's
> fine on a VPS, but many PaaS free tiers (Render, Railway, etc.) use an
> ephemeral filesystem that gets wiped on every redeploy — uploaded photos
> would disappear. If you deploy there, switch the image upload in
> `src/products/products.controller.ts` to store files in something
> persistent instead (S3, Cloudinary, or a mounted volume) before relying
> on it in production.

> **On a VPS with PM2/systemd: set `UPLOADS_DIR` to an absolute path
> outside the project folder**, e.g. `UPLOADS_DIR=/var/www/sunnyskitchen-uploads`.
> Without it, images are stored relative to `process.cwd()`, which is
> whatever directory the Node process happened to be launched from — that
> can silently change on a server reboot (`pm2 resurrect`), a crash
> restart, or a fresh `git pull`/redeploy, making the app look in a new,
> empty folder while the real files sit untouched in the old one. Result:
> every previously uploaded photo starts 404ing with no obvious cause.
> Pointing `UPLOADS_DIR` at a fixed absolute path outside the repo avoids
> this entirely, and also protects the folder from `git clean`/`git reset
> --hard` in your deploy script.
