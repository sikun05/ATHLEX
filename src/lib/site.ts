/**
 * Brand + business details. Replace these with the real gym's information.
 * Everything public-facing (header, footer, SEO, JSON-LD, WhatsApp) reads from here.
 */
export const site = {
  name: "ATHLEX",
  legalName: "ATHLEX Performance Club Pvt. Ltd.",
  tagline: "Train hard. Live strong.",
  description:
    "ATHLEX is a premium strength & performance club in Bengaluru — elite coaching, 20+ programs, world-class equipment and memberships built around real results.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  locale: "en_IN",
  phone: "+91 98765 43210",
  phoneHref: "+919876543210",
  whatsapp: "919876543210",
  whatsappMessage: "Hi, I'm interested in joining the gym. Please share membership details.",
  email: "hello@athlex.fit",
  address: {
    street: "12, 100 Feet Road, Indiranagar",
    city: "Bengaluru",
    region: "Karnataka",
    postalCode: "560038",
    country: "IN",
  },
  geo: { lat: 12.9719, lng: 77.6412 },
  hours: [
    { days: "Mon – Fri", time: "5:00 AM – 11:00 PM", schema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "05:00", closes: "23:00" },
    { days: "Saturday", time: "6:00 AM – 10:00 PM", schema: ["Saturday"], opens: "06:00", closes: "22:00" },
    { days: "Sunday", time: "7:00 AM – 1:00 PM", schema: ["Sunday"], opens: "07:00", closes: "13:00" },
  ],
  social: {
    instagram: "https://instagram.com/athlex.fit",
    youtube: "https://youtube.com/@athlexfit",
    facebook: "https://facebook.com/athlexfit",
    x: "https://x.com/athlexfit",
  },
  foundedYear: 2020,
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/trainers", label: "Trainers" },
  { href: "/membership", label: "Membership" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = {
  explore: [
    { href: "/about", label: "About" },
    { href: "/schedule", label: "Class Schedule" },
    { href: "/trainers", label: "Trainers" },
    { href: "/gallery", label: "Gallery" },
    { href: "/transformations", label: "Transformations" },
    { href: "/blog", label: "Journal" },
  ],
  tools: [
    { href: "/membership", label: "Membership" },
    { href: "/free-trial", label: "Free Trial" },
    { href: "/calculators", label: "Fitness Calculators" },
    { href: "/login", label: "Member Login" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/refund-policy", label: "Refunds" },
  ],
};

export const whatsappLink = (message: string = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

export const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`;
export const mapsEmbed = `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=15&output=embed`;
