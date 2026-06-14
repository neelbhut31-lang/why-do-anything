import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-black/[0.07] dark:border-white/[0.08]">
      <div className="container-wide flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-tight">
          Why do anything?
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="grid size-10 place-items-center rounded-full border border-black/10 transition hover:border-moss-500 hover:bg-white/60 dark:border-white/10 dark:hover:bg-white/5"
            aria-label="Search"
          >
            <Search size={17} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
