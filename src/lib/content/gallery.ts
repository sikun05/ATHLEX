import { media } from "../media";
import type { GalleryCategory, GalleryItem } from "../types";

export const galleryCategories: { value: "all" | GalleryCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gym", label: "Gym" },
  { value: "equipment", label: "Equipment" },
  { value: "trainers", label: "Trainers" },
  { value: "workouts", label: "Workouts" },
  { value: "events", label: "Events" },
  { value: "members", label: "Members" },
  { value: "transformations", label: "Transformations" },
];

const g = media.gallery;
const items: [string, GalleryCategory, number, number, string, ("image" | "video")?, string?][] = [
  ["Main training floor", "gym", 1600, 1067, g[0]],
  ["Strength platforms", "equipment", 1200, 1600, g[1]],
  ["Night session", "gym", 1600, 1067, g[2]],
  ["Plate wall", "equipment", 1600, 1200, g[3]],
  ["Deadlift day", "workouts", 1200, 1600, g[4]],
  ["Arm day with Kabir", "trainers", 1600, 1067, g[5]],
  ["Coached dumbbell work", "members", 1200, 1500, g[6]],
  ["Fight Camp", "events", 1600, 1067, g[7], "video", "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"],
  ["Kettlebell complex", "workouts", 1600, 1200, g[8]],
  ["Community Saturday", "events", 1600, 1067, g[9]],
  ["Barbell club", "members", 1200, 1600, g[10]],
  ["Turf & sleds", "gym", 1600, 1067, g[11]],
  ["Rope conditioning", "workouts", 1600, 1200, g[12]],
  ["16-week transformation", "transformations", 1200, 1600, g[13]],
  ["Cardio deck", "equipment", 1600, 1067, g[14], "video", "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"],
  ["Recomp: 12 weeks", "transformations", 1600, 1200, g[15]],
];

export const galleryItems: GalleryItem[] = items.map(([title, category, width, height, src, kind = "image", videoUrl], i) => ({
  id: `6a000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  title,
  category,
  width,
  height,
  src,
  kind,
  videoUrl,
}));
