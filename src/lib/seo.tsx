import type { Metadata } from "next";
import { site } from "./site";
import { media } from "./media";

export function pageMetadata({ title, description, path = "/", image }: { title: string; description: string; path?: string; image?: string }): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${site.name}`, description, url, type: "website", siteName: site.name, locale: site.locale, images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: image ? [image] : undefined },
  };
}

/** LocalBusiness → ExerciseGym structured data */
export function gymJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ExerciseGym", "HealthClub"],
    "@id": `${site.url}/#gym`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: media.og,
    logo: `${site.url}/icon.svg`,
    priceRange: "₹₹",
    foundingDate: String(site.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: site.hours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.schema, opens: h.opens, closes: h.closes })),
    sameAs: Object.values(site.social),
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "312" },
    amenityFeature: ["Weight Training Area", "Cardio Zone", "Locker Rooms", "Showers", "Recovery Area", "Parking"].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
