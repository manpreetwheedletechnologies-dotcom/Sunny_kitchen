import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

// Saves an uploaded product image into THIS app's own public/uploads/products
// folder (not the backend's). Returns a relative path that Next.js will
// serve directly at that same path, e.g. /uploads/products/<file>.
// This keeps images on the same origin as the site, so no NEXT_PUBLIC_API_URL
// / CORS / reverse-proxy path juggling is needed to display them.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
    return NextResponse.json({ message: "Image must be under 5MB" }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filename = `${randomUUID()}.${ext}`;

  // process.cwd() is the Next.js project root when run via `next start`/`next dev`.
  const uploadsDir = join(process.cwd(), "public", "uploads", "products");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadsDir, filename), bytes);

  const imageUrl = `/uploads/products/${filename}`;
  return NextResponse.json({ imageUrl });
}