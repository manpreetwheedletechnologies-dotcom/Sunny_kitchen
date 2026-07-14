import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LeadsService } from "./leads.service";
import { LeadsPublicController, LeadsAdminController } from "./leads.controller";
import { Lead, LeadSchema } from "./schemas/lead.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    AuthModule,
  ],
  controllers: [LeadsPublicController, LeadsAdminController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
