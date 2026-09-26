import "server-only";
import { cache } from "react";
import { getRepo, eq, type Row } from "@/lib/db";
import * as content from "@/lib/content";
import type { BlogCategory, BlogPost, ClassSchedule, ClassType, GalleryCategory, GalleryItem, Plan, Testimonial, Trainer } from "@/lib/types";

/**
 * Public-facing content queries. Read from the database (Supabase or demo
 * store) and fall back to the bundled placeholder content if the table is
 * empty or unreachable, so the marketing site never renders blank.
 */
async function safeList(table: string, opts: Parameters<Awaited<ReturnType<typeof getRepo>>["list"]>[1]) {
  try {
    const repo = await getRepo("public");
    return await repo.list(table, opts);
  } catch (e) {
    console.warn(`[data] ${table} unavailable, using placeholder content`, (e as Error).message);
    return [] as Row[];
  }
}

const toPlan = (r: Row): Plan => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  durationMonths: r.duration_months,
  durationDays: r.duration_days,
  price: r.price_paise,
  compareAt: r.compare_at_paise ?? undefined,
  tagline: r.tagline,
  features: r.features ?? [],
  highlighted: r.is_highlighted,
});

export const getPlans = cache(async (): Promise<Plan[]> => {
  const rows = await safeList("membership_plans", { filters: [eq("status", "active")], order: [{ col: "sort_order" }] });
  return rows.length ? rows.map(toPlan) : content.plans;
});

export const getTrainers = cache(async (): Promise<Trainer[]> => {
  const rows = await safeList("trainers", { filters: [eq("status", "active")], order: [{ col: "sort_order" }] });
  if (!rows.length) return content.trainers;
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    position: r.position,
    specialization: r.specialization,
    experienceYears: r.experience_years,
    bio: r.bio,
    image: r.image_url ?? "",
    certifications: r.certifications ?? [],
    social: r.social ?? {},
  }));
});

export const getClassTimetable = cache(async (): Promise<{ classes: ClassType[]; schedules: ClassSchedule[] }> => {
  const [cls, sch] = await Promise.all([
    safeList("classes", { filters: [eq("status", "active")] }),
    safeList("class_schedules", { filters: [eq("status", "active")], order: [{ col: "day_of_week" }, { col: "start_time" }] }),
  ]);
  if (!cls.length || !sch.length) return { classes: content.classTypes, schedules: content.classSchedules };
  return {
    classes: cls.map((c) => ({ id: c.id, slug: c.slug, name: c.name, category: c.category, durationMin: c.duration_min, intensity: c.intensity, description: c.description })),
    schedules: sch.map((s) => ({
      id: s.id,
      classId: s.class_id,
      trainerId: s.trainer_id,
      day: s.day_of_week,
      start: String(s.start_time).slice(0, 5),
      end: String(s.end_time).slice(0, 5),
      room: s.room,
      capacity: s.capacity,
      booked: 0,
    })),
  };
});

export const getGallery = cache(async (): Promise<GalleryItem[]> => {
  const [rows, cats] = await Promise.all([
    safeList("gallery", { filters: [eq("status", "published")], order: [{ col: "sort_order" }] }),
    safeList("gallery_categories", {}),
  ]);
  if (!rows.length) return content.galleryItems;
  const slug = (id: string) => (cats.find((c) => c.id === id)?.slug ?? "gym") as GalleryCategory;
  return rows.map((r) => ({ id: r.id, title: r.title, category: slug(r.category_id), kind: r.kind, src: r.url, videoUrl: r.video_url ?? undefined, width: r.width, height: r.height }));
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const rows = await safeList("testimonials", { filters: [eq("status", "published")], order: [{ col: "sort_order" }] });
  if (!rows.length) return content.testimonials;
  return rows.map((r) => ({ id: r.id, name: r.name, image: r.image_url ?? "", rating: r.rating, review: r.review, transformation: r.transformation ?? "", memberSince: r.member_since ?? "" }));
});

const toPost = (r: Row): BlogPost => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  category: r.category as BlogCategory,
  image: r.cover_url ?? "",
  date: r.published_at ?? r.created_at,
  readMinutes: r.read_minutes,
  author: r.author,
  body: String(r.body ?? "").split(/\n{2,}/).filter(Boolean),
});

export const getPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await safeList("blog_posts", { filters: [eq("status", "published")], order: [{ col: "published_at", asc: false }] });
  const now = Date.now();
  const live = rows.filter((r) => !r.published_at || new Date(r.published_at).getTime() <= now);
  return live.length ? live.map(toPost) : content.blogPosts;
});

export const getPost = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

export const getActiveOffer = cache(async () => {
  const rows = await safeList("offers", { filters: [eq("status", "published")], order: [{ col: "created_at", asc: false }] });
  const now = Date.now();
  return rows.find((o) => (!o.starts_at || new Date(o.starts_at).getTime() <= now) && (!o.ends_at || new Date(o.ends_at).getTime() >= now)) ?? null;
});
