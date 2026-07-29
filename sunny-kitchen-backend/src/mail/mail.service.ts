import { Injectable, Logger } from "@nestjs/common";
import emailjs from "@emailjs/nodejs";
import { Order, OrderStatus } from "../orders/schemas/order.schema";

const STATUS_MESSAGES: Record<OrderStatus, { subject: string; line: string; emoji: string }> = {
  [OrderStatus.PENDING]: {
    subject: "We've got your order",
    line: "We've received your order and it's waiting to be confirmed.",
    emoji: "⏳",
  },
  [OrderStatus.CONFIRMED]: {
    subject: "Your order is confirmed!",
    line: "Good news — your order has been confirmed and the kitchen is getting ready to cook it.",
    emoji: "🎉",
  },
  [OrderStatus.PREPARING]: {
    subject: "Your food is being prepared",
    line: "Your order is now being freshly prepared in the kitchen.",
    emoji: "👩‍🍳",
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    subject: "Your order is on its way!",
    line: "Your order has left the kitchen and is on its way to you.",
    emoji: "🛵",
  },
  [OrderStatus.DELIVERED]: {
    subject: "Enjoy your meal!",
    line: "Your order has been delivered. We hope you enjoy it — thanks for ordering from Sunny's Kitchen!",
    emoji: "🍽️",
  },
  [OrderStatus.CANCELLED]: {
    subject: "Your order was cancelled",
    line: "Your order has been cancelled. If this wasn't expected, please get in touch with us.",
    emoji: "❌",
  },
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private configured = false;

  constructor() {
    const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } =
      process.env;

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY,
        // Private key is optional but strongly recommended — without it,
        // anyone who has your Service ID + Template ID could trigger sends.
        privateKey: EMAILJS_PRIVATE_KEY,
      });
      this.configured = true;
    } else {
      this.logger.warn(
        "EmailJS is not configured (EMAILJS_SERVICE_ID/EMAILJS_TEMPLATE_ID/EMAILJS_PUBLIC_KEY missing) — order status emails will be skipped."
      );
    }
  }

  async sendOrderStatusEmail(order: Order & { email?: string }) {
    if (!this.configured || !order.email) return;

    const copy = STATUS_MESSAGES[order.status];
    if (!copy) return;

    const itemsList = order.items
      .map((i) => `${i.qty} x ${i.name} — Rs.${i.qty * i.price}`)
      .join("\n");

    const templateParams = {
      to_email: order.email,
      customer_name: order.customerName,
      order_number: order.orderNumber,
      status_emoji: copy.emoji,
      status_subject: copy.subject,
      status_line: copy.line,
      items_list: itemsList,
      delivery_fee: order.deliveryFee,
      total: order.total,
      address: order.address,
    };

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID as string,
        process.env.EMAILJS_TEMPLATE_ID as string,
        templateParams
      );
    } catch (err) {
      // Never let a failed email break the order-status update itself.
      this.logger.error(`Failed to send status email for ${order.orderNumber} error : ${err}`, err as Error);
      console.log(JSON.stringify(err, null, 2));
    }
  }
}