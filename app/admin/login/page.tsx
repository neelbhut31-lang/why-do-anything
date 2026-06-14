import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { getSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#eeece6] px-5 dark:bg-[#141613]">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-[#1d201c]">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-700 dark:text-moss-300">Private library</p>
        <h1 className="mt-3 font-serif text-4xl">Welcome back.</h1>
        <p className="mt-3 text-sm leading-relaxed text-black/50 dark:text-white/45">
          Sign in to write, organize, and publish.
        </p>
        {error ? (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <form action={loginAction} className="mt-7 space-y-5">
          <label className="block text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-moss-500 dark:border-white/10"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-moss-500 dark:border-white/10"
            />
          </label>
          <button className="w-full rounded-xl bg-ink px-5 py-3.5 font-medium text-white transition hover:bg-moss-900 dark:bg-[#e9e9e2] dark:text-ink">
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
