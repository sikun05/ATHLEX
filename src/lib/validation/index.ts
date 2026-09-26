import { z } from "zod";

/** Shared schemas — used by react-hook-form on the client AND re-validated in API routes. */

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{10,14}$/, "Enter a valid phone number"));

const name = z.string().trim().min(2, "Please enter your name").max(80);
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(160));

export const password = z
  .string()
  .min(8, "At least 8 characters")
  .max(72)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

const futureDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")
  .refine((v) => {
    const d = new Date(`${v}T23:59:59`);
    const max = new Date();
    max.setDate(max.getDate() + 60);
    return d >= new Date() && d <= max;
  }, "Choose a date within the next 60 days");

export const trialInterests = [
  "Strength Training",
  "Muscle Building",
  "Weight Loss",
  "Functional Training",
  "HIIT",
  "Personal Training",
  "Yoga",
  "Boxing",
  "Not sure yet",
] as const;

export const trialTimes = ["06:00", "07:00", "08:00", "10:00", "12:00", "16:00", "18:00", "19:00", "20:00"] as const;

export const trialBookingSchema = z.object({
  name,
  phone,
  email,
  preferredDate: futureDate,
  preferredTime: z.enum(trialTimes, "Choose a time"),
  interest: z.enum(trialInterests, "Choose what you'd like to train"),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  // Honeypot — real users never fill this
  company: z.string().max(0).optional().or(z.literal("")),
});
export type TrialBookingInput = z.input<typeof trialBookingSchema>;

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Add a subject").max(120),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000),
  company: z.string().max(0).optional().or(z.literal("")),
});
export type ContactInput = z.input<typeof contactSchema>;

export const newsletterSchema = z.object({ email });

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password"), next: z.string().optional() });
export type LoginInput = z.input<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: name,
    email,
    phone,
    password,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, "Please accept the terms to continue"),
    next: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });
export type SignupInput = z.input<typeof signupSchema>;

export const forgotSchema = z.object({ email });
export const resetSchema = z
  .object({ password, confirmPassword: z.string(), token: z.string().optional() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

export const profileSchema = z.object({
  fullName: name,
  phone,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  heightCm: z.coerce.number().min(100, "Height in cm").max(250).optional().or(z.literal("")),
  fitnessGoal: z.string().trim().max(120).optional().or(z.literal("")),
  emergencyContactName: z.string().trim().max(80).optional().or(z.literal("")),
  emergencyContactPhone: phone.optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().or(z.literal("")),
});
export type ProfileInput = z.input<typeof profileSchema>;

/** Registration step of checkout (member profile essentials) */
export const checkoutProfileSchema = z.object({
  fullName: name,
  phone,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth"),
  gender: z.enum(["male", "female", "other"], "Select an option"),
  fitnessGoal: z.string().trim().min(2, "Tell us your main goal").max(120),
  emergencyContactName: z.string().trim().min(2, "Required").max(80),
  emergencyContactPhone: phone,
  acceptWaiver: z.literal(true, "Please accept the membership terms & health waiver"),
});
export type CheckoutProfileInput = z.input<typeof checkoutProfileSchema>;

export const createOrderSchema = z.object({
  planSlug: z.string().min(2).max(40),
  couponCode: z.string().trim().toUpperCase().max(30).optional().or(z.literal("")),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(6).max(64),
  razorpay_payment_id: z.string().min(6).max(64),
  razorpay_signature: z.string().min(16).max(256),
});

export const paymentStatusSchema = z.object({
  orderId: z.string().min(6).max(64),
  status: z.enum(["cancelled", "failed"]),
  reason: z.string().max(300).optional(),
});

export const classBookingSchema = z.object({
  scheduleId: z.uuid(),
  classDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const measurementSchema = z.object({
  measuredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  weightKg: z.coerce.number().min(25, "Enter weight in kg").max(350),
  bodyFatPct: z.coerce.number().min(2).max(70).optional().or(z.literal("")),
  chestCm: z.coerce.number().min(40).max(200).optional().or(z.literal("")),
  waistCm: z.coerce.number().min(40).max(200).optional().or(z.literal("")),
  hipsCm: z.coerce.number().min(40).max(200).optional().or(z.literal("")),
  armsCm: z.coerce.number().min(15).max(80).optional().or(z.literal("")),
  thighsCm: z.coerce.number().min(25).max(120).optional().or(z.literal("")),
  notes: z.string().max(300).optional().or(z.literal("")),
});
export type MeasurementInput = z.input<typeof measurementSchema>;

export const attendanceScanSchema = z.object({
  token: z.string().min(10).max(2048).optional(),
  memberCode: z.string().trim().toUpperCase().regex(/^ATX-\d{3,8}$/, "Member code looks like ATX-1001").optional(),
});
