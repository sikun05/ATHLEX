import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Transformations } from "@/components/sections/transformations";
import { Testimonials } from "@/components/sections/testimonials";
import { FreeTrial } from "@/components/sections/free-trial";
import { transformations } from "@/lib/content";
import { getTestimonials } from "@/lib/data";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Member Transformations",
  description: "Real before-and-after results from ATHLEX members — fat loss, strength gains and body recomposition.",
  path: "/transformations",
  image: media.gallery[13],
});

export default async function TransformationsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHero eyebrow="Results" title="Proof, not promises." image={media.gallery[4]} />
      <Transformations items={transformations} />
      <Testimonials items={testimonials} />
      <FreeTrial />
    </>
  );
}
