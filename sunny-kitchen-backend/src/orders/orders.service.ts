import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Razorpay = require("razorpay");
import * as crypto from "crypto";
import { Order, OrderDocument, OrderStatus, OrderSource, PaymentStatus } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { ProductsService } from "../products/products.service";
import { MailService } from "../mail/mail.service";
import { CustomersService } from "../customers/customers.service";
import { LeadsService } from "../leads/leads.service";
import { PaymentsService } from "../payments/payments.service";
import { LogFailedPaymentDto } from "./dto/log-failed-payment.dto";
import { ShadowfaxService } from "../delivery/shadowfax.service";

const DELIVERY_FEE = 25;
const FREE_DELIVERY_ABOVE = 299;

@Injectable()
export class OrdersService {
  private razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private mailService: MailService,
    private customersService: CustomersService,
    private leadsService: LeadsService,
    private paymentsService: PaymentsService,
    private shadowfaxService: ShadowfaxService
  ) {}

  async findAll(status?: OrderStatus, source?: OrderSource, search?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    if (source) {
      if (source === OrderSource.WEBSITE) {
        filter.source = { $in: [OrderSource.WEBSITE, null] };
      } else {
        filter.source = source;
      }
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    return this.orderModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getAnalytics() {
    const totalOrders = await this.orderModel.countDocuments();
    const websiteOrders = await this.orderModel.countDocuments({ source: { $in: [OrderSource.WEBSITE, null] } });
    const swiggyOrders = await this.orderModel.countDocuments({ source: OrderSource.SWIGGY });
    const zomatoOrders = await this.orderModel.countDocuments({ source: OrderSource.ZOMATO });
    const pendingOrders = await this.orderModel.countDocuments({ status: OrderStatus.PENDING });
    const confirmedOrders = await this.orderModel.countDocuments({ status: OrderStatus.CONFIRMED });
    const deliveredOrders = await this.orderModel.countDocuments({ status: OrderStatus.DELIVERED });
    const cancelledOrders = await this.orderModel.countDocuments({ status: OrderStatus.CANCELLED });
    
    // Revenue from non-cancelled orders
    const completedOrders = await this.orderModel.find({ status: { $ne: OrderStatus.CANCELLED } });
    const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    const leadStats = await this.leadsService.getStats();

    return {
      totalOrders,
      websiteOrders,
      swiggyOrders,
      zomatoOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
      ...leadStats,
    };
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async create(dto: CreateOrderDto) {
    // Re-price and re-validate every line against the live product record —
    // never trust price/availability sent from the client.
    let subtotal = 0;
    const verifiedItems: {
      productId: string;
      name: string;
      price: number;
      qty: number;
    }[] = [];

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productId);
      if (product.outOfStock || product.stockCount < item.qty) {
        throw new BadRequestException(
          `"${product.name}" is out of stock or doesn't have enough left`
        );
      }
      subtotal += product.price * item.qty;
      verifiedItems.push({
        productId: String(product._id),
        name: product.name,
        price: product.price,
        qty: item.qty,
      });
    }

    let discountAmount = 0;
    if (dto.discountCode && dto.discountCode.toUpperCase() === "DIRECT20") {
      discountAmount = Math.round(subtotal * 0.2); // 20% off
    }

    const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    // Decrement stock for each item now that we know the whole order is valid.
    for (const item of verifiedItems) {
      await this.productsService.decrementStock(item.productId, item.qty);
    }

    const orderNumber = `SK-${Math.floor(1000 + Math.random() * 9000)}`;
    const source = dto.source || OrderSource.WEBSITE;

    const order = await this.orderModel.create({
      orderNumber,
      customerName: dto.customerName,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      notes: dto.notes,
      items: verifiedItems,
      subtotal,
      discountCode: dto.discountCode,
      discountAmount,
      deliveryFee,
      total,
      paymentMethod: dto.paymentMethod,
      status: OrderStatus.PENDING,
      paymentStatus: dto.paymentStatus || PaymentStatus.PENDING,
      source,
    });

    // Auto update/create customer
    await this.customersService.updateFromOrder(
      dto.phone,
      dto.customerName,
      dto.email,
      dto.address,
      source
    );

    // void this.mailService.sendOrderStatusEmail(order);

    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!order) throw new NotFoundException("Order not found");

    void this.mailService.sendOrderStatusEmail(order);

    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { paymentStatus }, { new: true })
      .exec();
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async simulate(dto: {
    source: OrderSource;
    customerName: string;
    phone: string;
    address: string;
    items: { productId: string; qty: number }[];
  }) {
    const verifiedItems: any[] = [];
    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productId);
      verifiedItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        qty: item.qty,
      });
    }

    return this.create({
      customerName: dto.customerName,
      phone: dto.phone,
      address: dto.address,
      paymentMethod: "cod",
      items: verifiedItems,
      source: dto.source,
      paymentStatus: PaymentStatus.PENDING,
    });
  }

  // Called by the frontend right after the DB order is created, when
  // paymentMethod is "upi". We NEVER trust an amount from the client —
  // we always price the Razorpay order off the order that's already saved
  // in our own database.
  async createRazorpayOrder(orderId: string) {
    const order = await this.findOne(orderId);

    if (order.paymentStatus === PaymentStatus.CONFIRMED) {
      throw new BadRequestException("This order has already been paid for.");
    }

    const rzpOrder = await this.razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: String(order._id) },
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    // Log this payment attempt right away — this way even abandoned
    // checkouts (customer never completes payment) show up in the
    // dashboard, not just successful ones.
    await this.paymentsService.recordCreated({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: order.total,
      currency: "INR",
    });

    return {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  // Called by the frontend after Razorpay's checkout popup returns a
  // successful response. We recompute the signature ourselves with our
  // secret key — this is the only trustworthy way to know a payment
  // actually succeeded (never trust the frontend's word for it).
  async verifyRazorpayPayment(orderId: string, dto: VerifyPaymentDto) {
    const order = await this.findOne(orderId);

    if (order.razorpayOrderId !== dto.razorpay_order_id) {
      throw new BadRequestException("Order/payment mismatch");
    }

    const body = `${dto.razorpay_order_id}|${dto.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    if (expectedSignature !== dto.razorpay_signature) {
      throw new BadRequestException("Payment verification failed");
    }

    order.paymentStatus = PaymentStatus.CONFIRMED;
    order.status = OrderStatus.CONFIRMED;
    order.razorpayPaymentId = dto.razorpay_payment_id;
    await order.save();

    // Fetch the payment from Razorpay to know which instrument (upi, card,
    // netbanking...) the customer actually used — nice to have in the
    // dashboard, but never critical to the verification itself.
    let method: string | undefined;
    try {
      const payment = await this.razorpay.payments.fetch(dto.razorpay_payment_id);
      method = payment?.method;
    } catch {
      // non-fatal — dashboard will just show the method as blank
    }

    await this.paymentsService.markCaptured(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      method
    );

    void this.mailService.sendOrderStatusEmail(order);

    return order;
  }

  // Called by the frontend whenever a payment attempt doesn't succeed —
  // either Razorpay reported an explicit failure, or the customer closed
  // the checkout popup without paying. Either way: log it for the Payments
  // dashboard, restore the stock we reserved at order-creation time, and
  // delete the order — we never want an unpaid order sitting in the
  // Orders list or db.
  async logFailedPayment(orderId: string, dto: LogFailedPaymentDto) {
    const order = await this.findOne(orderId);

    await this.paymentsService.markFailed(
      dto.razorpay_order_id ?? order.razorpayOrderId,
      {
        razorpayPaymentId: dto.razorpay_payment_id,
        errorCode: dto.error_code,
        errorReason: dto.error_reason,
        errorDescription: dto.error_description,
      }
    );

    // Don't touch orders that somehow already got confirmed in the
    // meantime (e.g. a late/duplicate failure callback after success).
    if (order.paymentStatus === PaymentStatus.CONFIRMED) {
      return { logged: true };
    }

    // Either way, the stock we reserved at order-creation time should be
    // released — this order isn't going to be fulfilled as-is.
    for (const item of order.items) {
      await this.productsService.incrementStock(item.productId, item.qty);
    }

    if (dto.error_reason === "cancelled_by_user") {
      // Customer explicitly closed the checkout popup without paying —
      // there was never a real payment attempt, so don't keep a record.
      await this.orderModel.findByIdAndDelete(orderId).exec();
    } else {
      // A genuine payment attempt was made and Razorpay reported failure
      // (card declined, bank error, etc). Keep the order visible so the
      // customer/admin can see it happened and retry — just mark it as
      // failed instead of silently deleting it.
      order.paymentStatus = PaymentStatus.USER_NOT_DONE;
      await order.save();
    }

    return { logged: true };
  }

  async createFromUrbanPiper(upOrder: any) {
    const details = upOrder.details || {};
    const customer = upOrder.customer || {};
    const deliveryAddress = upOrder.delivery_address || {};
    const items = upOrder.items || [];

    let source = OrderSource.WEBSITE;
    const channel = String(details.channel || "").toLowerCase();
    if (channel.includes("swiggy")) {
      source = OrderSource.SWIGGY;
    } else if (channel.includes("zomato")) {
      source = OrderSource.ZOMATO;
    }

    const customerName = customer.name || "Platform Customer";
    const phone = customer.phone || "0000000000";
    const email = customer.email || undefined;
    const address = [deliveryAddress.line_1, deliveryAddress.line_2]
      .filter(Boolean)
      .join(", ") || "Platform Delivery Address";

    const verifiedItems: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      let product: any = null;
      if (item.merchant_id) {
        try {
          product = await this.productsService.findOne(item.merchant_id);
        } catch {
          // ignore
        }
      }

      if (!product) {
        const allProducts = await this.productsService.findAll();
        product = allProducts.find(
          (p) => p.name.toLowerCase() === String(item.title).toLowerCase()
        );
      }

      const productId = product ? String(product._id) : "external_item";
      const name = item.title || "Unknown Item";
      const price = item.price || 0;
      const qty = item.quantity || 1;

      calculatedSubtotal += price * qty;
      verifiedItems.push({
        productId,
        name,
        price,
        qty,
      });

      if (product) {
        try {
          await this.productsService.decrementStock(String(product._id), qty);
        } catch {
          // ignore
        }
      }
    }

    const orderNumber = details.ext_platforms?.[0]?.id || `UP-${details.id || Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = calculatedSubtotal;
    const deliveryFee = details.order_level_total_charges?.delivery_charges || 0;
    const total = details.order_level_total_charges?.total || (subtotal + deliveryFee);

    const order = await this.orderModel.create({
      orderNumber,
      customerName,
      phone,
      email,
      address,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "upi",
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.CONFIRMED,
      source,
    });

    await this.customersService.updateFromOrder(
      phone,
      customerName,
      email,
      address,
      source
    );

    return order;
  }
  // Admin-triggered from the dashboard — sends a "did your order arrive
  // okay?" email for a delivered order. Not automatic, unlike the
  // regular status-change emails.
  async sendFeedbackEmail(id: string) {
    const order = await this.findOne(id);
    await this.mailService.sendFeedbackRequestEmail(order);
    return { sent: true };
  }

  // Admin-triggered — kitchen has finished preparing the order and wants
  // Shadowfax to assign a rider to pick it up. Deliberately manual (not
  // fired automatically on a status change) so we never summon a rider
  // before the food is actually ready.
  async requestDelivery(id: string) {
    const order = await this.findOne(id);
    const result = await this.shadowfaxService.createDeliveryRequest(order);

    if (result.awb) {
      order.shadowfaxAwb = result.awb;
      order.deliveryStatus = "requested";
      order.deliveryRequestedAt = new Date();

      // Fetch the customer-facing tracking link right away so it's ready
      // to show/email without the customer needing to wait or refresh.
      const trackingUrl = await this.shadowfaxService.getTrackingUrl(result.awb);
      if (trackingUrl) order.deliveryTrackingUrl = trackingUrl;

      await order.save();
      void this.mailService.sendOrderStatusEmail(order);
    }

    return { awb: result.awb };
  }

  // Admin-triggered "🔄 Refresh tracking link" — Shadowfax sometimes
  // doesn't have a customer_track_url ready immediately after order
  // creation (e.g. while status is still "new", before a rider is
  // assigned). This re-fetches it without creating a duplicate delivery
  // request, so admin can just retry once a rider's been assigned.
  async refreshTrackingUrl(id: string) {
    const order = await this.findOne(id);
    if (!order.shadowfaxAwb) {
      throw new Error("This order has no delivery request yet");
    }

    const trackingUrl = await this.shadowfaxService.getTrackingUrl(order.shadowfaxAwb);
    if (trackingUrl) {
      order.deliveryTrackingUrl = trackingUrl;
      await order.save();
    }

    return { trackingUrl: trackingUrl ?? null };
  }

  // Called by Shadowfax's Push Callback whenever a shipment's status
  // changes (assigned, out for delivery, delivered, etc). Public route —
  // Shadowfax's server calls this directly, not our admin panel.
  async handleShadowfaxWebhook(payload: any) {
    const order = await this.orderModel
      .findOne({ orderNumber: payload.order_id })
      .exec();
    if (!order) return { received: true }; // unknown/unrelated order — ignore quietly

    order.deliveryStatus = payload.event;
    if (payload.rider_name) order.riderName = payload.rider_name;
    if (payload.rider_contact) order.riderPhone = payload.rider_contact;

    // Mirror Shadowfax's delivery progress onto our own order status so
    // the existing OrderStatusTracker on the dashboard/confirmation page
    // reflects it automatically.
    if (payload.event === "ofd" || payload.event === "assigned_for_delivery") {
      order.status = OrderStatus.OUT_FOR_DELIVERY;
    }
    if (payload.event === "delivered") {
      order.status = OrderStatus.DELIVERED;
    }

    await order.save();
    void this.mailService.sendOrderStatusEmail(order);
    return { received: true };
  }

  // Public — checked from checkout before payment, so we never accept an
  // order for an area Shadowfax can't actually deliver to.
  async checkServiceability(pincode: string) {
    const serviceable = await this.shadowfaxService.checkServiceability(pincode);
    return { serviceable };
  }
}
