import { media } from "../media";
import type { Program } from "../types";

export const programs: Program[] = [
  {
    slug: "strength-training",
    name: "Strength Training",
    short: "Barbell-first coaching to build raw, usable strength.",
    description:
      "Progressive overload programming built around the squat, bench, deadlift and overhead press. Periodised blocks, technique audits every 4 weeks and PR tracking in your dashboard.",
    image: media.programs.strength,
    level: "All levels",
    duration: "60 min",
    intensity: 4,
    outcomes: ["Increase 1RM on major lifts", "Bulletproof joints & posture", "Coach-reviewed technique"],
  },
  {
    slug: "muscle-building",
    name: "Muscle Building",
    short: "Hypertrophy splits engineered for visible size.",
    description:
      "Evidence-based volume, tempo and proximity-to-failure prescriptions paired with a nutrition strategy that actually supports growth.",
    image: media.programs.muscle,
    level: "Intermediate",
    duration: "70 min",
    intensity: 4,
    outcomes: ["Lean mass gain", "Structured weekly splits", "Macro-matched diet plan"],
  },
  {
    slug: "weight-loss",
    name: "Weight Loss",
    short: "Sustainable fat loss without the crash.",
    description:
      "A calorie-aware plan combining strength, conditioning and step targets — with weekly check-ins so progress never stalls.",
    image: media.programs.weightLoss,
    level: "All levels",
    duration: "50 min",
    intensity: 3,
    outcomes: ["Consistent fat loss", "Habit coaching", "Body composition tracking"],
  },
  {
    slug: "functional-training",
    name: "Functional Training",
    short: "Move better in the gym and in life.",
    description:
      "Kettlebells, sleds, carries and multi-planar movement to build strength that transfers to sport and everyday life.",
    image: media.programs.functional,
    level: "All levels",
    duration: "45 min",
    intensity: 3,
    outcomes: ["Real-world strength", "Core stability", "Coordination & balance"],
  },
  {
    slug: "hiit",
    name: "HIIT",
    short: "Short. Brutal. Effective.",
    description:
      "Heart-rate zoned intervals on bikes, rowers and the turf. Maximum conditioning in minimum time, scaled for every level.",
    image: media.programs.hiit,
    level: "Intermediate",
    duration: "40 min",
    intensity: 5,
    outcomes: ["VO₂ max improvement", "High calorie burn", "Mental toughness"],
  },
  {
    slug: "personal-training",
    name: "Personal Training",
    short: "1:1 coaching. Zero guesswork.",
    description:
      "A dedicated coach, a fully personalised program, movement screening and weekly accountability. The fastest route to your goal.",
    image: media.programs.personal,
    level: "All levels",
    duration: "60 min",
    intensity: 4,
    outcomes: ["Fully bespoke programming", "Weekly accountability", "Priority booking"],
  },
  {
    slug: "cross-training",
    name: "Cross Training",
    short: "Lift, sprint, climb, repeat.",
    description:
      "Mixed-modal workouts combining Olympic lifting, gymnastics and engine work in a high-energy small-group format.",
    image: media.programs.cross,
    level: "Advanced",
    duration: "60 min",
    intensity: 5,
    outcomes: ["Work capacity", "Olympic lifting skill", "Community & competition"],
  },
  {
    slug: "mobility",
    name: "Mobility",
    short: "Unlock range. Move pain-free.",
    description:
      "Joint-by-joint mobility, breath work and controlled articular rotations to improve range of motion and speed up recovery.",
    image: media.programs.mobility,
    level: "Beginner",
    duration: "45 min",
    intensity: 1,
    outcomes: ["Improved flexibility", "Faster recovery", "Injury prevention"],
  },
  {
    slug: "sports-conditioning",
    name: "Sports Conditioning",
    short: "Athlete-grade speed and power.",
    description:
      "Plyometrics, acceleration mechanics and energy-system work designed for field and court athletes — in season and off.",
    image: media.programs.sports,
    level: "Advanced",
    duration: "60 min",
    intensity: 5,
    outcomes: ["Explosive power", "Agility & speed", "Sport-specific conditioning"],
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
