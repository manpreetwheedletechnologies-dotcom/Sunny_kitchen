import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payment, PaymentDocument } from "./schemas/payment.schema";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>
  ) {}

  // Called right when we create the Razorpay order (before the customer
  // has actually paid) — this way even abandoned/never-completed
  // checkouts show up in the dashboard as "created".
  async recordCreated(params: {
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  }) {
    return this.paymentModel.create({
      order: params.orderId,
      orderNumber: params.orderNumber,
      razorpayOrderId: params.razorpayOrderId,
      amount: params.amount,
      currency: params.currency,
      status: "created",
    });
  }

  // Called once our signature verification succeeds.
  async markCaptured(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    method?: string
  ) {
    return this.paymentModel
      .findOneAndUpdate(
        { razorpayOrderId },
        { status: "captured", razorpayPaymentId, ...(method ? { method } : {}) },
        { new: true }
      )
      .exec();
  }

  // Called when Razorpay's checkout.js fires a payment.failed event.
  async markFailed(
    razorpayOrderId: string | undefined,
    payload: {
      razorpayPaymentId?: string;
      errorCode?: string;
      errorReason?: string;
      errorDescription?: string;
    }
  ) {
    if (!razorpayOrderId) return null;
    return this.paymentModel
      .findOneAndUpdate(
        { razorpayOrderId },
        {
          status: "failed",
          razorpayPaymentId: payload.razorpayPaymentId,
          errorCode: payload.errorCode,
          errorReason: payload.errorReason,
          errorDescription: payload.errorDescription,
        },
        { new: true }
      )
      .exec();
  }

  async findAll(orderId?: string) {
    const filter = orderId ? { order: orderId } : {};
    return this.paymentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("order", "orderNumber customerName total")
      .exec();
  }
}
