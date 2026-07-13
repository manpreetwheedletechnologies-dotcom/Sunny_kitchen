import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
