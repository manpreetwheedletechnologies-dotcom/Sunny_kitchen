import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AdminGuard } from "../auth/admin.guard";
import { User } from "./schemas/user.schema";

@Controller("users")
@UseGuards(AdminGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get("me")
  getProfile(@Request() req: any) {
    return this.usersService.findOneById(req.user.id);
  }

  @Patch("me")
  updateProfile(@Request() req: any, @Body() updateData: Partial<User> & { password?: string }) {
    return this.usersService.update(req.user.id, updateData);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOneById(id);
  }

  @Post()
  create(@Body() data: Partial<User> & { password?: string }) {
    return this.usersService.create(data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateData: Partial<User> & { password?: string }) {
    return this.usersService.update(id, updateData);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
