import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";

export function BlogSection({ posts }: { posts: BlogPost[] }) {
  return (
    <section aria-label="Fitness journal" className="section-y">
      <div className="container-x">
        <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading index="10" eyebrow="Journal" title="Train smarter." />
          <Link href="/blog" className="font-mono text-xs uppercase tracking-[0.2em] text-volt hover:underline">
            All articles →
          </Link>
        </div>
        <Stagger as="ul" className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <StaggerItem as="li" key={p.slug}>
              <PostCard post={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function PostCard({ post: p }: { post: BlogPost }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-graphite">
        <Photo src={p.image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-volt backdrop-blur">{p.category}</span>
      </div>
      <div className="mt-5 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-smoke">
        <time dateTime={p.date}>{formatDate(p.date)}</time>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" aria-hidden /> {p.readMinutes} min read
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-volt">
        <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">
          {p.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-smoke">{p.excerpt}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
        Read more
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-volt" aria-hidden />
      </span>
    </article>
  );
}
