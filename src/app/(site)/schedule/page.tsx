import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Schedule } from "@/components/sections/schedule";
import { getClassTimetable, getTrainers } from "@/lib/data";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Class Schedule",
  description: "Weekly timetable for Yoga, HIIT, Zumba, Strength, Functional, Cardio, Boxing and Mobility classes. Filter and book online.",
  path: "/schedule",
  image: media.programs.hiit,
});

export const revalidate = 300;

export default async function SchedulePage() {
  const [timetable, trainers] = await Promise.all([getClassTimetable(), getTrainers()]);
  return (
    <>
      <PageHero eyebrow="Timetable" title="Your week, sorted." image={media.programs.functional}>
        Reserve your spot up to 14 days ahead. Classes are included with Standard, Premium and Elite plans.
      </PageHero>
      <div className="-mt-24">
        <Schedule {...timetable} trainers={trainers} />
      </div>
    </>
  );
}
