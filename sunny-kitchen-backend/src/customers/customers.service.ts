import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Customer, CustomerDocument } from "./schemas/customer.schema";
import { OrderSource } from "../orders/schemas/order.schema";

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>
  ) {}

  async findAll() {
    return this.customerModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async updateFromOrder(
    phone: string,
    name: string,
    email?: string,
    address?: string,
    source?: OrderSource
  ) {
    const customer = await this.customerModel.findOne({ phone }).exec();
    
    const updateData: any = {
      name,
      lastOrderDate: new Date(),
    };
    if (email) updateData.email = email;
    if (address) updateData.address = address;

    if (customer) {
      if (source) {
        updateData.preferredPlatform = source;
      }
      return this.customerModel.findOneAndUpdate(
        { phone },
        { 
          $set: updateData,
          $inc: { totalOrders: 1 }
        },
        { new: true }
      ).exec();
    } else {
      return this.customerModel.create({
        phone,
        ...updateData,
        totalOrders: 1,
        preferredPlatform: source || OrderSource.WEBSITE,
      });
    }
  }

  async update(id: string, updateData: Partial<Customer>) {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async remove(id: string) {
    const customer = await this.customerModel.findByIdAndDelete(id).exec();
    if (!customer) throw new NotFoundException("Customer not found");
    return { deleted: true };
  }
}
