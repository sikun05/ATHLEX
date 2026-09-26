import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { programs } from "@/lib/content";
import { getPosts } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"],
    ["/membership", 0.9, "weekly"],
    ["/free-trial", 0.9, "monthly"],
    ["/programs", 0.8, "monthly"],
    ["/schedule", 0.8, "weekly"],
    ["/trainers", 0.7, "monthly"],
    ["/about", 0.6, "monthly"],
    ["/gallery", 0.6, "weekly"],
    ["/transformations", 0.6, "monthly"],
    ["/calculators", 0.5, "yearly"],
    ["/blog", 0.7, "weekly"],
    ["/contact", 0.7, "yearly"],
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
    ["/refund-policy", 0.2, "yearly"],
  ];
  const posts = await getPosts();
  return [
    ...staticPaths.map(([p, priority, changeFrequency]) => ({ url: `${site.url}${p}`, lastModified: now, priority, changeFrequency })),
    ...programs.map((p) => ({ url: `${site.url}/programs/${p.slug}`, lastModified: now, priority: 0.6, changeFrequency: "monthly" as const })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.5, changeFrequency: "yearly" as const })),
  ];
}
