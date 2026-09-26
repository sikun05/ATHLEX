import { media } from "../media";
import type { BlogCategory, BlogPost } from "../types";

export const blogCategories: BlogCategory[] = ["Workout", "Nutrition", "Weight Loss", "Muscle Building", "Fitness Tips", "Lifestyle"];

export const blogPosts: BlogPost[] = [
  {
    slug: "progressive-overload-explained",
    title: "Progressive Overload, Explained Without the Bro Science",
    excerpt: "The single principle behind every strength gain — and five practical ways to apply it this week.",
    category: "Workout",
    image: media.blog.b1,
    date: "2026-09-12",
    readMinutes: 6,
    author: "Arjun Rao",
    body: [
      "Your body adapts to exactly what you ask of it — and nothing more. Progressive overload is simply the practice of asking for a little more over time.",
      "The most obvious lever is load: add 1–2.5 kg to your main lifts when you hit the top of your rep range with clean technique. But load is just one of five levers.",
      "Reps, sets, density (doing the same work in less time) and range of motion are all valid ways to progress. Rotate them and you'll keep moving forward for years instead of weeks.",
      "Track everything. If it isn't written down, you're guessing — and guessing is how plateaus start. Your ATHLEX dashboard logs every session so you always know what 'more' looks like.",
    ],
  },
  {
    slug: "protein-for-indian-diets",
    title: "Hitting Your Protein Target on an Indian Diet",
    excerpt: "Dal alone won't cut it. Here's a realistic, vegetarian-friendly way to eat 1.6 g/kg every day.",
    category: "Nutrition",
    image: media.blog.b2,
    date: "2026-09-02",
    readMinutes: 7,
    author: "Kabir Singh",
    body: [
      "Most active adults do well on 1.6–2.2 g of protein per kg of bodyweight. For a 70 kg person that's 110–150 g a day — far more than a typical plate delivers.",
      "Build every meal around a protein anchor: paneer, tofu, eggs, chicken, fish, Greek yoghurt or soya chunks. Then add dal and grains as supporting players, not the main event.",
      "Whey or plant protein is a convenient tool, not a requirement. One scoop closes the gap for most people.",
    ],
  },
  {
    slug: "fat-loss-without-crash-diets",
    title: "Fat Loss Without Crash Diets",
    excerpt: "A moderate deficit, lots of steps and heavy lifting. Boring? Yes. Effective? Absolutely.",
    category: "Weight Loss",
    image: media.blog.b3,
    date: "2026-08-21",
    readMinutes: 5,
    author: "Meera Kapoor",
    body: [
      "Aggressive deficits work — briefly. Then hunger, fatigue and muscle loss catch up. Aim for 0.5–1% of bodyweight lost per week.",
      "Keep lifting heavy to signal your body to retain muscle, walk 8–10k steps daily and prioritise sleep. Use our calorie calculator to set your starting target.",
    ],
  },
  {
    slug: "hypertrophy-volume-guide",
    title: "How Much Volume Do You Really Need to Grow?",
    excerpt: "Sets per muscle per week, proximity to failure and why more isn't always better.",
    category: "Muscle Building",
    image: media.blog.b4,
    date: "2026-08-08",
    readMinutes: 8,
    author: "Kabir Singh",
    body: [
      "Research suggests 10–20 hard sets per muscle group per week is the sweet spot for most lifters.",
      "'Hard' is the key word: finish most sets 1–3 reps shy of failure. Junk volume adds fatigue, not muscle.",
    ],
  },
  {
    slug: "meal-prep-sunday",
    title: "The 60-Minute Sunday Meal Prep",
    excerpt: "Five containers, three proteins, zero stress. A coach-approved template for busy weeks.",
    category: "Fitness Tips",
    image: media.blog.b5,
    date: "2026-07-27",
    readMinutes: 4,
    author: "Meera Kapoor",
    body: [
      "Cook two proteins, one grain and roast a tray of vegetables. Portion into containers and you're set for the working week.",
    ],
  },
  {
    slug: "sleep-is-a-performance-drug",
    title: "Sleep Is the Most Underrated Performance Drug",
    excerpt: "Why 7–9 hours will do more for your physique than any supplement on the shelf.",
    category: "Lifestyle",
    image: media.blog.b6,
    date: "2026-07-14",
    readMinutes: 5,
    author: "Ananya Iyer",
    body: [
      "Growth hormone release, appetite regulation and training recovery all depend on consistent, quality sleep.",
      "Keep a fixed wake time, dim screens an hour before bed and keep your room cool and dark.",
    ],
  },
];

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
