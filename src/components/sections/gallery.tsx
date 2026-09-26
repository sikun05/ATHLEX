"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { galleryCategories } from "@/lib/content/gallery";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { PlayBadge } from "./lightbox";

const Lightbox = dynamic(() => import("./lightbox").then((m) => m.Lightbox), { ssr: false });

export function Gallery({ items, limit, headingLevel = "h2", showFilters = true }: { items: GalleryItem[]; limit?: number; headingLevel?: "h1" | "h2"; showFilters?: boolean }) {
  const [cat, setCat] = useState<string>("all");
  const [index, setIndex] = useState<number | null>(null);

  const filtered = items.filter((i) => cat === "all" || i.category === cat);
  const visible = limit ? filtered.slice(0, limit) : filtered;
  const cats = galleryCategories.filter((c) => c.value === "all" || items.some((i) => i.category === c.value));

  return (
    <section aria-label="Gallery" className="section-y">
      <div className="container-x">
        <div className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading as={headingLevel} index="07" eyebrow="Gallery" title="Inside ATHLEX." />
          {limit && (
            <Link href="/gallery" className="font-mono text-xs uppercase tracking-[0.2em] text-volt hover:underline">
              Full gallery →
            </Link>
          )}
        </div>

        {showFilters && (
          <LayoutGroup id="gallery-filters">
            <div role="tablist" aria-label="Gallery categories" className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
              {cats.map((c) => (
                <button
                  key={c.value}
                  role="tab"
                  aria-selected={cat === c.value}
                  onClick={() => setCat(c.value)}
                  className={cn("relative shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors", cat === c.value ? "text-ink" : "text-smoke hover:text-bone")}
                >
                  {cat === c.value && <motion.span layoutId="gallery-pill" className="absolute inset-0 rounded-full bg-volt" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{c.label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        )}

        <motion.ul layout className="grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-3 lg:auto-rows-[240px] lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => {
              const tall = item.height > item.width * 1.1;
              const wide = !tall && i % 5 === 0;
              return (
                <motion.li
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(tall && "row-span-2", wide && "md:col-span-2")}
                >
                  <button
                    onClick={() => setIndex(i)}
                    data-cursor="view"
                    aria-label={`Open ${item.kind === "video" ? "video" : "image"}: ${item.title}`}
                    className="group relative block size-full overflow-hidden rounded-[var(--radius-card)] bg-graphite"
                  >
                    <Photo src={item.src} alt={item.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-110" />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                    {item.kind === "video" && <PlayBadge />}
                    <span className="absolute bottom-3 left-3 right-3 translate-y-2 text-left opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <span className="block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-volt">{item.category}</span>
                      <span className="block text-sm font-semibold">{item.title}</span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {visible.length === 0 && <p className="py-16 text-center text-smoke">Nothing here yet — check back soon.</p>}
      </div>

      <Lightbox items={visible} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
