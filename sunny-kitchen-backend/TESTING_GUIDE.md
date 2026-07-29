# Testing Guide — Razorpay + Payments Dashboard

## Naya kya add hua hai

- Ek naya MongoDB collection: **`payments`** — har Razorpay payment attempt yahan store hota hai, order ke `_id` se linked (`order` field).
- Har attempt ke 3 possible status: `created` (order bana lekin payment abhi hui nahi/abandon ho gaya), `captured` (successful), `failed`.
- Naya admin page: **Payments** (sidebar mein "Orders" ke turant neeche) — jahan sab payments dikhte hain, saath mein revenue/success/fail summary cards.

## Setup (agar pehle se nahi kiya)

```bash
cd backend
npm install razorpay
```

`.env` mein:
```
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

## End-to-end test kaise karein

### 1. Successful payment test karo

1. Website ke checkout page pe jao, cart mein kuch item daalo
2. "Pay Online" (UPI) select karo, form bharo, **Place Order** click karo
3. Razorpay popup khulega — Card se test karo (sabse reliable):
   - Card: `4111 1111 1111 1111`
   - Expiry: koi bhi future date
   - CVV: `123`
4. "Success" simulate karo jab Razorpay poochhe
5. **Verify karo:**
   - Order confirmation screen dikhni chahiye
   - Admin → **Orders** mein jao → us order ka `paymentStatus` = **Confirmed** hona chahiye
   - Admin → **Payments** mein jao → ek naya row dikhna chahiye:
     - Status = **Success** (green badge)
     - Method = **Card**
     - Razorpay Payment ID bhara hua

### 2. Failed payment test karo

1. Checkout phir se karo, Razorpay popup mein card daalo: `4000 0000 0000 0002` (ye Razorpay ka **guaranteed decline** test card hai)
2. Payment fail hoga
3. **Verify karo:**
   - Checkout page pe "Payment failed" wala error dikhna chahiye
   - Admin → Orders mein order abhi bhi **Pending** rahega (koi galat confirmation nahi)
   - Admin → **Payments** mein ek row dikhega Status = **Failed** (red badge), aur uspe hover karne se error reason dikhega

### 3. Abandoned/incomplete payment test karo

1. Checkout karo, Razorpay popup khule, phir popup ko **close (X)** kar do bina payment kiye
2. Admin → Payments mein us order ke against ek row dikhega Status = **Pending / Abandoned** (yellow badge) — kyunki order create hote hi hum ek "created" record bana dete hain

### 4. Cash on Delivery test karo

1. "Cash on Delivery" select karke order place karo
2. Ye Razorpay ko touch hi nahi karta, isliye Payments dashboard mein iske liye koi row nahi banega (expected hai) — sirf Orders mein dikhega

## Payments dashboard mein kya dikhta hai

| Column | Matlab |
|---|---|
| Order | Order number (jis order se ye payment linked hai) |
| Customer | Customer ka naam |
| Amount | Rupees mein |
| Method | UPI / Card / Netbanking / Wallet |
| Status | Success (green) / Failed (red) / Pending-Abandoned (yellow) |
| Razorpay Payment ID | Razorpay ka payment ID (support/refund ke liye kaam aata hai) |
| Date | Kab hua |

Top pe 4 summary cards hain: **Total Revenue** (sirf successful payments ka sum), **Successful**, **Failed**, **Pending/Abandoned** count.

Search box se order number, customer name, ya Razorpay payment ID se dhoondh sakte ho. Status filter se sirf ek category dekh sakte ho.

## Ek important cheez samajh lo

Agar customer payment karke turant browser band kar de (hamare `handler` callback chalne se pehle), to us case mein order "Pending" hi rahega, aur Payments dashboard mein bhi wo "created" (Pending/Abandoned) hi dikhega — asal mein Razorpay ke paas paisa aa chuka hoga. Isko **bulletproof** banane ke liye Razorpay **webhook** add karna best practice hai (server-to-server confirmation, browser pe depend nahi karta). Abhi ke liye Payments dashboard aapko manually aise cases dhoondh ke Razorpay Dashboard se cross-check karne mein help karega. Chahiye to webhook bhi add kar sakta hoon — bataiye.
