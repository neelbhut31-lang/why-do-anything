"use server";

import { PageStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, requireAdmin, SESSION_COOKIE, verifyCredentials } from "@/lib/auth";
import { db } from "@/lib/db";
import { PUBLISHED_PAGES_CACHE_TAG, generateAndUploadSnapshot } from "@/lib/pages";
import { slugify } from "@/lib/utils";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await verifyCredentials(email, password);
  if (!user) redirect("/admin/login?error=Invalid%20email%20or%20password");
  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

async function uniqueSlug(title: string, requested: string, parentId: string | null, id?: string) {
  const base = slugify(requested || title) || "untitled";
  let slug = base;
  let suffix = 2;
  while (
    await db.page.findFirst({
      where: { parentId, slug, ...(id ? { id: { not: id } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

async function wouldCreateCycle(pageId: string, parentId: string | null) {
  let currentId = parentId;
  while (currentId) {
    if (currentId === pageId) return true;
    const parent: { parentId: string | null } | null = await db.page.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    currentId = parent?.parentId ?? null;
  }
  return false;
}

export async function savePageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");
  const rawParentId = String(formData.get("parentId") ?? "");
  const parentId = rawParentId || null;
  if (id && (await wouldCreateCycle(id, parentId))) {
    throw new Error("A page cannot be moved inside itself or one of its descendants.");
  }

  const slug = await uniqueSlug(
    title,
    String(formData.get("slug") ?? ""),
    parentId,
    id || undefined,
  );
  const data = {
    title,
    slug,
    parentId,
    content: String(formData.get("content") ?? ""),
    featuredImage: String(formData.get("featuredImage") ?? "") || null,
    status:
      String(formData.get("status") ?? "DRAFT") === "PUBLISHED"
        ? PageStatus.PUBLISHED
        : PageStatus.DRAFT,
  };

  let pageId = id;
  if (id) {
    await db.page.update({ where: { id }, data });
  } else {
    const last = await db.page.findFirst({
      where: { parentId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    const page = await db.page.create({
      data: { ...data, displayOrder: (last?.displayOrder ?? -1) + 1 },
    });
    pageId = page.id;
  }

  revalidatePath("/", "layout");
  revalidateTag(PUBLISHED_PAGES_CACHE_TAG);
  await generateAndUploadSnapshot();
  redirect(`/admin/pages/${pageId}?saved=1`);
}

export async function deletePageAction(id: string) {
  await requireAdmin();
  await db.page.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidateTag(PUBLISHED_PAGES_CACHE_TAG);
  await generateAndUploadSnapshot();
  redirect("/admin");
}

export async function movePageAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const page = await db.page.findUnique({ where: { id } });
  if (!page) return;
  const siblings = await db.page.findMany({
    where: { parentId: page.parentId },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  const index = siblings.findIndex((item) => item.id === id);
  const swapWith = siblings[index + (direction === "up" ? -1 : 1)];
  if (!swapWith) return;

  await db.$transaction([
    db.page.update({ where: { id: page.id }, data: { displayOrder: swapWith.displayOrder } }),
    db.page.update({ where: { id: swapWith.id }, data: { displayOrder: page.displayOrder } }),
  ]);
  revalidatePath("/", "layout");
  revalidateTag(PUBLISHED_PAGES_CACHE_TAG);
  await generateAndUploadSnapshot();
}
