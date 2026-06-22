"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type InstantLinkProps = {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-label"?: string;
};

export function InstantLink({
  href,
  className,
  style,
  children,
  "aria-label": ariaLabel,
}: InstantLinkProps) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  const prefetched = useRef(false);
  const [pending, setPending] = useState(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    router.prefetch(href);
  }, [href, router]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prefetch();
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    setPending(true);
  }

  return (
    <Link
      ref={ref}
      href={href}
      prefetch
      aria-label={ariaLabel}
      className={className}
      style={style}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      onClick={handleClick}
    >
      {children}
      {pending ? (
        <span className="pointer-events-none absolute inset-x-5 bottom-4 h-px overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <span className="block h-full w-1/2 animate-link-progress rounded-full bg-moss-500" />
        </span>
      ) : null}
    </Link>
  );
}
