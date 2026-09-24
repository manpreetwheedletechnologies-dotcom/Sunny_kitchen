import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { NUTRITION_LEVELS } from "../schemas/product.schema";

export class NutritionItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  foodItem: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  emoji?: string;

  @IsIn(NUTRITION_LEVELS)
  protein: string;

  @IsIn(NUTRITION_LEVELS)
  carbs: string;

  @IsIn(NUTRITION_LEVELS)
  healthyFats: string;

  @IsIn(NUTRITION_LEVELS)
  fiber: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  vitamins?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  benefit?: string;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockCount?: number;

  @IsOptional()
  @IsBoolean()
  outOfStock?: boolean;

  @IsOptional()
  @IsBoolean()
  isCombo?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsBoolean()
  isNutritionMeal?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => NutritionItemDto)
  nutrition?: NutritionItemDto[];
}
