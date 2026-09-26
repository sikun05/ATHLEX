export type Gender = "male" | "female";

/** Mifflin–St Jeor basal metabolic rate */
export const bmr = (g: Gender, kg: number, cm: number, age: number) => Math.round(10 * kg + 6.25 * cm - 5 * age + (g === "male" ? 5 : -161));
export const bmi = (kg: number, cm: number) => kg / Math.pow(cm / 100, 2);
export const bmiCategory = (v: number) =>
  v < 18.5 ? { label: "Underweight", tone: "text-warn" } : v < 25 ? { label: "Healthy", tone: "text-ok" } : v < 30 ? { label: "Overweight", tone: "text-warn" } : { label: "Obese", tone: "text-danger" };
