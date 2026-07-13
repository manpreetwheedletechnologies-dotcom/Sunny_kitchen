import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Testimonial, TestimonialDocument } from "./schemas/testimonial.schema";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private testimonialModel: Model<TestimonialDocument>
  ) {}

  async create(createDto: CreateTestimonialDto): Promise<Testimonial> {
    const created = new this.testimonialModel(createDto);
    return created.save();
  }

  async findAllActive(): Promise<Testimonial[]> {
    return this.testimonialModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findAllAdmin(): Promise<Testimonial[]> {
    return this.testimonialModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updateDto: UpdateTestimonialDto): Promise<Testimonial> {
    const updated = await this.testimonialModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException("Testimonial not found");
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.testimonialModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("Testimonial not found");
  }
}
