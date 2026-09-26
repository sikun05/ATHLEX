import type { ClassSchedule, ClassType } from "../types";

export const classTypes: ClassType[] = [
  { id: "c1000000-0000-4000-8000-000000000001", slug: "sunrise-yoga", name: "Sunrise Yoga", category: "Yoga", durationMin: 60, intensity: 1, description: "Vinyasa flow to wake the body and focus the mind." },
  { id: "c1000000-0000-4000-8000-000000000002", slug: "hiit-inferno", name: "HIIT Inferno", category: "HIIT", durationMin: 40, intensity: 5, description: "Zoned intervals on bikes, rowers and turf." },
  { id: "c1000000-0000-4000-8000-000000000003", slug: "zumba-rush", name: "Zumba Rush", category: "Zumba", durationMin: 50, intensity: 3, description: "High-energy dance cardio. No experience needed." },
  { id: "c1000000-0000-4000-8000-000000000004", slug: "barbell-club", name: "Barbell Club", category: "Strength", durationMin: 60, intensity: 4, description: "Coached compound lifts with progressive loading." },
  { id: "c1000000-0000-4000-8000-000000000005", slug: "functional-flow", name: "Functional Flow", category: "Functional", durationMin: 45, intensity: 3, description: "Kettlebells, sleds and carries for real-world strength." },
  { id: "c1000000-0000-4000-8000-000000000006", slug: "cardio-burn", name: "Cardio Burn", category: "Cardio", durationMin: 45, intensity: 3, description: "Steady-state and tempo intervals for your engine." },
  { id: "c1000000-0000-4000-8000-000000000007", slug: "fight-camp", name: "Fight Camp", category: "Boxing", durationMin: 50, intensity: 4, description: "Pad work, footwork and fight conditioning." },
  { id: "c1000000-0000-4000-8000-000000000008", slug: "mobility-lab", name: "Mobility Lab", category: "Mobility", durationMin: 45, intensity: 1, description: "Joint prep, CARs and deep stretching for recovery." },
];

const T = {
  arjun: "7a1c0f0e-0001-4c1a-9a01-000000000001",
  meera: "7a1c0f0e-0002-4c1a-9a01-000000000002",
  kabir: "7a1c0f0e-0003-4c1a-9a01-000000000003",
  zara: "7a1c0f0e-0004-4c1a-9a01-000000000004",
  vikram: "7a1c0f0e-0005-4c1a-9a01-000000000005",
  ananya: "7a1c0f0e-0006-4c1a-9a01-000000000006",
};
const C = Object.fromEntries(classTypes.map((c) => [c.slug, c.id])) as Record<string, string>;

type Row = [day: number, start: string, end: string, cls: string, trainer: string, room: string, capacity: number, booked: number];

const rows: Row[] = [
  [0, "06:00", "07:00", "sunrise-yoga", T.ananya, "Studio 1", 20, 14],
  [0, "07:15", "07:55", "hiit-inferno", T.meera, "Turf", 18, 18],
  [0, "18:00", "19:00", "barbell-club", T.arjun, "Platform Zone", 12, 7],
  [0, "19:30", "20:20", "fight-camp", T.zara, "Combat Room", 16, 9],
  [1, "06:30", "07:15", "functional-flow", T.vikram, "Turf", 16, 6],
  [1, "07:30", "08:20", "zumba-rush", T.meera, "Studio 1", 25, 19],
  [1, "18:30", "19:15", "cardio-burn", T.meera, "Cardio Deck", 20, 11],
  [1, "20:00", "20:45", "mobility-lab", T.ananya, "Studio 2", 15, 4],
  [2, "06:00", "07:00", "barbell-club", T.arjun, "Platform Zone", 12, 10],
  [2, "07:15", "07:55", "hiit-inferno", T.meera, "Turf", 18, 12],
  [2, "18:00", "18:50", "fight-camp", T.zara, "Combat Room", 16, 15],
  [2, "19:15", "20:15", "sunrise-yoga", T.ananya, "Studio 1", 20, 8],
  [3, "06:30", "07:15", "functional-flow", T.vikram, "Turf", 16, 9],
  [3, "07:30", "08:15", "cardio-burn", T.kabir, "Cardio Deck", 20, 5],
  [3, "18:30", "19:30", "barbell-club", T.kabir, "Platform Zone", 12, 12],
  [3, "19:45", "20:35", "zumba-rush", T.meera, "Studio 1", 25, 21],
  [4, "06:00", "06:40", "hiit-inferno", T.meera, "Turf", 18, 16],
  [4, "07:00", "08:00", "sunrise-yoga", T.ananya, "Studio 1", 20, 11],
  [4, "18:00", "18:50", "fight-camp", T.zara, "Combat Room", 16, 7],
  [4, "19:00", "19:45", "mobility-lab", T.ananya, "Studio 2", 15, 6],
  [5, "08:00", "09:00", "barbell-club", T.arjun, "Platform Zone", 12, 9],
  [5, "09:15", "10:05", "zumba-rush", T.meera, "Studio 1", 25, 17],
  [5, "10:30", "11:15", "functional-flow", T.vikram, "Turf", 16, 13],
  [5, "17:00", "17:45", "cardio-burn", T.kabir, "Cardio Deck", 20, 8],
  [6, "08:00", "09:00", "sunrise-yoga", T.ananya, "Studio 1", 20, 12],
  [6, "09:30", "10:15", "mobility-lab", T.ananya, "Studio 2", 15, 10],
];

export const classSchedules: ClassSchedule[] = rows.map(([day, start, end, cls, trainerId, room, capacity, booked], i) => ({
  id: `5c000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  classId: C[cls],
  trainerId,
  day,
  start,
  end,
  room,
  capacity,
  booked,
}));

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const timeSlot = (start: string) => {
  const h = Number(start.slice(0, 2));
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
};
