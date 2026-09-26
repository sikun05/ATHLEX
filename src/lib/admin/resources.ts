import type { Role } from "@/lib/types";
import type { NavIcon } from "@/components/dashboard/nav-icons";

/**
 * Declarative admin modules. Each resource maps to one table and declares
 * who can read/write it, which columns to list and which fields are editable.
 * The API only ever writes the fields declared here (allow-list).
 */

export type FieldType = "text" | "textarea" | "number" | "money" | "date" | "datetime" | "time" | "select" | "boolean" | "tags" | "relation" | "url" | "email" | "json";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  relation?: { table: string; label: string; filter?: Record<string, string> };
  hint?: string;
  min?: number;
  max?: number;
  /** full-width in the form grid */
  wide?: boolean;
  default?: unknown;
};

export type ColumnDef = {
  key: string;
  label: string;
  type?: "text" | "money" | "date" | "datetime" | "status" | "relation" | "image" | "boolean" | "mono" | "time" | "tags";
  relation?: { table: string; label: string };
};

export type Resource = {
  slug: string;
  title: string;
  singular: string;
  table: string;
  /** optional view used for listing (e.g. joins) */
  listFrom?: string;
  icon: NavIcon;
  group: "People" | "Business" | "Training" | "Content" | "Inbox";
  read: Role[];
  write: Role[];
  create?: boolean;
  remove?: boolean;
  columns: ColumnDef[];
  fields: FieldDef[];
  search: string[];
  order: { col: string; asc?: boolean };
  statusFilter?: { col: string; options: readonly string[] };
  description?: string;
};

const STAFF: Role[] = ["admin", "staff"];
const COACH: Role[] = ["admin", "staff", "trainer"];
const ADMIN: Role[] = ["admin"];

const REC = ["active", "inactive", "archived"] as const;
const PUB = ["draft", "published", "archived"] as const;

const memberRel = { table: "member_directory", label: "full_name" };
const trainerRel = { table: "trainers", label: "name" };
const planRel = { table: "membership_plans", label: "name" };

export const resources: Resource[] = [
  // ─── People ───────────────────────────────────────────────────────
  {
    slug: "members",
    title: "Members",
    singular: "member",
    table: "members",
    listFrom: "member_directory",
    icon: "Users",
    group: "People",
    read: COACH,
    write: STAFF,
    create: false,
    description: "Members are created when someone signs up. Edit their profile, coach and status here.",
    columns: [
      { key: "member_code", label: "ID", type: "mono" },
      { key: "full_name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "plan_name", label: "Plan" },
      { key: "membership_status", label: "Membership", type: "status" },
      { key: "membership_end", label: "Expires", type: "date" },
      { key: "assigned_trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { key: "status", label: "Account", type: "status" },
    ],
    fields: [
      { name: "gender", label: "Gender", type: "select", options: ["male", "female", "other"] },
      { name: "date_of_birth", label: "Date of birth", type: "date" },
      { name: "height_cm", label: "Height (cm)", type: "number", min: 50, max: 260 },
      { name: "fitness_goal", label: "Fitness goal", type: "text" },
      { name: "assigned_trainer_id", label: "Assigned coach", type: "relation", relation: trainerRel },
      { name: "emergency_contact_name", label: "Emergency contact", type: "text" },
      { name: "emergency_contact_phone", label: "Emergency phone", type: "text" },
      { name: "address", label: "Address", type: "text", wide: true },
      { name: "status", label: "Account status", type: "select", options: REC, required: true },
      { name: "notes", label: "Internal notes", type: "textarea", wide: true },
    ],
    search: ["full_name", "email", "phone", "member_code"],
    order: { col: "created_at", asc: false },
    statusFilter: { col: "membership_status", options: ["active", "expired", "pending", "cancelled"] },
  },
  {
    slug: "staff",
    title: "Staff & roles",
    singular: "user",
    table: "users",
    icon: "UserCog",
    group: "People",
    read: ADMIN,
    write: ADMIN,
    create: false,
    description: "Promote accounts to trainer, staff or admin. Users must sign up first.",
    columns: [
      { key: "full_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role", type: "status" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Joined", type: "date" },
    ],
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "role", label: "Role", type: "select", options: ["member", "trainer", "staff", "admin"], required: true },
      { name: "status", label: "Status", type: "select", options: REC, required: true },
    ],
    search: ["full_name", "email"],
    order: { col: "created_at", asc: false },
    statusFilter: { col: "role", options: ["member", "trainer", "staff", "admin"] },
  },
  {
    slug: "trainers",
    title: "Trainers",
    singular: "trainer",
    table: "trainers",
    icon: "Dumbbell",
    group: "People",
    read: COACH,
    write: STAFF,
    columns: [
      { key: "image_url", label: "", type: "image" },
      { key: "name", label: "Name" },
      { key: "position", label: "Position" },
      { key: "specialization", label: "Specialization" },
      { key: "experience_years", label: "Exp. (yrs)" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", required: true, hint: "lowercase-with-dashes" },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "specialization", label: "Specialization", type: "text", required: true },
      { name: "experience_years", label: "Experience (years)", type: "number", min: 0, max: 60 },
      { name: "image_url", label: "Portrait URL", type: "url" },
      { name: "certifications", label: "Certifications", type: "tags", hint: "Comma separated" },
      { name: "bio", label: "Bio", type: "textarea", wide: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["name", "specialization"],
    order: { col: "sort_order" },
  },

  // ─── Business ─────────────────────────────────────────────────────
  {
    slug: "plans",
    title: "Membership plans",
    singular: "plan",
    table: "membership_plans",
    icon: "WalletCards",
    group: "Business",
    read: STAFF,
    write: ADMIN,
    columns: [
      { key: "name", label: "Plan" },
      { key: "duration_months", label: "Months" },
      { key: "price_paise", label: "Price", type: "money" },
      { key: "compare_at_paise", label: "Compare at", type: "money" },
      { key: "is_highlighted", label: "Featured", type: "boolean" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "duration_months", label: "Duration (months)", type: "number", required: true, min: 1, max: 36 },
      { name: "duration_days", label: "Duration (days)", type: "number", required: true, min: 1, max: 1100 },
      { name: "price_paise", label: "Price (₹)", type: "money", required: true },
      { name: "compare_at_paise", label: "Compare-at price (₹)", type: "money" },
      { name: "tagline", label: "Tagline", type: "text", wide: true },
      { name: "features", label: "Features", type: "tags", wide: true, hint: "Comma separated" },
      { name: "is_highlighted", label: "Highlight as most popular", type: "boolean" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["name"],
    order: { col: "sort_order" },
  },
  {
    slug: "memberships",
    title: "Memberships",
    singular: "membership",
    table: "memberships",
    icon: "BadgePercent",
    group: "Business",
    read: STAFF,
    write: STAFF,
    description: "Manual entries are for cash/offline sales. Online payments create memberships automatically.",
    columns: [
      { key: "member_id", label: "Member", type: "relation", relation: memberRel },
      { key: "plan_id", label: "Plan", type: "relation", relation: planRel },
      { key: "start_date", label: "Start", type: "date" },
      { key: "end_date", label: "End", type: "date" },
      { key: "amount_paise", label: "Amount", type: "money" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "member_id", label: "Member", type: "relation", relation: memberRel, required: true },
      { name: "plan_id", label: "Plan", type: "relation", relation: planRel, required: true },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date", required: true },
      { name: "amount_paise", label: "Amount (₹)", type: "money", required: true },
      { name: "status", label: "Status", type: "select", options: ["pending", "active", "expired", "cancelled", "frozen"], required: true, default: "active" },
    ],
    search: [],
    order: { col: "end_date", asc: false },
    statusFilter: { col: "status", options: ["active", "expired", "pending", "cancelled", "frozen"] },
  },
  {
    slug: "payments",
    title: "Payments",
    singular: "payment",
    table: "payments",
    icon: "CreditCard",
    group: "Business",
    read: STAFF,
    write: ADMIN,
    create: false,
    remove: false,
    description: "Read-only ledger of gateway transactions. Refunds are issued from the Razorpay dashboard.",
    columns: [
      { key: "created_at", label: "Date", type: "datetime" },
      { key: "member_id", label: "Member", type: "relation", relation: memberRel },
      { key: "plan_id", label: "Plan", type: "relation", relation: planRel },
      { key: "amount_paise", label: "Amount", type: "money" },
      { key: "method", label: "Method" },
      { key: "receipt_number", label: "Receipt", type: "mono" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "status", label: "Status", type: "select", options: ["created", "paid", "failed", "cancelled", "refunded"], required: true, hint: "Mark refunded after refunding in Razorpay" },
      { name: "failure_reason", label: "Notes / failure reason", type: "textarea", wide: true },
    ],
    search: ["razorpay_order_id", "razorpay_payment_id", "receipt_number"],
    order: { col: "created_at", asc: false },
    statusFilter: { col: "status", options: ["paid", "created", "failed", "cancelled", "refunded"] },
  },
  {
    slug: "offers",
    title: "Offers",
    singular: "offer",
    table: "offers",
    icon: "Megaphone",
    group: "Business",
    read: STAFF,
    write: STAFF,
    columns: [
      { key: "title", label: "Title" },
      { key: "discount_label", label: "Label" },
      { key: "starts_at", label: "Starts", type: "date" },
      { key: "ends_at", label: "Ends", type: "date" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "discount_label", label: "Badge label", type: "text", hint: "e.g. 10% OFF" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "image_url", label: "Image URL", type: "url" },
      { name: "starts_at", label: "Starts", type: "datetime" },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "status", label: "Status", type: "select", options: PUB, required: true, default: "draft" },
    ],
    search: ["title"],
    order: { col: "created_at", asc: false },
  },
  {
    slug: "coupons",
    title: "Coupons",
    singular: "coupon",
    table: "coupons",
    icon: "Ticket",
    group: "Business",
    read: STAFF,
    write: ADMIN,
    columns: [
      { key: "code", label: "Code", type: "mono" },
      { key: "discount_type", label: "Type" },
      { key: "discount_value", label: "Value" },
      { key: "redeemed_count", label: "Used" },
      { key: "max_redemptions", label: "Limit" },
      { key: "valid_until", label: "Valid until", type: "date" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "code", label: "Code", type: "text", required: true, hint: "Uppercase, no spaces" },
      { name: "description", label: "Description", type: "text" },
      { name: "discount_type", label: "Discount type", type: "select", options: ["percent", "flat"], required: true },
      { name: "discount_value", label: "Value", type: "number", required: true, min: 1, hint: "Percent (1–90) or paise for flat" },
      { name: "max_redemptions", label: "Max redemptions", type: "number", min: 1 },
      { name: "valid_from", label: "Valid from", type: "datetime" },
      { name: "valid_until", label: "Valid until", type: "datetime" },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["code"],
    order: { col: "created_at", asc: false },
  },

  // ─── Training ─────────────────────────────────────────────────────
  {
    slug: "classes",
    title: "Class types",
    singular: "class",
    table: "classes",
    icon: "Activity",
    group: "Training",
    read: COACH,
    write: STAFF,
    columns: [
      { key: "name", label: "Class" },
      { key: "category", label: "Category" },
      { key: "duration_min", label: "Minutes" },
      { key: "intensity", label: "Intensity" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Yoga", "HIIT", "Zumba", "Strength", "Functional", "Cardio", "Boxing", "Mobility"], required: true },
      { name: "duration_min", label: "Duration (min)", type: "number", required: true, min: 10, max: 180 },
      { name: "intensity", label: "Intensity (1–5)", type: "number", required: true, min: 1, max: 5 },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["name", "category"],
    order: { col: "name" },
  },
  {
    slug: "schedule",
    title: "Class schedule",
    singular: "time slot",
    table: "class_schedules",
    icon: "CalendarDays",
    group: "Training",
    read: COACH,
    write: STAFF,
    columns: [
      { key: "day_of_week", label: "Day" },
      { key: "start_time", label: "Start", type: "time" },
      { key: "class_id", label: "Class", type: "relation", relation: { table: "classes", label: "name" } },
      { key: "trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { key: "room", label: "Room" },
      { key: "capacity", label: "Capacity" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "class_id", label: "Class", type: "relation", relation: { table: "classes", label: "name" }, required: true },
      { name: "trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { name: "day_of_week", label: "Day (0 = Mon … 6 = Sun)", type: "number", required: true, min: 0, max: 6 },
      { name: "start_time", label: "Start time", type: "time", required: true },
      { name: "end_time", label: "End time", type: "time", required: true },
      { name: "room", label: "Room", type: "text" },
      { name: "capacity", label: "Capacity", type: "number", required: true, min: 1, max: 200 },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["room"],
    order: { col: "day_of_week" },
  },
  {
    slug: "bookings",
    title: "Class bookings",
    singular: "booking",
    table: "class_bookings",
    icon: "CalendarCheck",
    group: "Training",
    read: COACH,
    write: STAFF,
    create: false,
    columns: [
      { key: "class_date", label: "Date", type: "date" },
      { key: "schedule_id", label: "Slot", type: "relation", relation: { table: "class_schedules", label: "start_time" } },
      { key: "member_id", label: "Member", type: "relation", relation: memberRel },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [{ name: "status", label: "Status", type: "select", options: ["booked", "attended", "cancelled", "no_show"], required: true }],
    search: [],
    order: { col: "class_date", asc: false },
    statusFilter: { col: "status", options: ["booked", "attended", "cancelled", "no_show"] },
  },
  {
    slug: "personal-training",
    title: "PT sessions",
    singular: "session",
    table: "personal_training",
    icon: "UserRound",
    group: "Training",
    read: COACH,
    write: COACH,
    columns: [
      { key: "session_at", label: "When", type: "datetime" },
      { key: "member_id", label: "Member", type: "relation", relation: memberRel },
      { key: "trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { key: "duration_min", label: "Min" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "member_id", label: "Member", type: "relation", relation: memberRel, required: true },
      { name: "trainer_id", label: "Coach", type: "relation", relation: trainerRel, required: true },
      { name: "session_at", label: "Date & time", type: "datetime", required: true },
      { name: "duration_min", label: "Duration (min)", type: "number", required: true, min: 15, max: 180, default: 60 },
      { name: "status", label: "Status", type: "select", options: ["scheduled", "completed", "cancelled", "no_show"], required: true, default: "scheduled" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
    search: ["notes"],
    order: { col: "session_at", asc: false },
  },
  {
    slug: "workout-plans",
    title: "Workout plans",
    singular: "workout plan",
    table: "workout_plans",
    icon: "ClipboardList",
    group: "Training",
    read: COACH,
    write: COACH,
    columns: [
      { key: "title", label: "Title" },
      { key: "member_id", label: "Member", type: "relation", relation: memberRel },
      { key: "trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { key: "start_date", label: "Start", type: "date" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "member_id", label: "Member", type: "relation", relation: memberRel, required: true },
      { name: "trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "goal", label: "Goal", type: "text" },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date" },
      { name: "notes", label: "Coach notes", type: "textarea", wide: true },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["title"],
    order: { col: "created_at", asc: false },
  },
  {
    slug: "workout-exercises",
    title: "Exercises",
    singular: "exercise",
    table: "workout_exercises",
    icon: "Dumbbell",
    group: "Training",
    read: COACH,
    write: COACH,
    columns: [
      { key: "workout_plan_id", label: "Plan", type: "relation", relation: { table: "workout_plans", label: "title" } },
      { key: "day_label", label: "Day" },
      { key: "exercise", label: "Exercise" },
      { key: "sets", label: "Sets" },
      { key: "reps", label: "Reps" },
      { key: "rest_seconds", label: "Rest (s)" },
    ],
    fields: [
      { name: "workout_plan_id", label: "Workout plan", type: "relation", relation: { table: "workout_plans", label: "title" }, required: true, wide: true },
      { name: "day_label", label: "Day label", type: "text", required: true, hint: "e.g. Day 1 · Lower" },
      { name: "exercise", label: "Exercise", type: "text", required: true },
      { name: "sets", label: "Sets", type: "number", required: true, min: 1, max: 20 },
      { name: "reps", label: "Reps", type: "text", required: true },
      { name: "rest_seconds", label: "Rest (seconds)", type: "number", min: 0, max: 600, default: 90 },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "notes", label: "Notes", type: "text", wide: true },
    ],
    search: ["exercise", "day_label"],
    order: { col: "sort_order" },
  },
  {
    slug: "diet-plans",
    title: "Diet plans",
    singular: "diet plan",
    table: "diet_plans",
    icon: "Utensils",
    group: "Training",
    read: COACH,
    write: COACH,
    columns: [
      { key: "title", label: "Title" },
      { key: "member_id", label: "Member", type: "relation", relation: memberRel },
      { key: "daily_calories", label: "kcal" },
      { key: "protein_g", label: "Protein" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "member_id", label: "Member", type: "relation", relation: memberRel, required: true },
      { name: "trainer_id", label: "Coach", type: "relation", relation: trainerRel },
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "daily_calories", label: "Daily calories", type: "number", required: true, min: 800, max: 6000 },
      { name: "protein_g", label: "Protein (g)", type: "number", min: 0 },
      { name: "carbs_g", label: "Carbs (g)", type: "number", min: 0 },
      { name: "fats_g", label: "Fats (g)", type: "number", min: 0 },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
      { name: "status", label: "Status", type: "select", options: REC, required: true, default: "active" },
    ],
    search: ["title"],
    order: { col: "created_at", asc: false },
  },
  {
    slug: "diet-meals",
    title: "Meals",
    singular: "meal",
    table: "diet_meals",
    icon: "Utensils",
    group: "Training",
    read: COACH,
    write: COACH,
    columns: [
      { key: "diet_plan_id", label: "Plan", type: "relation", relation: { table: "diet_plans", label: "title" } },
      { key: "meal_time", label: "Time" },
      { key: "name", label: "Meal" },
      { key: "calories", label: "kcal" },
      { key: "protein_g", label: "P" },
    ],
    fields: [
      { name: "diet_plan_id", label: "Diet plan", type: "relation", relation: { table: "diet_plans", label: "title" }, required: true, wide: true },
      { name: "meal_time", label: "Time", type: "time", required: true },
      { name: "name", label: "Meal name", type: "text", required: true },
      { name: "items", label: "Items", type: "textarea", wide: true },
      { name: "calories", label: "Calories", type: "number", min: 0 },
      { name: "protein_g", label: "Protein (g)", type: "number", min: 0 },
      { name: "carbs_g", label: "Carbs (g)", type: "number", min: 0 },
      { name: "fats_g", label: "Fats (g)", type: "number", min: 0 },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    search: ["name"],
    order: { col: "sort_order" },
  },

  // ─── Content ──────────────────────────────────────────────────────
  {
    slug: "gallery",
    title: "Gallery",
    singular: "gallery item",
    table: "gallery",
    icon: "Image",
    group: "Content",
    read: STAFF,
    write: STAFF,
    columns: [
      { key: "url", label: "", type: "image" },
      { key: "title", label: "Title" },
      { key: "category_id", label: "Category", type: "relation", relation: { table: "gallery_categories", label: "name" } },
      { key: "kind", label: "Type" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title / alt text", type: "text", required: true, wide: true },
      { name: "category_id", label: "Category", type: "relation", relation: { table: "gallery_categories", label: "name" }, required: true },
      { name: "kind", label: "Type", type: "select", options: ["image", "video"], required: true, default: "image" },
      { name: "url", label: "Image / poster URL", type: "url", required: true, wide: true },
      { name: "video_url", label: "Video URL (MP4)", type: "url", wide: true },
      { name: "width", label: "Width (px)", type: "number", default: 1600 },
      { name: "height", label: "Height (px)", type: "number", default: 1067 },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: PUB, required: true, default: "published" },
    ],
    search: ["title"],
    order: { col: "sort_order" },
  },
  {
    slug: "testimonials",
    title: "Testimonials",
    singular: "testimonial",
    table: "testimonials",
    icon: "MessageSquareQuote",
    group: "Content",
    read: STAFF,
    write: STAFF,
    columns: [
      { key: "image_url", label: "", type: "image" },
      { key: "name", label: "Name" },
      { key: "rating", label: "Rating" },
      { key: "transformation", label: "Result" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "rating", label: "Rating (1–5)", type: "number", required: true, min: 1, max: 5, default: 5 },
      { name: "review", label: "Review", type: "textarea", required: true, wide: true },
      { name: "transformation", label: "Transformation", type: "text" },
      { name: "member_since", label: "Member since", type: "text" },
      { name: "image_url", label: "Photo URL", type: "url" },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: PUB, required: true, default: "published" },
    ],
    search: ["name", "review"],
    order: { col: "sort_order" },
  },
  {
    slug: "blog",
    title: "Blog posts",
    singular: "post",
    table: "blog_posts",
    icon: "FileText",
    group: "Content",
    read: STAFF,
    write: STAFF,
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "author", label: "Author" },
      { key: "published_at", label: "Published", type: "date" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Workout", "Nutrition", "Weight Loss", "Muscle Building", "Fitness Tips", "Lifestyle"], required: true },
      { name: "author", label: "Author", type: "text", required: true },
      { name: "read_minutes", label: "Read time (min)", type: "number", min: 1, max: 60, default: 5 },
      { name: "cover_url", label: "Cover image URL", type: "url", wide: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { name: "body", label: "Body (blank line between paragraphs)", type: "textarea", wide: true, required: true },
      { name: "published_at", label: "Publish at", type: "datetime" },
      { name: "status", label: "Status", type: "select", options: PUB, required: true, default: "draft" },
    ],
    search: ["title", "category"],
    order: { col: "published_at", asc: false },
    statusFilter: { col: "status", options: PUB },
  },

  // ─── Inbox ────────────────────────────────────────────────────────
  {
    slug: "trial-bookings",
    title: "Trial bookings",
    singular: "trial booking",
    table: "trial_bookings",
    icon: "CalendarCheck",
    group: "Inbox",
    read: STAFF,
    write: STAFF,
    columns: [
      { key: "preferred_date", label: "Date", type: "date" },
      { key: "preferred_time", label: "Time" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "interest", label: "Interest" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "preferred_date", label: "Date", type: "date", required: true },
      { name: "preferred_time", label: "Time", type: "time", required: true },
      { name: "interest", label: "Interest", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", wide: true },
      { name: "status", label: "Status", type: "select", options: ["new", "confirmed", "attended", "cancelled", "converted"], required: true, default: "new" },
    ],
    search: ["name", "phone", "email"],
    order: { col: "preferred_date", asc: false },
    statusFilter: { col: "status", options: ["new", "confirmed", "attended", "cancelled", "converted"] },
  },
  {
    slug: "enquiries",
    title: "Enquiries",
    singular: "enquiry",
    table: "contact_messages",
    icon: "Inbox",
    group: "Inbox",
    read: STAFF,
    write: STAFF,
    create: false,
    columns: [
      { key: "created_at", label: "Received", type: "datetime" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "subject", label: "Subject" },
      { key: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "status", label: "Status", type: "select", options: ["new", "read", "replied", "archived"], required: true },
      { name: "message", label: "Message", type: "textarea", wide: true },
    ],
    search: ["name", "email", "subject"],
    order: { col: "created_at", asc: false },
    statusFilter: { col: "status", options: ["new", "read", "replied", "archived"] },
  },
];

export const getResource = (slug: string) => resources.find((r) => r.slug === slug);
