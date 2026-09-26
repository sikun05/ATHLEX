import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Contact } from "@/components/sections/contact";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Location",
  description: `Visit ${site.name} at ${site.address.street}, ${site.address.city}. Call ${site.phone}, WhatsApp us or send a message.`,
  path: "/contact",
  image: media.contact,
});

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk training." image={media.contact} />
      <div className="-mt-10">
        <Contact />
      </div>
    </>
  );
}
