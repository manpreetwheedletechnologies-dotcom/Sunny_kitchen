import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TestimonialsService } from "./testimonials.service";
import { TestimonialsController } from "./testimonials.controller";
import { Testimonial, TestimonialSchema } from "./schemas/testimonial.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
    AuthModule,
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
})
export class TestimonialsModule {}
