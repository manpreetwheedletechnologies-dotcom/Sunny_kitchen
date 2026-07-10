const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Turns a relative "/uploads/products/xyz.jpg" path from the backend into a full URL. */
export function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${API_URL}${imageUrl}`;
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
  sortOrder: number;
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
  deliveryFee: number;
  total: number;
  paymentMethod: "cod" | "upi";
  status: OrderStatus;
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
}) {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Admin ----

export function adminLogin(email: string, password: string) {
  return request<{ accessToken: string; email: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminGetOrders(token: string, status?: OrderStatus) {
  const qs = status ? `?status=${status}` : "";
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

export async function adminUploadProductImage(
  token: string,
  id: string,
  file: File
) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/products/${id}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore non-JSON error body
    }
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, res.status);
  }

  return res.json() as Promise<Product>;
}

export { ApiError };
