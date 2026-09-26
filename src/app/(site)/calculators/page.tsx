import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Calculators } from "@/components/sections/calculators";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "BMI, BMR & Calorie Calculators",
  description: "Free fitness calculators: BMI, basal metabolic rate (Mifflin-St Jeor) and daily calorie & macro targets for fat loss or muscle gain.",
  path: "/calculators",
});

export default function CalculatorsPage() {
  return (
    <>
      <PageHero eyebrow="Fitness tools" title="Numbers that guide you." image={media.blog.b2} />
      <div className="-mt-24">
        <Calculators />
      </div>
    </>
  );
}
