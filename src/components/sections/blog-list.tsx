"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { BlogPost } from "@/lib/types";
import { blogCategories } from "@/lib/content/blog";
import { PostCard } from "./blog";
import { cn } from "@/lib/utils";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [cat, setCat] = useState<string>("All");
  const shown = posts.filter((p) => cat === "All" || p.category === cat);
  return (
    <>
      <div role="tablist" aria-label="Categories" className="no-scrollbar -mx-5 mb-12 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {["All", ...blogCategories].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={cn("relative shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]", cat === c ? "text-ink" : "border border-white/10 text-smoke hover:text-bone")}
          >
            {cat === c && <motion.span layoutId="blog-pill" className="absolute inset-0 rounded-full bg-volt" />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <motion.ul layout className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.li layout key={p.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <PostCard post={p} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!shown.length && <p className="py-16 text-center text-smoke">No articles in this category yet.</p>}
    </>
  );
}
