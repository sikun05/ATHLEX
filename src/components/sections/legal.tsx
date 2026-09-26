import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="container-x max-w-3xl pb-28 pt-40">
      <p className="eyebrow">Legal</p>
      <h1 className="display mt-4 text-6xl sm:text-7xl">{title}</h1>
      <p className="mt-4 font-mono text-xs text-smoke">Last updated {updated}</p>
      <div className="mt-12 space-y-6 leading-relaxed text-bone/80 [&_h2]:display [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:text-bone [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">{children}</div>
    </article>
  );
}
