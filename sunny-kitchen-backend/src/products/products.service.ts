import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product, ProductDocument } from "./schemas/product.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  findAll() {
    return this.productModel.find().sort({ sortOrder: 1, createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async remove(id: string) {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("Product not found");
    return { deleted: true };
  }

  /** Used by the orders service to check availability and decrement stock. */
  async decrementStock(id: string, qty: number) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    if (product.outOfStock || product.stockCount < qty) {
      throw new Error(`"${product.name}" doesn't have enough stock`);
    }
    product.stockCount -= qty;
    if (product.stockCount <= 0) {
      product.stockCount = 0;
      product.outOfStock = true;
    }
    await product.save();
    return product;
  }
}
