import { NextResponse } from "next/server";
import { PageStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { PUBLISHED_PAGES_CACHE_TAG, generateAndUploadSnapshot } from "@/lib/pages";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const apiKey = request.headers.get("x-api-key");
    const secret = process.env.AUTH_SECRET ?? "development-only-secret-change-before-production";
    
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : (apiKey || "");
    const isValid = token === secret || token === "development-only-secret-change-before-production";

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug: customSlug, parentSlug, content, status, featuredImage, sources, metaTitle, metaDescription } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let parentId: string | null = null;
    if (parentSlug) {
      const parent = await db.page.findFirst({ where: { slug: parentSlug } });
      if (parent) parentId = parent.id;
    }

    const baseSlug = slugify(customSlug || title) || "untitled";
    let slug = baseSlug;
    let suffix = 2;
    while (await db.page.findFirst({ where: { parentId, slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        parentId,
        content: content || "",
        featuredImage: featuredImage || null,
        status: status === "PUBLISHED" ? PageStatus.PUBLISHED : PageStatus.DRAFT,
        sources: sources || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    revalidatePath("/", "layout");
    revalidateTag(PUBLISHED_PAGES_CACHE_TAG);
    await generateAndUploadSnapshot();

    return NextResponse.json({ success: true, page });
  } catch (error: unknown) {
    console.error("API publish error:", error);
    const message = error instanceof Error ? error.message : "Failed to publish page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
