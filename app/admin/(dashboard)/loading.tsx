export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-8 w-48 rounded-xl bg-black/10 dark:bg-white/10" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-black/10 dark:bg-white/10" />
      </div>
      <div className="h-64 rounded-2xl border border-black/10 bg-white/50 p-6 dark:border-white/10 dark:bg-white/5" />
    </div>
  );
}
