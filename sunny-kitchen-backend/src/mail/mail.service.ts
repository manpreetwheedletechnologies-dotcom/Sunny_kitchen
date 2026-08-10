import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
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

function wrapEmailHtml(bodyHtml: string): string {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fdf6ec; border-radius: 16px; overflow: hidden; border: 1px solid #e8ddc8;">
    <div style="background: #1f3d2b; padding: 28px 24px; text-align: center;">
      <h1 style="margin: 0; color: #fdf6ec; font-size: 24px; letter-spacing: 1px;">Sunny's Kitchen</h1>
    </div>
    <div style="padding: 28px 24px;">
      ${bodyHtml}
    </div>
    <div style="padding: 20px 24px 28px 24px; text-align: center;">
      <p style="font-size: 13px; color: #9a8f74; margin: 0;">— Sunny's Kitchen</p>
    </div>
  </div>`;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress = "Sunny's Kitchen";

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    console.log("SMTP config:", { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM });
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT ? Number(SMTP_PORT) : 587,
        // true only for port 465 (implicit TLS); 587/25 use STARTTLS instead.
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      this.fromAddress = SMTP_FROM || `Sunny's Kitchen <${SMTP_USER}>`;
    } else {
      this.logger.warn(
        "SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — emails will be skipped."
      );
    }
  }

  private async send(to: string, subject: string, html: string, context: string) {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
    } catch (err) {
      // Never let a failed email break the order-status update itself.
      this.logger.error(`Failed to send ${context} email to ${to}`, err as Error);
    }
  }

  async sendOrderStatusEmail(order: Order & { email?: string; deliveryTrackingUrl?: string }) {
    if (!order.email) return;

    const copy = STATUS_MESSAGES[order.status];
    if (!copy) return;

    const itemsList = order.items
      .map((i) => `${i.qty} x ${i.name} — Rs.${i.qty * i.price}`)
      .join("<br/>");

    const trackingButton = order.deliveryTrackingUrl
      ? `<div style="text-align: center; margin-top: 20px;">
          <a href="${order.deliveryTrackingUrl}" style="display: inline-block; background: #1f3d2b; color: #fdf6ec; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: bold; font-size: 14px;">
            📍 Track your delivery
          </a>
        </div>`
      : "";

    const html = wrapEmailHtml(
      `
      <div style="text-align: center;">
        <div style="font-size: 42px;">${copy.emoji}</div>
        <h2 style="margin: 12px 0 4px 0; color: #1f3d2b; font-size: 20px;">${copy.subject}</h2>
        <p style="color: #55604f; font-size: 15px; line-height: 1.5;">
          Hi ${order.customerName}, ${copy.line}
        </p>
      </div>
      <div style="margin-top: 20px; background: #ffffff; border: 1px solid #e8ddc8; border-radius: 12px; padding: 20px;">
        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #9a8f74;">
          Order ${order.orderNumber}
        </p>
        <p style="font-size: 14px; color: #1f3d2b; line-height: 1.6;">${itemsList}</p>
        <p style="margin-top: 16px; font-size: 14px; font-weight: bold; color: #1f3d2b;">
          Total: Rs.${order.total}
        </p>
        <p style="margin-top: 8px; font-size: 13px; color: #9a8f74;">Delivering to: ${order.address}</p>
      </div>
      ${trackingButton}`
    );

    await this.send(order.email, `${copy.subject} — Order ${order.orderNumber}`, html, "order status");
  }

  /**
   * Manually triggered from the admin dashboard (a button next to a
   * "Delivered" order) — asks the customer to confirm they actually
   * received their food, separate from the automatic status emails.
   */
  async sendFeedbackRequestEmail(order: Order & { email?: string }) {
    if (!order.email) return;

    const html = wrapEmailHtml(
      `
      <div style="text-align: center;">
        <div style="font-size: 42px;">🙏</div>
        <h2 style="margin: 12px 0 4px 0; color: #1f3d2b; font-size: 20px;">Did your order arrive okay?</h2>
        <p style="color: #55604f; font-size: 15px; line-height: 1.5;">
          Hi ${order.customerName}, we marked your order <b>${order.orderNumber}</b> as delivered —
          just checking in to make sure it actually reached you and everything was good.
          If something's missing or wrong, please reply to this email or call us and we'll sort it out right away.
        </p>
      </div>`
    );

    await this.send(
      order.email,
      `Did order ${order.orderNumber} reach you okay?`,
      html,
      "feedback request"
    );
  }
}