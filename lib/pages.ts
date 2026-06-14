import "server-only";
import { PageStatus, type Page } from "@prisma/client";
import { db } from "@/lib/db";

export type PageNode = Page & { children: PageNode[] };

export function buildPageTree(pages: Page[], parentId: string | null = null): PageNode[] {
  return pages
    .filter((page) => page.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title))
    .map((page) => ({ ...page, children: buildPageTree(pages, page.id) }));
}

export async function getPublishedTree() {
  const pages = await db.page.findMany({
    where: { status: PageStatus.PUBLISHED },
    orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
  });
  return buildPageTree(pages);
}

export async function getPageByPath(segments: string[]) {
  let parentId: string | null = null;
  const ancestors: Page[] = [];

  for (const slug of segments) {
    const page: Page | null = await db.page.findFirst({
      where: { slug, parentId, status: PageStatus.PUBLISHED },
    });
    if (!page) return null;
    ancestors.push(page);
    parentId = page.id;
  }

  const page = ancestors.at(-1);
  if (!page) return null;

  const children = await db.page.findMany({
    where: { parentId: page.id, status: PageStatus.PUBLISHED },
    orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
  });

  return { page, ancestors, children };
}

export async function getPagePath(pageId: string) {
  const path: Page[] = [];
  let current = await db.page.findUnique({ where: { id: pageId } });
  while (current) {
    path.unshift(current);
    current = current.parentId
      ? await db.page.findUnique({ where: { id: current.parentId } })
      : null;
  }
  return `/${path.map((page) => page.slug).join("/")}`;
}
