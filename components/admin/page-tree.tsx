import Link from "next/link";
import { ChevronDown, ChevronUp, Circle, FileText } from "lucide-react";
import { movePageAction } from "@/app/admin/actions";
import type { PageNode } from "@/lib/pages";

export function AdminPageTree({ nodes, depth = 0 }: { nodes: PageNode[]; depth?: number }) {
  return (
    <div className={depth ? "ml-5 border-l border-black/10 pl-3 dark:border-white/10" : ""}>
      {nodes.map((page) => (
        <div key={page.id}>
          <div className="group flex items-center gap-2 border-b border-black/[0.06] py-2.5 dark:border-white/[0.06]">
            <FileText size={15} className="shrink-0 text-black/30 dark:text-white/30" />
            <Link href={`/admin/pages/${page.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-moss-700 dark:hover:text-moss-300">
              {page.title}
            </Link>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-black/35 dark:text-white/30">
              <Circle size={6} fill="currentColor" className={page.status === "PUBLISHED" ? "text-emerald-600" : ""} />
              {page.status.toLowerCase()}
            </span>
            <form action={movePageAction.bind(null, page.id, "up")}>
              <button className="grid size-7 place-items-center rounded-md text-black/30 hover:bg-black/5 hover:text-ink dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white" aria-label={`Move ${page.title} up`}>
                <ChevronUp size={14} />
              </button>
            </form>
            <form action={movePageAction.bind(null, page.id, "down")}>
              <button className="grid size-7 place-items-center rounded-md text-black/30 hover:bg-black/5 hover:text-ink dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white" aria-label={`Move ${page.title} down`}>
                <ChevronDown size={14} />
              </button>
            </form>
          </div>
          {page.children.length ? <AdminPageTree nodes={page.children} depth={depth + 1} /> : null}
        </div>
      ))}
    </div>
  );
}
