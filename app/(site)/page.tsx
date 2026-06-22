import { TopicCard } from "@/components/topic-card";
import { getPublishedTree } from "@/lib/pages";

export const revalidate = 300;

export default async function HomePage() {
  const topics = await getPublishedTree();

  return (
    <>
      <section className="container-wide pb-20 pt-20 sm:pb-28 sm:pt-28">
        <div className="max-w-4xl animate-fade-up">
          <p className="mb-6 text-xs uppercase tracking-[0.24em] text-moss-700 dark:text-moss-300">
            A library for body awareness
          </p>
          <h1 className="font-serif text-6xl leading-[0.98] tracking-[-0.04em] sm:text-8xl lg:text-9xl">
            Why do anything?
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-black/55 sm:text-2xl dark:text-white/50">
            Understand what your daily habits are doing to your body.
          </p>
        </div>
      </section>

      <section className="container-wide">
        <div className="mb-9 flex items-end justify-between border-b border-black/[0.08] pb-5 dark:border-white/[0.09]">
          <h2 className="font-serif text-3xl sm:text-4xl">What are you trying to understand?</h2>
          <span className="hidden text-sm text-black/40 sm:block dark:text-white/35">
            {topics.length} areas
          </span>
        </div>
        {topics.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <TopicCard key={topic.id} page={topic} href={`/${topic.slug}`} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/15 px-8 py-16 text-center text-black/45 dark:border-white/15 dark:text-white/40">
            The library is being prepared.
          </div>
        )}
      </section>
    </>
  );
}
