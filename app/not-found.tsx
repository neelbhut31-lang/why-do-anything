import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/40">404</p>
        <h1 className="mt-4 font-serif text-5xl">This page has wandered off.</h1>
        <Link href="/" className="mt-8 inline-block underline decoration-moss-500 underline-offset-4">
          Return to the library
        </Link>
      </div>
    </main>
  );
}
