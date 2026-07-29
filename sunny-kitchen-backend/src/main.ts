import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { mkdirSync } from "fs";
import { AppModule } from "./app.module";
import { getUploadsRootDir, getProductsUploadsDir } from "./uploads-path";

async function bootstrap() {
  // Make sure the folder that uploaded product photos get saved to exists.
  // getUploadsRootDir() resolves a FIXED absolute path (via UPLOADS_DIR env var,
  // defaulting to a folder next to this project) instead of process.cwd(),
  // which changes depending on how/where the process happens to be launched
  // from (pm2 restart, systemd, a server reboot, etc). Relying on process.cwd()
  // caused already-uploaded images to silently "disappear" (404) whenever the
  // process was restarted from a different working directory.
  const uploadsRoot = getUploadsRootDir();
  mkdirSync(getProductsUploadsDir(), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded images at http://localhost:4000/uploads/products/<filename>
  app.useStaticAssets(uploadsRoot, { prefix: "/uploads/" });

  // eslint-disable-next-line no-console
  console.log(`Serving uploads from: ${uploadsRoot}`);

  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3001")
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
