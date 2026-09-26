import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Gallery } from "@/components/sections/gallery";
import { getGallery } from "@/lib/data";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description: "Photos and videos from inside ATHLEX — the gym floor, equipment, coaches, workouts, events, members and transformations.",
  path: "/gallery",
  image: media.gallery[0],
});

export const revalidate = 300;

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <>
      <PageHero eyebrow="Gallery" title="See it. Feel it." image={media.gallery[2]} />
      <div className="-mt-24">
        <Gallery items={items} />
      </div>
    </>
  );
}
