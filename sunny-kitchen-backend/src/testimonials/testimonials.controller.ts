import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { TestimonialsService } from "./testimonials.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { AdminGuard } from "../auth/admin.guard";

@Controller()
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  // Public endpoint
  @Get("testimonials")
  findAllActive() {
    return this.testimonialsService.findAllActive();
  }

  // Admin endpoints
  @UseGuards(AdminGuard)
  @Get("admin/testimonials")
  findAllAdmin() {
    return this.testimonialsService.findAllAdmin();
  }

  @UseGuards(AdminGuard)
  @Post("admin/testimonials")
  create(@Body() createDto: CreateTestimonialDto) {
    return this.testimonialsService.create(createDto);
  }

  @UseGuards(AdminGuard)
  @Patch("admin/testimonials/:id")
  update(@Param("id") id: string, @Body() updateDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateDto);
  }

  @UseGuards(AdminGuard)
  @Delete("admin/testimonials/:id")
  remove(@Param("id") id: string) {
    return this.testimonialsService.remove(id);
  }
}
