import { media } from "../media";
import type { Testimonial, Transformation } from "../types";

export const transformations: Transformation[] = [
  {
    id: "tr-1",
    name: "Rohan Mehta",
    duration: "16 weeks",
    program: "Weight Loss",
    result: "−18 kg · −11% body fat",
    quote: "I stopped chasing quick fixes. The structure and the coaches did the rest.",
    before: media.gallery[13],
    after: media.gallery[5],
  },
  {
    id: "tr-2",
    name: "Priya Nair",
    duration: "24 weeks",
    program: "Strength Training",
    result: "Deadlift 40 → 110 kg",
    quote: "I walked in scared of the barbell. Now it's my favourite part of the week.",
    before: media.gallery[6],
    after: media.gallery[13],
  },
  {
    id: "tr-3",
    name: "Aditya Sharma",
    duration: "20 weeks",
    program: "Muscle Building",
    result: "+7 kg lean mass",
    quote: "The diet plan and progressive programming finally made it click.",
    before: media.gallery[10],
    after: media.gallery[4],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sneha Reddy",
    image: media.people.p2,
    rating: 5,
    review:
      "The coaching here is on a different level. Every session has a purpose, every coach knows my numbers. I've never been this consistent.",
    transformation: "−9 kg in 14 weeks",
    memberSince: "2023",
  },
  {
    id: "t2",
    name: "Karan Malhotra",
    image: media.people.p1,
    rating: 5,
    review:
      "Premium facility, zero ego. The QR check-in, the app, the recovery zone — it feels like a members' club built for people who actually train.",
    transformation: "Squat 100 → 170 kg",
    memberSince: "2022",
  },
  {
    id: "t3",
    name: "Aisha Khan",
    image: media.people.p4,
    rating: 5,
    review:
      "Fight Camp with Zara changed how I train. I'm fitter at 38 than I was at 25 and I actually look forward to 6 AM.",
    transformation: "Resting HR 78 → 58",
    memberSince: "2024",
  },
  {
    id: "t4",
    name: "Nikhil Verma",
    image: media.people.p3,
    rating: 4,
    review:
      "Signed up for the Premium plan and the custom diet + workout plan paid for itself in two months. Clean, organised and motivating.",
    transformation: "+6 kg lean mass",
    memberSince: "2023",
  },
  {
    id: "t5",
    name: "Divya Menon",
    image: media.people.p5,
    rating: 5,
    review:
      "Ananya's mobility sessions fixed a back issue I had for years. The whole team genuinely cares about how you move.",
    transformation: "Pain-free in 8 weeks",
    memberSince: "2021",
  },
];
