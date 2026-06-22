export default function SiteLoading() {
  return (
    <main className="container-reading py-20">
      <div className="animate-pulse space-y-7">
        <div className="h-3 w-48 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="space-y-4">
          <div className="h-12 w-4/5 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-12 w-2/3 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <div className="space-y-3 pt-8">
          <div className="h-4 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-4 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-4 w-5/6 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </main>
  );
}
