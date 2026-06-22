import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getPageByPath, getPublishedStaticParams } from "@/lib/pages";
import { excerpt } from "@/lib/utils";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  try {
    return await getPublishedStaticParams();
  } catch (error) {
    console.warn("Could not prebuild published pages:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPageByPath(slug);
  if (!result) return {};
  return {
    title: result.page.title,
    description: excerpt(result.page.content),
    openGraph: result.page.featuredImage ? { images: [result.page.featuredImage] } : undefined,
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPageByPath(slug);
  if (!result) notFound();
  const { page, ancestors, children } = result;
  const basePath = `/${slug.join("/")}`;

  return (
    <>
      <article>
        <header className="container-reading pb-10 pt-14 sm:pt-20">
          <Breadcrumbs pages={ancestors} />
          <h1 className="mt-10 font-serif text-5xl leading-[1.04] tracking-[-0.03em] sm:text-7xl">
            {page.title}
          </h1>
          {page.featuredImage ? (
            <Image
              src={page.featuredImage}
              alt=""
              width={1200}
              height={675}
              priority
              className="mt-10 aspect-[16/9] w-full rounded-3xl object-cover shadow-soft"
            />
          ) : null}
        </header>
        {page.content ? (
          <div
            className="prose-wda container-reading"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : null}
      </article>

      {children.length ? (
        <section className="container-reading mt-20 border-t border-black/[0.08] pt-10 dark:border-white/[0.09]">
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/35">
            Continue exploring
          </p>
          <div className="divide-y divide-black/[0.08] dark:divide-white/[0.09]">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`${basePath}/${child.slug}`}
                className="group flex items-center justify-between gap-6 py-6"
              >
                <div>
                  <h2 className="font-serif text-2xl">{child.title}</h2>
                  {child.content ? (
                    <p className="mt-1 line-clamp-1 text-sm text-black/45 dark:text-white/40">
                      {excerpt(child.content)}
                    </p>
                  ) : null}
                </div>
                <ArrowRight size={18} className="shrink-0 text-black/30 transition group-hover:translate-x-1 group-hover:text-moss-700 dark:group-hover:text-moss-300" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
