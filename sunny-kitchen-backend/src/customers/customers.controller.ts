import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { AdminGuard } from "../auth/admin.guard";
import { Customer } from "./schemas/customer.schema";

@Controller("customers")
@UseGuards(AdminGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateData: Partial<Customer>) {
    return this.customersService.update(id, updateData);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.customersService.remove(id);
  }
}
