import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Order, OrderStatus } from "../orders/schemas/order.schema";

const STATUS_MESSAGES: Record<OrderStatus, { subject: string; line: string }> = {
  [OrderStatus.PENDING]: {
    subject: "We've got your order",
    line: "We've received your order and it's waiting to be confirmed.",
  },
  [OrderStatus.CONFIRMED]: {
    subject: "Your order is confirmed! 🎉",
    line: "Good news — your order has been confirmed and the kitchen is getting ready to cook it.",
  },
  [OrderStatus.PREPARING]: {
    subject: "Your food is being prepared 👩‍🍳",
    line: "Your order is now being freshly prepared in the kitchen.",
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    subject: "Your order is on its way! 🛵",
    line: "Your order has left the kitchen and is on its way to you.",
  },
  [OrderStatus.DELIVERED]: {
    subject: "Enjoy your meal! 🍽️",
    line: "Your order has been delivered. We hope you enjoy it — thanks for ordering from Sunny's Kitchen!",
  },
  [OrderStatus.CANCELLED]: {
    subject: "Your order was cancelled",
    line: "Your order has been cancelled. If this wasn't expected, please get in touch with us.",
  },
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    } else {
      this.logger.warn(
        "SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — order status emails will be skipped."
      );
    }
  }

  async sendOrderStatusEmail(order: Order & { email?: string }) {
    if (!this.transporter || !order.email) return;

    const copy = STATUS_MESSAGES[order.status];
    if (!copy) return;

    const itemsList = order.items
      .map((i) => `${i.qty} × ${i.name} — ₹${i.qty * i.price}`)
      .join("\n");

    const text = [
      `Hi ${order.customerName},`,
      "",
      copy.line,
      "",
      `Order ${order.orderNumber}`,
      itemsList,
      "",
      `Delivery fee: ₹${order.deliveryFee}`,
      `Total: ₹${order.total}`,
      "",
      `Delivering to: ${order.address}`,
      "",
      "— Sunny's Kitchen",
    ].join("\n");

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM ?? '"Sunny\'s Kitchen" <no-reply@sunnyskitchen.in>',
        to: order.email,
        subject: `${copy.subject} — Order ${order.orderNumber}`,
        text,
      });
    } catch (err) {
      // Never let a failed email break the order-status update itself.
      this.logger.error(`Failed to send status email for ${order.orderNumber}`, err as Error);
    }
  }
}
