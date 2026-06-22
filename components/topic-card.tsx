import { ArrowUpRight } from "lucide-react";
import type { Page } from "@prisma/client";
import { InstantLink } from "@/components/instant-link";
import { excerpt } from "@/lib/utils";

export function TopicCard({
  page,
  href,
  index = 0,
}: {
  page: Page;
  href: string;
  index?: number;
}) {
  return (
    <InstantLink
      href={href}
      className="group relative flex min-h-56 animate-fade-up flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.08] bg-white/45 p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-moss-500/40 hover:bg-white/75 dark:border-white/[0.09] dark:bg-white/[0.025] dark:hover:bg-white/[0.05]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {page.featuredImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.09] grayscale transition duration-500 group-hover:scale-105 group-hover:opacity-[0.14] dark:opacity-[0.12]"
          style={{ backgroundImage: `url(${page.featuredImage})` }}
        />
      ) : null}
      <div className="relative flex items-start justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/35">
          Explore
        </span>
        <ArrowUpRight
          size={19}
          className="text-black/35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-moss-700 dark:group-hover:text-moss-300"
        />
      </div>
      <div className="relative">
        <h3 className="font-serif text-3xl leading-tight">{page.title}</h3>
        {page.content ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-black/50 dark:text-white/45">
            {excerpt(page.content, 110)}
          </p>
        ) : null}
      </div>
    </InstantLink>
  );
}
