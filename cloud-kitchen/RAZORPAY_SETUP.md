# Razorpay Setup — Backend + Frontend

## 1. Backend

### Install package
```bash
cd backend
npm install razorpay
```

### Add to backend `.env`
```
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### What changed
- `src/orders/schemas/order.schema.ts` — added `razorpayOrderId`, `razorpayPaymentId` fields
- `src/orders/dto/verify-payment.dto.ts` — new DTO for the verify-payment request body
- `src/orders/orders.service.ts` — added `createRazorpayOrder()` and `verifyRazorpayPayment()`
- `src/orders/orders.controller.ts` — added two public routes:
  - `POST /orders/:id/razorpay-order` → creates a Razorpay order priced off the order already saved in your DB
  - `POST /orders/:id/verify-payment` → verifies the payment signature, then marks `paymentStatus: Confirmed` and `status: confirmed`

Both routes are public (no `AdminGuard`) since the storefront checkout needs to call them.

## 2. Frontend

### Add to frontend `.env.local`
Razorpay's public Key ID is safe in the frontend, but it isn't actually read from here in this setup — the backend hands it back in the `razorpay-order` response, so you only need it in the backend `.env`. No frontend env change needed.

### What changed
- `lib/api.ts` — added `createRazorpayOrder()` and `verifyPayment()` functions
- `app/checkout/page.tsx`:
  - Loads `https://checkout.razorpay.com/v1/checkout.js` via `next/script`
  - Removed the old QR-code + manual "Done / Not Done" self-reported payment flow
  - New flow for UPI/online payment: create order in DB (status: Pending) → ask backend for a Razorpay order → open Razorpay's checkout popup → on success, backend verifies the signature → order marked Confirmed
  - Cash on Delivery flow is unchanged

## 3. How the flow works now

1. Customer fills the checkout form and clicks **Place Order**
2. Frontend creates the order in your DB (`POST /orders`) — status stays "Pending"
3. If payment method is **Pay Online**:
   - Frontend calls `POST /orders/:id/razorpay-order` → backend creates a Razorpay order for the order's real total (never trusts an amount from the browser)
   - Razorpay's checkout popup opens (UPI / Card / Netbanking)
   - On success, frontend calls `POST /orders/:id/verify-payment` with the response Razorpay gave it
   - Backend recomputes the signature using your **Key Secret** — only if it matches does the order get marked `Confirmed`
4. If payment method is **Cash on Delivery**, order is placed directly, no Razorpay involved

## 4. Testing

Use Razorpay **Test Mode** keys first (Dashboard → Settings → API Keys → make sure "Test Mode" toggle is on before generating).

Test card: `4111 1111 1111 1111`, any future expiry, CVV `123`, OTP `1234` if asked.

## 5. Going live

1. Complete KYC on Razorpay Dashboard
2. Switch Dashboard to **Live Mode**
3. Generate **Live** API keys
4. Replace the Test keys in backend `.env` with the Live keys
5. Redeploy backend

## 6. Recommended next step: Webhooks

Right now, if a customer pays but closes the browser before the `handler` callback fires, the order can stay stuck at "Pending" even though Razorpay actually has the payment. To make this bulletproof, add a Razorpay webhook (Dashboard → Settings → Webhooks) pointing to a new endpoint like `POST /orders/webhook/razorpay`, which listens for the `payment.captured` event and marks the matching order Confirmed server-to-server. Happy to add this if you want it.
