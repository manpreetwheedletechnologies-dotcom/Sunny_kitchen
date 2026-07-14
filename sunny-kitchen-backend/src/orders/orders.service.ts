import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument, OrderStatus, OrderSource } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProductsService } from "../products/products.service";
import { MailService } from "../mail/mail.service";
import { CustomersService } from "../customers/customers.service";
import { LeadsService } from "../leads/leads.service";

const DELIVERY_FEE = 25;
const FREE_DELIVERY_ABOVE = 299;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private mailService: MailService,
    private customersService: CustomersService,
    private leadsService: LeadsService
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

    const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

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
      deliveryFee,
      total,
      paymentMethod: dto.paymentMethod,
      status: OrderStatus.PENDING,
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

    void this.mailService.sendOrderStatusEmail(order);

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
}
