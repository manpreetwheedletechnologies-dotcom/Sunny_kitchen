// Static site copy that isn't part of the product catalog.
// Menu items and the combo deal now come from the backend (see lib/api.ts).

export const badges = [
  { label: "Fresh ingredients", emoji: "🌿" },
  { label: "Made with love", emoji: "❤️" },
  { label: "On time delivery", emoji: "🛎️" },
  { label: "Hygienic & safe", emoji: "🛡️" },
];

// Keep these in sync with DELIVERY_FEE / FREE_DELIVERY_ABOVE in the backend
// (src/orders/orders.service.ts) — the backend is the source of truth and
// re-computes these itself, but the frontend shows them before checkout.
export const DELIVERY_FEE = 25;
export const FREE_DELIVERY_ABOVE = 299;
