import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

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
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from("media")
    .upload(filename, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload failed:", error.message);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(filename);
  const url = publicUrl.publicUrl;
  await db.media.create({
    data: { filename, url, mimeType: file.type, size: file.size, altText: file.name },
  });
  return NextResponse.json({ url });
}
