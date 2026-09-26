"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="grid min-h-[70dvh] place-items-center px-5 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display mt-4 text-6xl sm:text-8xl">Missed rep.</h1>
        <p className="mx-auto mt-4 max-w-md text-smoke">An unexpected error occurred. Try again — if it keeps happening, contact the front desk.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-ash">Ref: {error.digest}</p>}
        <button onClick={reset} className="mt-8 inline-flex h-12 items-center rounded-full bg-volt px-6 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
          Try again
        </button>
      </div>
    </main>
  );
}
