import { ChevronRight } from "lucide-react";
import type { Page } from "@prisma/client";
import { InstantLink } from "@/components/instant-link";

export function Breadcrumbs({ pages }: { pages: Page[] }) {
  let path = "";
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-black/45 dark:text-white/40">
      <InstantLink href="/" className="transition hover:text-ink dark:hover:text-white">Home</InstantLink>
      {pages.map((page, index) => {
        path += `/${page.slug}`;
        const current = index === pages.length - 1;
        return (
          <span key={page.id} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="opacity-50" />
            {current ? (
              <span className="text-black/70 dark:text-white/70">{page.title}</span>
            ) : (
              <InstantLink href={path} className="transition hover:text-ink dark:hover:text-white">
                {page.title}
              </InstantLink>
            )}
          </span>
        );
      })}
    </nav>
  );
}
