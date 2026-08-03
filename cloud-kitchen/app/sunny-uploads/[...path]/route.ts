import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, normalize } from "path";

// This route replaces relying on the public/ folder for serving uploaded
// images. Next.js snapshots the list of files under public/ once when the
// server starts (next start), so a file added later via fs.writeFile is
// invisible to it until the process restarts. Reading the file fresh from
// disk on every request here avoids that entirely — no restart ever needed
// after an upload.
//
// This matches requests like:
//   /sunny-uploads/products/<filename>.jpg
// which is params.path = ["products", "<filename>.jpg"]

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const STORAGE_ROOT = join(process.cwd(), "sunny-uploads-storage");

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const relativePath = params.path.join("/");

  // Block path traversal (e.g. "../../.env") — normalize and check it
  // still starts inside STORAGE_ROOT.
  const filePath = normalize(join(STORAGE_ROOT, relativePath));
  if (!filePath.startsWith(STORAGE_ROOT)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const ext = relativePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}