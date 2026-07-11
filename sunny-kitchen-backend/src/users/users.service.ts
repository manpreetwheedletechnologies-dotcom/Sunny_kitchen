import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument, UserRole } from "./schemas/user.schema";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll() {
    return this.userModel.find().select("-passwordHash").exec();
  }

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string) {
    if (id === "admin-fallback") {
      return {
        _id: "admin-fallback",
        name: "Setup Admin",
        email: process.env.ADMIN_EMAIL ?? "admin@sunnyskitchen.in",
        role: UserRole.ADMIN,
      } as any;
    }
    const user = await this.userModel.findById(id).select("-passwordHash").exec();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async create(data: Partial<User> & { password?: string }) {
    const existing = await this.userModel.findOne({ email: data.email }).exec();
    if (existing) throw new ConflictException("Email already in use");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password || "changeme123", salt);

    const user = new this.userModel({
      ...data,
      passwordHash,
    });
    const saved = await user.save();
    const { passwordHash: _, ...result } = saved.toObject();
    return result;
  }

  async update(id: string, updateData: Partial<User> & { password?: string }) {
    if (id === "admin-fallback") {
      return this.create({
        name: updateData.name || "Setup Admin",
        email: updateData.email || "admin@sunnyskitchen.in",
        password: updateData.password || "changeme123",
        role: UserRole.ADMIN,
      });
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-passwordHash")
      .exec();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException("User not found");
    return { deleted: true };
  }
}
