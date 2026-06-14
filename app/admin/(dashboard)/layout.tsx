import Link from "next/link";
import { BookOpen, ExternalLink, LogOut, Plus } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f3f2ed] dark:bg-[#141613]">
      <header className="border-b border-black/[0.08] bg-white/70 backdrop-blur dark:border-white/[0.08] dark:bg-[#1b1e1a]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/admin" className="flex items-center gap-2.5 font-serif text-lg">
            <BookOpen size={19} /> Why do anything?
          </Link>
          <div className="flex items-center gap-1">
            <span className="mr-3 hidden text-xs text-black/40 sm:block dark:text-white/35">{user.email}</span>
            <Link href="/" target="_blank" className="grid size-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" aria-label="View site">
              <ExternalLink size={16} />
            </Link>
            <form action={logoutAction}>
              <button className="grid size-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" aria-label="Sign out">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-2 lg:flex-col">
            <Link href="/admin" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-white/5">
              All pages
            </Link>
            <Link href="/admin/pages/new" className="flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white dark:bg-[#e9e9e2] dark:text-ink">
              <Plus size={16} /> New page
            </Link>
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
