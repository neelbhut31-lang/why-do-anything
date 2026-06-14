import type { Page } from "@prisma/client";
import { deletePageAction, savePageAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export function PageForm({
  page,
  pages,
  saved,
}: {
  page?: Page;
  pages: Page[];
  saved?: boolean;
}) {
  return (
    <form action={savePageAction} className="space-y-6">
      <input type="hidden" name="id" value={page?.id ?? ""} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/35 dark:text-white/30">{page ? "Edit page" : "New page"}</p>
          <h1 className="mt-2 font-serif text-4xl">{page?.title ?? "Untitled page"}</h1>
        </div>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-sm text-emerald-700 dark:text-emerald-400">Saved</span> : null}
          <button className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-moss-900 dark:bg-[#e9e9e2] dark:text-ink">
            Save page
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.035]">
            <label className="block text-sm font-medium">
              Title
              <input name="title" required defaultValue={page?.title} placeholder="Walking posture" className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 text-lg outline-none focus:border-moss-500 dark:border-white/10" />
            </label>
            <label className="mt-5 block text-sm font-medium">
              Slug
              <input name="slug" defaultValue={page?.slug} placeholder="Generated from title" className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 font-mono text-sm outline-none focus:border-moss-500 dark:border-white/10" />
            </label>
          </div>
          <RichTextEditor initialContent={page?.content ?? "<p>Start writing…</p>"} />
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.035]">
            <label className="block text-sm font-medium">
              Status
              <select name="status" defaultValue={page?.status ?? "DRAFT"} className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-medium">
              Parent page
              <select name="parentId" defaultValue={page?.parentId ?? ""} className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10">
                <option value="">None — top level</option>
                {pages.filter((item) => item.id !== page?.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.035]">
            <p className="mb-3 text-sm font-medium">Featured image</p>
            <ImageField initialValue={page?.featuredImage ?? ""} />
          </div>
          {page ? <DeleteButton action={deletePageAction.bind(null, page.id)} /> : null}
        </aside>
      </div>
    </form>
  );
}
