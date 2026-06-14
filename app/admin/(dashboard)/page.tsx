import { AdminPageTree } from "@/components/admin/page-tree";
import { buildPageTree } from "@/lib/pages";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pages = await db.page.findMany({ orderBy: [{ displayOrder: "asc" }, { title: "asc" }] });
  const tree = buildPageTree(pages);

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.035] sm:p-7">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-black/35 dark:text-white/30">Library structure</p>
        <h1 className="mt-2 font-serif text-4xl">Pages</h1>
        <p className="mt-2 text-sm text-black/45 dark:text-white/40">
          Pages can be nested without limit. Use the arrows to change their order.
        </p>
      </div>
      {tree.length ? (
        <AdminPageTree nodes={tree} />
      ) : (
        <p className="rounded-xl border border-dashed border-black/15 py-12 text-center text-sm text-black/40 dark:border-white/15 dark:text-white/35">
          No pages yet. Start with a top-level topic.
        </p>
      )}
    </div>
  );
}
