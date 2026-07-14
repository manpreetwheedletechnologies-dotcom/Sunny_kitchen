import { IsEnum, IsNotEmpty } from "class-validator";

export enum LeadStatusEnum {
  NEW = "New",
  CONTACTED = "Contacted",
  QUALIFIED = "Qualified",
  CLOSED = "Closed",
}

export class UpdateLeadDto {
  @IsNotEmpty()
  @IsEnum(LeadStatusEnum)
  status: string;
}
