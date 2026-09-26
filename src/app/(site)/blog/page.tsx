import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { BlogList } from "@/components/sections/blog-list";
import { getPosts } from "@/lib/data";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Fitness Journal — Workouts, Nutrition & Tips",
  description: "Coach-written articles on strength training, nutrition, fat loss, muscle building and healthy lifestyle habits.",
  path: "/blog",
  image: media.blog.b1,
});

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero eyebrow="Journal" title="Train smarter. Live better." image={media.blog.b4} />
      <section className="container-x pb-28">
        <BlogList posts={posts} />
      </section>
    </>
  );
}
