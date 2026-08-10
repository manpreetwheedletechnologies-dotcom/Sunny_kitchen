import { Module } from "@nestjs/common";
import { ShadowfaxService } from "./shadowfax.service";

@Module({
  providers: [ShadowfaxService],
  exports: [ShadowfaxService],
})
export class DeliveryModule {}
