import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateTestimonialDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(5)
  content: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
