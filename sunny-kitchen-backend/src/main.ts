import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { mkdirSync } from "fs";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Make sure the folder that uploaded product photos get saved to exists.
  const uploadsDir = join(process.cwd(), "uploads", "products");
  mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded images at http://localhost:4000/uploads/products/<filename>
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" });

  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:4001")
    .split(",")
    .map((o) => o.trim());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Sunny's Kitchen API running on http://localhost:${port}`);
}
bootstrap();
