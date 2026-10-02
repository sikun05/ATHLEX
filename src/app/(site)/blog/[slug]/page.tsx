import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { PostCard } from "@/components/sections/blog";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { getPost, getPosts } from "@/lib/data";
import { blogPosts } from "@/lib/content";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const meta = pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, image: post.image });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date, authors: [post.author] } };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author },
          publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` } },
          mainEntityOfPage: `${site.url}/blog/${post.slug}`,
        }}
      />
      <header className="container-x max-w-4xl pb-12 pt-36">
        <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-smoke hover:text-volt">
          <ArrowLeft className="size-3.5" /> Journal
        </Link>
        <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt">{post.category}</p>
        <h1 className="display mt-4 text-h2">{post.title}</h1>
        <p className="mt-6 text-lg text-smoke">{post.excerpt}</p>
        <p className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-smoke">
          <span>By {post.author}</span>·<time dateTime={post.date}>{formatDate(post.date, { day: "numeric", month: "long", year: "numeric" })}</time>·
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden /> {post.readMinutes} min read
          </span>
        </p>
      </header>
      <div className="container-x">
        <div className="relative aspect-[21/9] overflow-hidden rounded-[var(--radius-card)] bg-graphite">
          <Photo src={post.image} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>
      <Reveal className="container-x max-w-3xl py-16">
        <div className="space-y-6 text-lg leading-[1.8] text-bone/85 first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-6xl sm:first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-volt">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-14 rounded-[var(--radius-card)] border border-volt/30 bg-volt/5 p-8">
          <p className="display text-3xl">Want a plan built for you?</p>
          <p className="mt-2 text-smoke">Book a free trial and one of our coaches will build your first program.</p>
          <ButtonLink href="/free-trial" arrow className="mt-6">
            Book free trial
          </ButtonLink>
        </div>
      </Reveal>
      <section className="border-t border-white/[0.06] py-20" aria-label="Related articles">
        <div className="container-x">
          <h2 className="display mb-10 text-h3">Keep reading</h2>
          <ul className="grid gap-8 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
