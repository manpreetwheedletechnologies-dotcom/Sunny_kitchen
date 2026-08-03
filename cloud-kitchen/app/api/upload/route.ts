import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

// Saves an uploaded product image into a dedicated storage folder (NOT
// inside public/ — see app/sunny-uploads/[...path]/route.ts for why: files
// added to public/ after the server has started aren't served until the
// process restarts, since Next.js snapshots that folder's contents at
// startup. This route just writes the file; the [...path] route handler
// reads it fresh from disk on every request, so no restart is ever needed.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const STORAGE_ROOT = join(process.cwd(), "sunny-uploads-storage");

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

  const uploadsDir = join(STORAGE_ROOT, "products");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadsDir, filename), bytes);

  const imageUrl = `/sunny-uploads/products/${filename}`;
  return NextResponse.json({ imageUrl });
}