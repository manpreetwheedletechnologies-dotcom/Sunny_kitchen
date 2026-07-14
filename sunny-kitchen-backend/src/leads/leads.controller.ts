import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { AdminGuard } from "../auth/admin.guard";

@Controller("leads")
export class LeadsPublicController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }
}

@Controller("admin/leads")
export class LeadsAdminController {
  constructor(private leadsService: LeadsService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query("search") search?: string) {
    return this.leadsService.findAll(search);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }
}
