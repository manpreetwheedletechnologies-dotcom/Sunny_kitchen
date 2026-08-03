const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Turns a relative "/uploads/products/xyz.jpg" path from the backend into a full URL. */
export function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (
    imageUrl.startsWith("/sunny-uploads") ||
    imageUrl.includes("localhost")
  ) {
    const path = imageUrl.includes("localhost")
      ? imageUrl.substring(imageUrl.indexOf("/sunny-uploads"))
      : imageUrl;

    return `https://sunnyskitchen.kitchen${path}`;
  }

  return imageUrl;
}

export type Product = {
  _id: string;
  name: string;
  price: number;
  emoji: string;
  imageUrl?: string | null;
  stockCount: number;
  outOfStock: boolean;
  isCombo: boolean;
  category: string;
  sortOrder: number;
  ingredients: string;
};

export type OrderLine = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "Pending" | "User_Done" | "User_Not_Done" | "Confirmed";

export type OrderSource = "website" | "swiggy" | "zomato";

export type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: OrderLine[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cod" | "upi";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  source: OrderSource;
  createdAt: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export type Customer = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  lastOrderDate?: string;
  preferredPlatform: OrderSource;
  createdAt: string;
};

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Closed";

export type Lead = {
  _id: string;
  name: string;
  contactInfo: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = "admin" | "manager" | "staff";

export type User = {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  profilePictureUrl?: string;
  role: UserRole;
  permissions: {
    dashboard?: boolean;
    orders?: boolean;
    menu?: boolean;
    swiggy?: boolean;
    zomato?: boolean;
    customers?: boolean;
    users?: boolean;
  };
  createdAt: string;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Public ----

export function getProducts() {
  return request<Product[]>("/products");
}

export function createOrder(payload: {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  paymentMethod: "cod" | "upi";
  paymentStatus: PaymentStatus;
  source?: OrderSource;
  discountCode?: string;
}) {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PaymentRecordStatus = "created" | "captured" | "failed";

export type Payment = {
  _id: string;
  order: string | { _id: string; orderNumber: string; customerName: string; total: number };
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  method?: string;
  contact?: string;
  email?: string;
  errorCode?: string;
  errorReason?: string;
  errorDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export function createRazorpayOrder(orderId: string) {
  return request<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>(`/orders/${orderId}/razorpay-order`, {
    method: "POST",
  });
}

export function verifyPayment(
  orderId: string,
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
) {
  return request<Order>(`/orders/${orderId}/verify-payment`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logFailedPayment(
  orderId: string,
  payload: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    error_code?: string;
    error_description?: string;
    error_reason?: string;
  }
) {
  return request<{ logged: boolean }>(`/orders/${orderId}/payment-failed`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function simulateOrder(payload: {
  source: OrderSource;
  customerName: string;
  phone: string;
  address: string;
  items: { productId: string; qty: number }[];
}) {
  return request<Order>("/orders/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createLead(payload: {
  name: string;
  contactInfo: string;
  message: string;
}) {
  return request<Lead>("/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Admin ----

export function adminLogin(email: string, password: string) {
  return request<{ accessToken: string; email: string; role: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminGetDashboardStats(token: string) {
  return request<any>("/orders/analytics", { token });
}

export function adminGetPayments(token: string, orderId?: string) {
  const qs = orderId ? `?orderId=${orderId}` : "";
  return request<Payment[]>(`/payments${qs}`, { token });
}

export function adminGetOrders(
  token: string,
  status?: OrderStatus,
  source?: OrderSource,
  search?: string
) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (source) params.append("source", source);
  if (search) params.append("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<Order[]>(`/orders${qs}`, { token });
}

export function adminUpdateOrderStatus(
  token: string,
  id: string,
  status: OrderStatus
) {
  return request<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export function adminUpdateOrderPaymentStatus(
  token: string,
  id: string,
  paymentStatus: PaymentStatus
) {
  return request<Order>(`/orders/${id}/payment-status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ paymentStatus }),
  });
}

export function getPublicOrder(id: string) {
  return request<{ status: OrderStatus; paymentStatus: PaymentStatus }>(`/orders/public/${id}`);
}

export function adminCreateProduct(
  token: string,
  payload: Partial<Product>
) {
  return request<Product>("/products", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function adminUpdateProduct(
  token: string,
  id: string,
  payload: Partial<Product>
) {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function adminDeleteProduct(token: string, id: string) {
  return request<{ deleted: boolean }>(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}

export function adminSyncUrbanPiperCatalog(token: string) {
  return request<{ success: boolean; isSimulated: boolean; message: string; data?: any }>("/products/sync-urbanpiper", {
    method: "POST",
    token,
  });
}

// Replaces the existing `adminUploadProductImage` function in lib/api.ts.
// Old version sent the file straight to the NestJS backend
// (`${API_URL}/products/${id}/image`), which saved it into the backend's
// own uploads folder.
//
// New version: the file is uploaded to THIS Next.js app's own
// `/api/upload` route (see app/api/upload/route.ts), which saves it into
// this app's public/uploads/products folder and returns a relative path.
// That path is then sent to the backend as a normal PATCH, using the
// already-existing adminUpdateProduct — the backend only ever stores a
// string, it never touches the file itself.

export async function adminUploadProductImage(
  token: string,
  id: string,
  file: File
) {
  const formData = new FormData();
  formData.append("image", file);

  // Same-origin call — goes to this Next.js app, NOT the backend.
  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    let message = `Upload failed with status ${uploadRes.status}`;
    try {
      const body = await uploadRes.json();
      message = body.message ?? message;
    } catch {
      // ignore non-JSON error body
    }
    throw new ApiError(message, uploadRes.status);
  }

  const { imageUrl } = (await uploadRes.json()) as { imageUrl: string };

  // Now tell the backend to save that path against the product — this
  // reuses the existing adminUpdateProduct function further up this file.
  return adminUpdateProduct(token, id, { imageUrl });
}

// Customers
export function adminGetCustomers(token: string) {
  return request<Customer[]>("/customers", { token });
}

export function adminUpdateCustomer(token: string, id: string, payload: Partial<Customer>) {
  return request<Customer>(`/customers/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function adminDeleteCustomer(token: string, id: string) {
  return request<{ deleted: boolean }>(`/customers/${id}`, {
    method: "DELETE",
    token,
  });
}

// Leads
export function adminGetLeads(token: string, search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<Lead[]>(`/admin/leads${qs}`, { token });
}

export function adminUpdateLeadStatus(token: string, id: string, status: LeadStatus) {
  return request<Lead>(`/admin/leads/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

// Users (Staff/Roles)
export function adminGetUsers(token: string) {
  return request<User[]>("/users", { token });
}

export function adminCreateUser(token: string, payload: Partial<User>) {
  return request<User>("/users", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function adminUpdateUser(token: string, id: string, payload: Partial<User>) {
  return request<User>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function adminDeleteUser(token: string, id: string) {
  return request<{ deleted: boolean }>(`/users/${id}`, {
    method: "DELETE",
    token,
  });
}

export function adminGetProfile(token: string) {
  return request<User>("/users/me", { token });
}

export function adminUpdateProfile(token: string, payload: Partial<User>) {
  return request<User>("/users/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export { ApiError }

export type Testimonial = {
  _id: string;
  name: string;
  content: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ------------------------------------------------------------------
// AUTH / PUBLIC
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// TESTIMONIALS
// ------------------------------------------------------------------

export function getTestimonials() {
  return request<Testimonial[]>("/testimonials");
}

export function adminGetTestimonials(token: string) {
  return request<Testimonial[]>("/admin/testimonials", { token });
}

export function adminCreateTestimonial(
  token: string,
  data: { name: string; content: string; rating: number; isActive?: boolean }
) {
  return request<Testimonial>("/admin/testimonials", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function adminUpdateTestimonial(
  token: string,
  id: string,
  data: Partial<{ name: string; content: string; rating: number; isActive: boolean }>
) {
  return request<Testimonial>(`/admin/testimonials/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function adminDeleteTestimonial(token: string, id: string) {
  return request<void>(`/admin/testimonials/${id}`, {
    method: "DELETE",
    token,
  });
}
