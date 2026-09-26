export type Role = "admin" | "staff" | "trainer" | "member";

export type Program = {
  slug: string;
  name: string;
  short: string;
  description: string;
  image: string;
  level: "All levels" | "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  outcomes: string[];
};

export type Trainer = {
  id: string;
  slug: string;
  name: string;
  position: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  image: string;
  certifications: string[];
  social: { instagram?: string; youtube?: string; x?: string };
};

export type Plan = {
  id: string;
  slug: "basic" | "standard" | "premium" | "elite" | string;
  name: string;
  durationMonths: number;
  durationDays: number;
  /** Price in paise (INR minor unit) — the ONLY source of truth for charging. */
  price: number;
  compareAt?: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

export type ClassType = {
  id: string;
  slug: string;
  name: string;
  category: "Yoga" | "HIIT" | "Zumba" | "Strength" | "Functional" | "Cardio" | "Boxing" | "Mobility";
  durationMin: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
};

export type ClassSchedule = {
  id: string;
  classId: string;
  trainerId: string;
  /** 0 = Monday … 6 = Sunday */
  day: number;
  start: string; // "06:30"
  end: string;
  room: string;
  capacity: number;
  booked: number;
};

export type GalleryCategory = "gym" | "equipment" | "trainers" | "workouts" | "events" | "members" | "transformations";

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  kind: "image" | "video";
  src: string;
  videoUrl?: string;
  width: number;
  height: number;
};

export type Transformation = {
  id: string;
  name: string;
  duration: string;
  program: string;
  result: string;
  quote: string;
  before: string;
  after: string;
};

export type Testimonial = {
  id: string;
  name: string;
  image: string;
  rating: number;
  review: string;
  transformation: string;
  memberSince: string;
};

export type Facility = { slug: string; name: string; description: string; image: string; icon: string };

export type BlogCategory = "Workout" | "Nutrition" | "Weight Loss" | "Muscle Building" | "Fitness Tips" | "Lifestyle";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  image: string;
  date: string;
  readMinutes: number;
  author: string;
  body: string[];
};
