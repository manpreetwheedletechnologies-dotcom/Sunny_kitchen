import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

// Saves an uploaded product image into THIS app's own
// public/sunny-uploads/products folder (not the backend's). Returns a
// relative path that Next.js will serve directly at that same path, e.g.
// /sunny-uploads/products/<file>.
//
// NOTE: intentionally NOT using a plain "/uploads/" prefix — this server
// hosts several other apps that already claim "/uploads/" in the shared
// Apache reverse-proxy config, and Apache's ProxyPass matches in file
// order (first match wins), so a generic "/uploads/" here would silently
// get captured by one of those other apps' rules. "/sunny-uploads/" is
// unique to this project, so it always falls through to this Next.js app.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "No image file was uploaded" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Only image files (jpg, png, webp, gif) are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ message: "Image must be under 10MB" }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filename = `${randomUUID()}.${ext}`;

  // process.cwd() is the Next.js project root when run via `next start`/`next dev`.
  const uploadsDir = join(process.cwd(), "public", "sunny-uploads", "products");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadsDir, filename), bytes);

  const imageUrl = `/sunny-uploads/products/${filename}`;
  return NextResponse.json({ imageUrl });
}