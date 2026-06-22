import "server-only";
import { unstable_cache } from "next/cache";
import { PageStatus, type Page } from "@prisma/client";
import { db } from "@/lib/db";

export type PageNode = Page & { children: PageNode[] };
export const PUBLISHED_PAGES_CACHE_TAG = "published-pages";

export function buildPageTree(pages: Page[], parentId: string | null = null): PageNode[] {
  return pages
    .filter((page) => page.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title))
    .map((page) => ({ ...page, children: buildPageTree(pages, page.id) }));
}

export const getPublishedPages = unstable_cache(
  async () => db.page.findMany({
    where: { status: PageStatus.PUBLISHED },
    orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
  }),
  ["published-pages"],
  { revalidate: 300, tags: [PUBLISHED_PAGES_CACHE_TAG] },
);

export async function getPublishedTree() {
  const pages = await getPublishedPages();
  return buildPageTree(pages);
}

export async function getPageByPath(segments: string[]) {
  const pages = await getPublishedPages();
  let parentId: string | null = null;
  const ancestors: Page[] = [];

  for (const slug of segments) {
    const page = pages.find((item) => item.slug === slug && item.parentId === parentId);
    if (!page) return null;
    ancestors.push(page);
    parentId = page.id;
  }

  const page = ancestors.at(-1);
  if (!page) return null;

  const children = pages
    .filter((item) => item.parentId === page.id)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));

  return { page, ancestors, children };
}

export async function getPagePath(pageId: string) {
  const pages = await getPublishedPages();
  const path: Page[] = [];
  let current = pages.find((page) => page.id === pageId) ?? null;
  while (current) {
    path.unshift(current);
    current = current.parentId ? pages.find((page) => page.id === current?.parentId) ?? null : null;
  }
  return `/${path.map((page) => page.slug).join("/")}`;
}
