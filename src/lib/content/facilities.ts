import { media } from "../media";
import type { Facility } from "../types";

export const facilities: Facility[] = [
  { slug: "weights", name: "Weight Training Area", description: "Eliteform racks, calibrated plates and dumbbells up to 60 kg.", image: media.facilities.weights, icon: "Dumbbell" },
  { slug: "cardio", name: "Cardio Zone", description: "Curved treadmills, air bikes, rowers and ski-ergs.", image: media.facilities.cardio, icon: "HeartPulse" },
  { slug: "functional", name: "Functional Training", description: "30 m turf lane, sleds, rigs and kettlebells.", image: media.facilities.functional, icon: "Activity" },
  { slug: "lockers", name: "Locker Rooms", description: "Digital-lock lockers with premium amenities.", image: media.facilities.lockers, icon: "Lock" },
  { slug: "shower", name: "Showers", description: "Rain showers, hot water and toiletries on the house.", image: media.facilities.shower, icon: "ShowerHead" },
  { slug: "pt", name: "Personal Training Area", description: "A private zone for 1:1 coaching and assessments.", image: media.facilities.pt, icon: "UserCheck" },
  { slug: "recovery", name: "Recovery Area", description: "Percussion guns, compression boots and a stretch lounge.", image: media.facilities.recovery, icon: "Sparkles" },
  { slug: "parking", name: "Parking", description: "Secure covered parking for cars and two-wheelers.", image: media.facilities.parking, icon: "SquareParking" },
  { slug: "water", name: "Drinking Water", description: "Filtered chilled water stations across the floor.", image: media.facilities.water, icon: "GlassWater" },
];
