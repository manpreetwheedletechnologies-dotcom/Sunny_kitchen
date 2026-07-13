import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Lead } from "./schemas/lead.schema";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";

@Injectable()
export class LeadsService {
  constructor(@InjectModel(Lead.name) private leadModel: Model<Lead>) {}

  async create(dto: CreateLeadDto) {
    const lead = new this.leadModel(dto);
    return lead.save();
  }

  async findAll(search?: string) {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { contactInfo: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }
    return this.leadModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true }
    );
    if (!lead) throw new NotFoundException("Lead not found");
    return lead;
  }

  async getStats() {
    const totalLeads = await this.leadModel.countDocuments();
    const newLeads = await this.leadModel.countDocuments({ status: "New" });
    const contactedLeads = await this.leadModel.countDocuments({ status: "Contacted" });
    return { totalLeads, newLeads, contactedLeads };
  }
}
