import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-4 text-[clamp(5rem,22vw,14rem)] leading-none text-outline">Rest day.</h1>
        <p className="mx-auto mt-4 max-w-md text-smoke">This page skipped leg day — it doesn&apos;t exist. Let&apos;s get you back to training.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center rounded-full bg-volt px-6 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
            Back home
          </Link>
          <Link href="/membership" className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-xs font-semibold uppercase tracking-[0.08em]">
            View plans
          </Link>
        </div>
      </div>
    </main>
  );
}
