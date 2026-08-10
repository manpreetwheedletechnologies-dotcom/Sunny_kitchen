import { Injectable, Logger } from "@nestjs/common";
import { Order } from "../orders/schemas/order.schema";

// Our kitchen's pickup address — same one entered in the Shadowfax
// dashboard under "Manage Address". Used as both pickup AND return
// address (rto_details) since a food order that can't be delivered
// should just come back to the kitchen, not anywhere else.
const KITCHEN = {
  name: "Sunny's Kitchen",
  contact: process.env.SHADOWFAX_PICKUP_PHONE || "9999999999", // TODO: set real pickup-incharge number
  address_line_1: "H.NO. 29, Scheme 114 Part-1, Vijay Nagar",
  city: "Indore",
  state: "Madhya Pradesh",
  // Real pincode is 452010, but Shadowfax's staging sandbox only
  // recognizes 110009/560077/560007 as serviceable for order creation —
  // override via env for testing so the real address never needs
  // touching. Leave this env var unset in production.
  pincode: Number(process.env.SHADOWFAX_TEST_PICKUP_PINCODE) || 560007,
};

// Known-serviceable pincodes near our kitchen (Vijay Nagar, Indore),
// roughly 0-15 km out — checked locally FIRST, before ever calling
// Shadowfax. This matters because Shadowfax's staging sandbox doesn't
// reliably validate real serviceability (it echoes back "serviceable"
// for literally any 6-digit number, even fake ones) — so we can't rely
// on their API alone to reject far-away orders. Expand/adjust this list
// as the delivery radius changes; re-verify against the real Shadowfax
// coverage once on the production token.
const LOCAL_SERVICEABLE_PINCODES = new Set([
  452001, // Palasia, New Palasia, Old Palasia, Bhawarkuan
  452002, // Rajwada
  452008, // LIG Square
  452010, // Vijay Nagar (pickup), Scheme 78, MR-10, Bombay Hospital, Nipania, Mahalaxmi Nagar
  452012, // Rajendra Nagar
  452016, // Bengali Square, Super Corridor (some areas)
  453331, // Rau
  453555, // Super Corridor (some areas)
  560077
]);

@Injectable()
export class ShadowfaxService {
  private readonly logger = new Logger(ShadowfaxService.name);
  private baseUrl = process.env.SHADOWFAX_BASE_URL || "https://dale.staging.shadowfax.in/api";
  private token = process.env.SHADOWFAX_TOKEN;

  private get configured() {
    return Boolean(this.token);
  }

  /**
   * Sends an order to Shadowfax so they can assign a rider to pick it up
   * from our kitchen and deliver it. Called from a dashboard button once
   * the kitchen marks food as ready.
   *
   * NOTE: our Order schema stores the customer's address as one free-text
   * field, but Shadowfax requires separate city/state/pincode. Since the
   * business currently only delivers within Indore, city/state are
   * hardcoded here and the pincode is extracted from the address text.
   * If orders ever span multiple cities, the checkout form will need to
   * collect these as separate fields instead.
   */
  async createDeliveryRequest(order: Order & { orderNumber: string }) {
    if (!this.configured) {
      throw new Error("Shadowfax is not configured (SHADOWFAX_TOKEN missing)");
    }

    const pincode = extractPincode(order.address);
    if (!pincode) {
      throw new Error(
        `Could not find a 6-digit pincode in the customer's address: "${order.address}"`
      );
    }

    const body = {
      order_type: "warehouse",
      order_details: {
        client_order_id: order.orderNumber,
        actual_weight: 500, // grams — reasonable default for a food order
        product_value: order.subtotal,
        total_amount: order.total,
        payment_mode: order.paymentMethod === "cod" ? "COD" : "Prepaid",
        cod_amount: order.paymentMethod === "cod" ? order.total : 0,
        order_service: "regular",
      },
      customer_details: {
        name: order.customerName,
        contact: order.phone,
        address_line_1: order.address,
        city: KITCHEN.city, // single-city business for now — see note above
        state: KITCHEN.state,
        pincode,
      },
      pickup_details: {
        name: KITCHEN.name,
        contact: KITCHEN.contact,
        address_line_1: KITCHEN.address_line_1,
        city: KITCHEN.city,
        state: KITCHEN.state,
        pincode: KITCHEN.pincode,
      },
      rto_details: {
        name: KITCHEN.name,
        contact: KITCHEN.contact,
        address_line_1: KITCHEN.address_line_1,
        city: KITCHEN.city,
        state: KITCHEN.state,
        pincode: KITCHEN.pincode,
      },
      product_details: order.items.map((item) => ({
        sku_name: item.name,
        price: item.price,
        additional_details: { quantity: item.qty },
      })),
    };

    const res = await fetch(`${this.baseUrl}/v3/clients/orders/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      this.logger.error(
        `Shadowfax returned non-JSON for ${order.orderNumber} — status ${res.status}: ${rawText.slice(0, 300)}`
      );
      throw new Error(`Shadowfax request failed (status ${res.status})`);
    }

    // Shadowfax returns HTTP 200 even for business-logic failures — the
    // real success/failure signal is the `message` field, not the status code.
    if (!res.ok || data.message !== "Success") {
      const errorText =
        typeof data.errors === "string"
          ? data.errors
          : Array.isArray(data.errors)
            ? data.errors.join(", ")
            : data.errors
              ? JSON.stringify(data.errors)
              : data.message || `status ${res.status}`;

      this.logger.error(`Shadowfax order creation failed for ${order.orderNumber}: ${errorText}`);
      throw new Error(errorText);
    }

    this.logger.log(`Shadowfax delivery created for ${order.orderNumber}: AWB ${data.data?.awb_number}`);
    return { awb: data.data?.awb_number ?? null, raw: data };
  }

  /**
   * Fetches the customer-facing tracking link for an order, using the AWB
   * returned by createDeliveryRequest. This link is safe to send directly
   * to the customer (via email/SMS/the confirmation page) — it opens
   * Shadowfax's own live tracking page for that shipment.
   */
  async getTrackingUrl(awb: string): Promise<string | null> {
    if (!this.configured || !awb) return null;

    try {
      const res = await fetch(`${this.baseUrl}/v4/clients/orders/${awb}/track/`, {
        headers: { Authorization: `Token ${this.token}` },
      });
      const rawText = await res.text();
      const data = JSON.parse(rawText || "null");

      if (!res.ok || data?.message !== "Success") {
        this.logger.warn(`Could not fetch tracking URL for AWB ${awb} — status ${res.status}: ${rawText.slice(0, 300)}`);
        return null;
      }

      const trackUrl = data.order_details?.customer_track_url ?? null;
      this.logger.log(
        `Tracking URL for AWB ${awb}: ${trackUrl ?? `(none yet — Shadowfax order status: "${data.order_details?.status}")`}`
      );

      return trackUrl;
    } catch (err) {
      this.logger.error(`Fetching tracking URL failed for AWB ${awb}`, err as Error);
      return null;
    }
  }

  /**
   * Checks whether Shadowfax currently delivers to a given pincode.
   * Used at checkout, before payment, so we never accept an order we
   * can't actually get delivered.
   *
   * Fails OPEN (returns true / "assume serviceable") if Shadowfax isn't
   * configured or the check itself errors out — a network hiccup on our
   * side checking serviceability should never block every customer from
   * ordering. Worst case: we occasionally take an order for an area
   * Shadowfax can't reach, and it gets delivered manually instead.
   */
  async checkServiceability(pincode: string): Promise<boolean> {
    const pin = Number(pincode);

    // Local check first — fast, and doesn't depend on Shadowfax's API
    // actually validating anything (see note above the list).
    if (!LOCAL_SERVICEABLE_PINCODES.has(pin)) {
      this.logger.log(
        `Pincode ${pincode} is not in our local serviceable list — rejecting without calling Shadowfax`
      );
      return false;
    }

    if (!this.configured) return true;

    try {
      const res = await fetch(
        `${this.baseUrl}/v1/clients/serviceability/?service=customer_delivery&pincodes=${pincode}`,
        { headers: { Authorization: `Token ${this.token}` } }
      );
      const rawText = await res.text();
      this.logger.log(`Serviceability raw response for ${pincode} — status ${res.status}: ${rawText.slice(0, 500)}`);

      const data = JSON.parse(rawText || "null");

      if (!res.ok || !Array.isArray(data)) {
        this.logger.warn(`Serviceability check for ${pincode} returned unexpected response — assuming serviceable`);
        return true;
      }

      return data.some((entry: any) => String(entry.pincode ?? entry.code) === String(pincode));
    } catch (err) {
      this.logger.error(`Serviceability check failed for ${pincode}`, err as Error);
      return true;
    }
  }
}

function extractPincode(address: string): number | undefined {
  const match = address.match(/\b\d{6}\b/);
  return match ? Number(match[0]) : undefined;
}
