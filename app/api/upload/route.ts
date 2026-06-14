import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  await requireAdmin();
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF image" }, { status: 415 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Images must be smaller than 8 MB" }, { status: 413 });

  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  const url = `/uploads/${filename}`;
  await db.media.create({
    data: { filename, url, mimeType: file.type, size: file.size, altText: file.name },
  });
  return NextResponse.json({ url });
}
