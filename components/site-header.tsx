import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { InstantLink } from "@/components/instant-link";

export function SiteHeader() {
  return (
    <header className="border-b border-black/[0.07] dark:border-white/[0.08]">
      <div className="container-wide flex h-20 items-center justify-between">
        <InstantLink href="/" className="font-serif text-xl tracking-tight">
          Why do anything?
        </InstantLink>
        <div className="flex items-center gap-2">
          <InstantLink
            href="/search"
            className="grid size-10 place-items-center rounded-full border border-black/10 transition hover:border-moss-500 hover:bg-white/60 dark:border-white/10 dark:hover:bg-white/5"
            aria-label="Search"
          >
            <Search size={17} />
          </InstantLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
