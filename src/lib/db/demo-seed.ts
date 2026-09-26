import "server-only";
import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import { blogPosts, classSchedules, classTypes, galleryCategories, galleryItems, plans, testimonials, trainers } from "@/lib/content";
import { addDays, toISODate } from "@/lib/utils";
import type { Row } from "./types";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

/** Deterministic PRNG so demo data is stable across restarts. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export const DEMO_ACCOUNTS = [
  { email: "admin@athlex.demo", password: "Admin@123", role: "admin", name: "Aarav Admin" },
  { email: "staff@athlex.demo", password: "Staff@123", role: "staff", name: "Sana Front Desk" },
  { email: "trainer@athlex.demo", password: "Trainer@123", role: "trainer", name: "Arjun Rao" },
  { email: "member@athlex.demo", password: "Member@123", role: "member", name: "Rahul Verma" },
] as const;

export function buildDemoSeed(): Record<string, Row[]> {
  const now = new Date();
  const iso = () => now.toISOString();
  const r = rng(42);
  const ts = { created_at: iso(), updated_at: iso() };

  const tables: Record<string, Row[]> = {};

  // ─── catalogue ────────────────────────────────────────────────────
  tables.membership_plans = plans.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    duration_months: p.durationMonths,
    duration_days: p.durationDays,
    price_paise: p.price,
    compare_at_paise: p.compareAt ?? null,
    tagline: p.tagline,
    features: p.features,
    is_highlighted: Boolean(p.highlighted),
    sort_order: i,
    status: "active",
    deleted_at: null,
    ...ts,
  }));

  tables.trainers = trainers.map((t, i) => ({
    id: t.id,
    user_id: null as string | null,
    slug: t.slug,
    name: t.name,
    position: t.position,
    specialization: t.specialization,
    experience_years: t.experienceYears,
    bio: t.bio,
    image_url: t.image,
    certifications: t.certifications,
    social: t.social,
    sort_order: i,
    status: "active",
    deleted_at: null,
    ...ts,
  }));

  tables.trainer_availability = trainers.flatMap((t) =>
    [0, 1, 2, 3, 4, 5].map((d) => ({ id: randomUUID(), trainer_id: t.id, day_of_week: d, start_time: "06:00", end_time: "12:00", ...ts })),
  );

  tables.classes = classTypes.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category,
    duration_min: c.durationMin,
    intensity: c.intensity,
    description: c.description,
    image_url: null,
    status: "active",
    deleted_at: null,
    ...ts,
  }));

  tables.class_schedules = classSchedules.map((s) => ({
    id: s.id,
    class_id: s.classId,
    trainer_id: s.trainerId,
    day_of_week: s.day,
    start_time: s.start,
    end_time: s.end,
    room: s.room,
    capacity: s.capacity,
    status: "active",
    ...ts,
  }));

  tables.gallery_categories = galleryCategories
    .filter((c) => c.value !== "all")
    .map((c, i) => ({ id: randomUUID(), slug: c.value, name: c.label, sort_order: i, ...ts }));
  const catId = (slug: string) => tables.gallery_categories.find((c) => c.slug === slug)?.id;

  tables.gallery = galleryItems.map((g, i) => ({
    id: g.id,
    category_id: catId(g.category),
    title: g.title,
    kind: g.kind,
    url: g.src,
    video_url: g.videoUrl ?? null,
    width: g.width,
    height: g.height,
    sort_order: i,
    status: "published",
    deleted_at: null,
    ...ts,
  }));

  tables.testimonials = testimonials.map((t, i) => ({
    id: randomUUID(),
    name: t.name,
    image_url: t.image,
    rating: t.rating,
    review: t.review,
    transformation: t.transformation,
    member_since: t.memberSince,
    sort_order: i,
    status: "published",
    deleted_at: null,
    ...ts,
  }));

  tables.blog_posts = blogPosts.map((b) => ({
    id: randomUUID(),
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    category: b.category,
    cover_url: b.image,
    body: b.body.join("\n\n"),
    author: b.author,
    read_minutes: b.readMinutes,
    published_at: new Date(b.date).toISOString(),
    status: "published",
    deleted_at: null,
    ...ts,
  }));

  tables.offers = [
    {
      id: randomUUID(),
      title: "Monsoon Kickstart",
      description: "Flat 10% off any plan with code WELCOME10. New members only.",
      discount_label: "10% OFF",
      image_url: null,
      starts_at: addDays(now, -10).toISOString(),
      ends_at: addDays(now, 20).toISOString(),
      status: "published",
      deleted_at: null,
      ...ts,
    },
  ];

  tables.coupons = [
    { id: randomUUID(), code: "WELCOME10", description: "10% off for new members", discount_type: "percent", discount_value: 10, max_redemptions: 500, redeemed_count: 37, valid_from: null, valid_until: addDays(now, 60).toISOString(), plan_ids: [], status: "active", deleted_at: null, ...ts },
    { id: randomUUID(), code: "ELITE2K", description: "₹2,000 off the Elite plan", discount_type: "flat", discount_value: 200000, max_redemptions: 50, redeemed_count: 4, valid_from: null, valid_until: addDays(now, 30).toISOString(), plan_ids: [plans[3].id], status: "active", deleted_at: null, ...ts },
  ];

  tables.settings = [
    { key: "gym", value: { name: "ATHLEX", phone: "+91 98765 43210", email: "hello@athlex.fit", gst_number: "29ABCDE1234F1Z5", attendance_window_minutes: 1 }, ...ts },
    { key: "notifications", value: { email: true, whatsapp: true, sms: false, reminder_hours_before_class: 2, expiry_reminder_days: [7, 3, 1] }, ...ts },
  ];

  // ─── people ───────────────────────────────────────────────────────
  tables.users = [];
  tables.members = [];
  tables.auth_credentials = [];

  const firstNames = ["Ishaan", "Tanvi", "Rohit", "Neha", "Vivek", "Pooja", "Aman", "Riya", "Siddharth", "Kavya", "Harsh", "Mitali", "Yash", "Aditi"];
  const lastNames = ["Sharma", "Iyer", "Patel", "Gupta", "Nair", "Reddy", "Joshi", "Kulkarni", "Das", "Bose", "Menon", "Rao", "Pillai", "Shah"];

  const addUser = (email: string, name: string, role: string, password?: string, createdDaysAgo = 200) => {
    const id = randomUUID();
    const created = addDays(now, -createdDaysAgo).toISOString();
    tables.users.push({ id, email, full_name: name, phone: `+9198${String(Math.floor(r() * 1e8)).padStart(8, "0")}`, avatar_url: null, role, status: "active", created_at: created, updated_at: created, deleted_at: null });
    if (password) tables.auth_credentials.push({ user_id: id, email, password_hash: hashPassword(password), email_verified: true });
    return id;
  };

  const accountIds: Record<string, string> = {};
  for (const a of DEMO_ACCOUNTS) accountIds[a.role] = addUser(a.email, a.name, a.role, a.password, 400);
  tables.trainers[0].user_id = accountIds.trainer;

  let code = 1001;
  const addMember = (userId: string, trainerId: string | null, joinedDaysAgo: number, gender: string) => {
    const id = randomUUID();
    tables.members.push({
      id,
      user_id: userId,
      member_code: `ATX-${code++}`,
      date_of_birth: `199${Math.floor(r() * 9)}-0${1 + Math.floor(r() * 8)}-1${Math.floor(r() * 9)}`,
      gender,
      height_cm: 160 + Math.round(r() * 25),
      fitness_goal: ["Build muscle", "Lose fat", "Get stronger", "Improve fitness"][Math.floor(r() * 4)],
      emergency_contact_name: "Family contact",
      emergency_contact_phone: "+919800000000",
      address: "Bengaluru",
      assigned_trainer_id: trainerId,
      joined_at: toISODate(addDays(now, -joinedDaysAgo)),
      notes: null,
      status: "active",
      created_at: addDays(now, -joinedDaysAgo).toISOString(),
      updated_at: iso(),
      deleted_at: null,
    });
    return id;
  };

  const demoMemberId = addMember(accountIds.member, trainers[0].id, 120, "male");
  const otherMembers: string[] = [];
  firstNames.forEach((f, i) => {
    const uid = addUser(`${f.toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`, `${f} ${lastNames[i]}`, "member", undefined, 10 + i * 17);
    otherMembers.push(addMember(uid, trainers[i % trainers.length].id, 5 + i * 17, i % 2 ? "female" : "male"));
  });

  // ─── memberships + payments ───────────────────────────────────────
  tables.memberships = [];
  tables.payments = [];
  let receipt = 5001;
  const addMembership = (memberId: string, planIdx: number, startDaysAgo: number, method = "upi") => {
    const plan = plans[planIdx];
    const start = addDays(now, -startDaysAgo);
    const end = addDays(start, plan.durationDays - 1);
    const status = end < now ? "expired" : "active";
    const membershipId = randomUUID();
    const member = tables.members.find((m) => m.id === memberId)!;
    tables.memberships.push({ id: membershipId, member_id: memberId, plan_id: plan.id, start_date: toISODate(start), end_date: toISODate(end), amount_paise: plan.price, status, created_at: start.toISOString(), updated_at: start.toISOString() });
    tables.payments.push({
      id: randomUUID(),
      user_id: member.user_id,
      member_id: memberId,
      plan_id: plan.id,
      membership_id: membershipId,
      coupon_id: null,
      razorpay_order_id: `order_demo_${randomBytes(6).toString("hex")}`,
      razorpay_payment_id: `pay_demo_${randomBytes(6).toString("hex")}`,
      razorpay_signature: null,
      amount_paise: plan.price,
      discount_paise: 0,
      currency: "INR",
      status: "paid",
      method,
      failure_reason: null,
      receipt_number: `ATX-R${receipt++}`,
      paid_at: start.toISOString(),
      metadata: {},
      created_at: start.toISOString(),
      updated_at: start.toISOString(),
    });
  };

  addMembership(demoMemberId, 1, 210, "card");
  addMembership(demoMemberId, 2, 118);
  otherMembers.forEach((m, i) => {
    const planIdx = i % 4;
    const startAgo = [3, 25, 60, 80, 170, 26, 88, 120, 175, 29, 4, 150, 200, 85][i] ?? 10;
    addMembership(m, planIdx, startAgo, i % 3 ? "upi" : "card");
  });
  // One abandoned checkout for the "pending payments" widget
  const pendingMember = tables.members.find((m) => m.id === otherMembers[2])!;
  tables.payments.push({
    id: randomUUID(), user_id: pendingMember.user_id, member_id: pendingMember.id, plan_id: plans[1].id, membership_id: null, coupon_id: null,
    razorpay_order_id: `order_demo_${randomBytes(6).toString("hex")}`, razorpay_payment_id: null, razorpay_signature: null,
    amount_paise: plans[1].price, discount_paise: 0, currency: "INR", status: "created", method: null, failure_reason: null,
    receipt_number: null, paid_at: null, metadata: {}, created_at: addDays(now, -1).toISOString(), updated_at: addDays(now, -1).toISOString(),
  });

  // ─── attendance (last 45 days) ────────────────────────────────────
  tables.attendance = [];
  const allMembers = [demoMemberId, ...otherMembers];
  for (let d = 45; d >= 0; d--) {
    const day = addDays(now, -d);
    allMembers.forEach((m, i) => {
      const chance = i === 0 ? 0.72 : 0.35 + (i % 5) * 0.08;
      if (r() < chance) {
        const checkIn = new Date(day);
        checkIn.setHours(6 + Math.floor(r() * 14), Math.floor(r() * 60), 0, 0);
        if (d === 0 && checkIn > now) return;
        const out = new Date(checkIn.getTime() + (50 + Math.floor(r() * 50)) * 60000);
        tables.attendance.push({ id: randomUUID(), member_id: m, check_in_at: checkIn.toISOString(), check_out_at: d === 0 ? null : out.toISOString(), method: "qr", verified_by: accountIds.staff, created_at: checkIn.toISOString(), updated_at: checkIn.toISOString() });
      }
    });
  }

  // ─── bookings & PT ────────────────────────────────────────────────
  tables.class_bookings = [];
  const upcoming = (offsetDays: number, scheduleIdx: number) => {
    const s = classSchedules[scheduleIdx];
    // next date matching the schedule's weekday
    const d = addDays(now, offsetDays);
    const dow = (d.getDay() + 6) % 7;
    const target = addDays(d, (s.day - dow + 7) % 7);
    return { schedule_id: s.id, class_date: toISODate(target) };
  };
  [
    [0, 2],
    [1, 11],
    [2, 20],
  ].forEach(([o, s]) => tables.class_bookings.push({ id: randomUUID(), member_id: demoMemberId, status: "booked", ...upcoming(o, s), ...ts }));

  tables.personal_training = [
    { id: randomUUID(), member_id: demoMemberId, trainer_id: trainers[0].id, session_at: addDays(now, 2).toISOString(), duration_min: 60, status: "scheduled", notes: "Deadlift technique + accessory review", ...ts },
    { id: randomUUID(), member_id: demoMemberId, trainer_id: trainers[0].id, session_at: addDays(now, 9).toISOString(), duration_min: 60, status: "scheduled", notes: "Monthly re-assessment", ...ts },
    { id: randomUUID(), member_id: demoMemberId, trainer_id: trainers[0].id, session_at: addDays(now, -5).toISOString(), duration_min: 60, status: "completed", notes: "Squat depth work", ...ts },
  ];

  // ─── workout + diet plans ─────────────────────────────────────────
  const workoutId = randomUUID();
  tables.workout_plans = [{ id: workoutId, member_id: demoMemberId, trainer_id: trainers[0].id, title: "Strength Block A — Upper/Lower", goal: "Get stronger", start_date: toISODate(addDays(now, -14)), end_date: toISODate(addDays(now, 42)), notes: "Leave 1–2 reps in reserve on all working sets. Log every session.", status: "active", ...ts }];
  const ex: [string, string, number, string, number][] = [
    ["Day 1 · Lower", "Back Squat", 5, "5", 180],
    ["Day 1 · Lower", "Romanian Deadlift", 3, "8", 120],
    ["Day 1 · Lower", "Walking Lunge", 3, "12 / leg", 90],
    ["Day 1 · Lower", "Hanging Knee Raise", 3, "15", 60],
    ["Day 2 · Upper", "Bench Press", 5, "5", 180],
    ["Day 2 · Upper", "Weighted Pull-up", 4, "6", 150],
    ["Day 2 · Upper", "Seated DB Press", 3, "10", 90],
    ["Day 2 · Upper", "Cable Row", 3, "12", 75],
    ["Day 3 · Lower", "Deadlift", 4, "4", 210],
    ["Day 3 · Lower", "Front Squat", 3, "6", 150],
    ["Day 3 · Lower", "Sled Push", 4, "20 m", 90],
    ["Day 4 · Upper", "Overhead Press", 5, "5", 150],
    ["Day 4 · Upper", "Chin-up", 3, "AMRAP", 120],
    ["Day 4 · Upper", "Incline DB Press", 3, "10", 90],
  ];
  tables.workout_exercises = ex.map(([day_label, exercise, sets, reps, rest_seconds], i) => ({ id: randomUUID(), workout_plan_id: workoutId, day_label, exercise, sets, reps, rest_seconds, notes: null, sort_order: i, ...ts }));

  const dietId = randomUUID();
  tables.diet_plans = [{ id: dietId, member_id: demoMemberId, trainer_id: trainers[2].id, title: "Lean Gain — 2,600 kcal", daily_calories: 2600, protein_g: 160, carbs_g: 310, fats_g: 78, notes: "Hydrate 3.5 L/day. Swap paneer ↔ chicken freely.", status: "active", ...ts }];
  const meals: [string, string, string, number, number, number, number][] = [
    ["07:00", "Breakfast", "Oats (80 g), whey (1 scoop), banana, almonds (15 g)", 620, 42, 82, 14],
    ["10:30", "Mid-morning", "Greek yoghurt (200 g), berries, honey", 280, 22, 38, 4],
    ["13:30", "Lunch", "Brown rice (150 g cooked), chicken breast (180 g), dal, salad", 720, 55, 88, 16],
    ["17:00", "Pre-workout", "2 rice cakes, peanut butter, black coffee", 330, 10, 38, 16],
    ["20:30", "Dinner", "3 rotis, paneer bhurji (150 g), sautéed vegetables", 650, 31, 64, 28],
  ];
  tables.diet_meals = meals.map(([meal_time, name, items, calories, protein_g, carbs_g, fats_g], i) => ({ id: randomUUID(), diet_plan_id: dietId, meal_time, name, items, calories, protein_g, carbs_g, fats_g, sort_order: i, ...ts }));

  // ─── progress ─────────────────────────────────────────────────────
  tables.body_measurements = Array.from({ length: 9 }, (_, i) => {
    const w = 84.5 - i * 0.9 + (r() - 0.5) * 0.6;
    const h = 1.78;
    return {
      id: randomUUID(),
      member_id: demoMemberId,
      measured_on: toISODate(addDays(now, -(8 - i) * 14)),
      weight_kg: Number(w.toFixed(1)),
      bmi: Number((w / (h * h)).toFixed(1)),
      body_fat_pct: Number((24 - i * 0.8).toFixed(1)),
      chest_cm: Number((101 + i * 0.3).toFixed(1)),
      waist_cm: Number((92 - i * 1.1).toFixed(1)),
      hips_cm: Number((100 - i * 0.5).toFixed(1)),
      arms_cm: Number((35 + i * 0.25).toFixed(1)),
      thighs_cm: Number((58 - i * 0.2).toFixed(1)),
      notes: null,
      ...ts,
    };
  });
  tables.progress_photos = [];

  // ─── leads & comms ────────────────────────────────────────────────
  tables.trial_bookings = [
    ["Farhan Qureshi", "HIIT", 0, "new"],
    ["Lavanya Rao", "Strength Training", 1, "confirmed"],
    ["Gaurav Khanna", "Weight Loss", 2, "new"],
    ["Simran Kaur", "Yoga", -2, "attended"],
    ["Rakesh Pillai", "Personal Training", -4, "converted"],
  ].map(([name, interest, d, status]) => ({
    id: randomUUID(),
    name,
    phone: "+919812345678",
    email: `${String(name).split(" ")[0].toLowerCase()}@example.com`,
    preferred_date: toISODate(addDays(now, Number(d))),
    preferred_time: "07:00",
    interest,
    message: null,
    source: "website",
    status,
    ...ts,
  }));

  tables.contact_messages = [
    { id: randomUUID(), name: "Megha Jain", email: "megha@example.com", phone: null, subject: "Corporate memberships", message: "Do you offer corporate plans for a team of 25?", status: "new", ...ts },
    { id: randomUUID(), name: "Arvind S", email: "arvind@example.com", phone: "+919900112233", subject: "Freeze membership", message: "I'll be travelling for 3 weeks — can I pause my plan?", status: "read", ...ts },
  ];

  tables.notifications = [
    { id: randomUUID(), user_id: accountIds.member, channel: "in_app", type: "class_reminder", title: "Class tomorrow", body: "Barbell Club with Arjun at 6:00 PM. See you on the platform!", status: "sent", read_at: null, metadata: {}, ...ts },
    { id: randomUUID(), user_id: accountIds.member, channel: "in_app", type: "payment_confirmation", title: "Payment received", body: "Your Premium membership is active. Receipt ATX-R5002.", status: "read", read_at: iso(), metadata: {}, ...ts },
    { id: randomUUID(), user_id: null, channel: "in_app", type: "trial_booking", title: "New trial booking", body: "Farhan Qureshi booked a HIIT trial for today.", status: "sent", read_at: null, metadata: {}, ...ts },
  ];

  tables.newsletter_subscribers = [];

  return tables;
}
