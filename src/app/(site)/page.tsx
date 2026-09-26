import { Hero } from "@/components/sections/hero";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { About } from "@/components/sections/about";
import { Programs } from "@/components/sections/programs";
import { Trainers } from "@/components/sections/trainers";
import { Membership } from "@/components/sections/membership";
import { Transformations } from "@/components/sections/transformations";
import { FreeTrial } from "@/components/sections/free-trial";
import { Schedule } from "@/components/sections/schedule";
import { Facilities } from "@/components/sections/facilities";
import { Gallery } from "@/components/sections/gallery";
import { Calculators } from "@/components/sections/calculators";
import { Testimonials } from "@/components/sections/testimonials";
import { BlogSection } from "@/components/sections/blog";
import { Contact } from "@/components/sections/contact";
import { facilities, programs, transformations } from "@/lib/content";
import { getClassTimetable, getGallery, getPlans, getPosts, getTestimonials, getTrainers } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [plans, trainers, timetable, gallery, testimonials, posts] = await Promise.all([getPlans(), getTrainers(), getClassTimetable(), getGallery(), getTestimonials(), getPosts()]);

  return (
    <>
      <Hero />
      <MarqueeBand />
      <About />
      <Programs programs={programs} />
      <Trainers trainers={trainers} limit={3} />
      <Membership plans={plans} />
      <Transformations items={transformations.slice(0, 2)} />
      <Schedule {...timetable} trainers={trainers} compact />
      <FreeTrial />
      <Facilities items={facilities} />
      <Gallery items={gallery} limit={8} />
      <Calculators />
      <Testimonials items={testimonials} />
      <BlogSection posts={posts.slice(0, 3)} />
      <Contact />
    </>
  );
}
