import type { Plan } from "../types";

/** Prices are in paise. The server charges ONLY from this table (or the membership_plans DB table). */
export const plans: Plan[] = [
  {
    id: "9b2d0000-0000-4000-8000-000000000001",
    slug: "basic",
    name: "Basic",
    durationMonths: 1,
    durationDays: 30,
    price: 249900,
    tagline: "Get started, no strings.",
    features: ["Full gym floor access", "Locker & shower", "Fitness assessment", "Member app & QR check-in"],
  },
  {
    id: "9b2d0000-0000-4000-8000-000000000002",
    slug: "standard",
    name: "Standard",
    durationMonths: 3,
    durationDays: 90,
    price: 649900,
    compareAt: 749700,
    tagline: "Build the habit.",
    features: ["Everything in Basic", "Unlimited group classes", "Monthly body composition scan", "Starter workout plan"],
  },
  {
    id: "9b2d0000-0000-4000-8000-000000000003",
    slug: "premium",
    name: "Premium",
    durationMonths: 6,
    durationDays: 180,
    price: 1199900,
    compareAt: 1499400,
    tagline: "Our most chosen plan.",
    highlighted: true,
    features: [
      "Everything in Standard",
      "4 personal training sessions",
      "Custom workout & diet plan",
      "Recovery zone access",
      "Progress tracking dashboard",
    ],
  },
  {
    id: "9b2d0000-0000-4000-8000-000000000004",
    slug: "elite",
    name: "Elite",
    durationMonths: 12,
    durationDays: 365,
    price: 1999900,
    compareAt: 2998800,
    tagline: "All in. All year.",
    features: [
      "Everything in Premium",
      "12 personal training sessions",
      "Quarterly coach review",
      "Guest passes (4)",
      "Priority class booking",
      "ATHLEX kit on joining",
    ],
  },
];

export const getPlan = (slug: string) => plans.find((p) => p.slug === slug);
