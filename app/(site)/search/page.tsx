import Link from "next/link";
import { Search } from "lucide-react";
import { PageStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getPagePath } from "@/lib/pages";
import { excerpt, stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim() ?? "";
  const candidates = query
    ? await db.page.findMany({ where: { status: PageStatus.PUBLISHED } })
    : [];
  const needle = query.toLowerCase();
  const matches = candidates
    .filter((page) => `${page.title} ${stripHtml(page.content)}`.toLowerCase().includes(needle))
    .slice(0, 30);
  const results = await Promise.all(
    matches.map(async (page) => ({ page, href: await getPagePath(page.id) })),
  );

  return (
    <section className="container-reading pb-24 pt-16 sm:pt-24">
      <p className="text-xs uppercase tracking-[0.2em] text-moss-700 dark:text-moss-300">
        Search the library
      </p>
      <h1 className="mt-4 font-serif text-5xl sm:text-6xl">What are you curious about?</h1>
      <form className="relative mt-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/35 dark:text-white/35" size={20} />
        <input
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Try “walking posture” or “sleep”"
          className="w-full rounded-2xl border border-black/10 bg-white/55 py-5 pl-14 pr-5 text-lg outline-none transition placeholder:text-black/30 focus:border-moss-500 dark:border-white/10 dark:bg-white/[0.04] dark:placeholder:text-white/25"
        />
      </form>

      {query ? (
        <div className="mt-12">
          <p className="mb-4 text-sm text-black/40 dark:text-white/35">
            {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
          </p>
          <div className="divide-y divide-black/[0.08] border-t border-black/[0.08] dark:divide-white/[0.09] dark:border-white/[0.09]">
            {results.map(({ page, href }) => (
              <Link key={page.id} href={href} className="block py-7">
                <h2 className="font-serif text-2xl transition hover:text-moss-700 dark:hover:text-moss-300">{page.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/50 dark:text-white/45">
                  {excerpt(page.content, 200)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
