import "server-only";
import { unstable_cache } from "next/cache";
import { PageStatus, type Page } from "@prisma/client";
import { db } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

export type PageNode = Page & { children: PageNode[] };
export const PUBLISHED_PAGES_CACHE_TAG = "published-pages";

export function buildPageTree(pages: Page[], parentId: string | null = null): PageNode[] {
  return pages
    .filter((page) => page.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title))
    .map((page) => ({ ...page, children: buildPageTree(pages, page.id) }));
}

export async function fetchSnapshotFromStorage(): Promise<Page[] | null> {
  try {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      console.warn("Supabase credentials not configured in environment.");
      return null;
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("media")
      .download("published-pages.json");

    if (error) {
      const errStatus = (error as { status?: number }).status;
      if (error.message.includes("Object not found") || errStatus === 404) {
        console.info("Snapshot published-pages.json not found in Supabase Storage. Will query database.");
      } else {
        console.warn("Error downloading snapshot from Supabase Storage:", error.message);
      }
      return null;
    }

    if (data) {
      const text = await data.text();
      const rawPages = JSON.parse(text);
      if (Array.isArray(rawPages)) {
        return rawPages.map((p: Omit<Page, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string }) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to fetch snapshot from Supabase Storage:", err);
  }
  return null;
}

export async function generateAndUploadSnapshot() {
  try {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      console.warn("Supabase credentials not configured. Cannot generate snapshot.");
      return;
    }

    const pages = await db.page.findMany({
      where: { status: PageStatus.PUBLISHED },
      orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
    });

    const jsonStr = JSON.stringify(pages);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage
      .from("media")
      .upload("published-pages.json", Buffer.from(jsonStr), {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.error("Failed to upload snapshot to Supabase Storage:", error.message);
    } else {
      console.info("Successfully updated published-pages snapshot in Supabase Storage.");
    }
  } catch (err) {
    console.error("Error in generateAndUploadSnapshot:", err);
  }
}

export const getPublishedPages = unstable_cache(
  async () => {
    const snapshot = await fetchSnapshotFromStorage();
    if (snapshot) {
      return snapshot;
    }
    return db.page.findMany({
      where: { status: PageStatus.PUBLISHED },
      orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
    });
  },
  ["published-pages"],
  { revalidate: 86400, tags: [PUBLISHED_PAGES_CACHE_TAG] },
);

export async function getPublishedTree() {
  let pages: Page[];
  try {
    pages = await getPublishedPages();
  } catch (error) {
    console.warn("Could not load published page tree:", error);
    return [];
  }
  return buildPageTree(pages);
}

export async function getPageByPath(segments: string[]) {
  let pages: Page[];
  try {
    pages = await getPublishedPages();
  } catch (error) {
    console.warn("Could not load published page:", error);
    return null;
  }
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

export async function getPublishedStaticParams() {
  const pages = await getPublishedPages();

  function getSegments(page: Page): string[] {
    const ancestors: string[] = [];
    let current: Page | undefined = page;

    while (current) {
      ancestors.unshift(current.slug);
      current = current.parentId
        ? pages.find((candidate) => candidate.id === current?.parentId)
        : undefined;
    }

    return ancestors;
  }

  return pages.map((page) => ({ slug: getSegments(page) }));
}
