-- ════════════════════════════════════════════════════════════════════
-- ATHLEX — core schema
-- UUID PKs, timestamps, status columns, soft deletes, FKs and indexes.
-- ════════════════════════════════════════════════════════════════════
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ─── Enums ──────────────────────────────────────────────────────────
create type public.user_role as enum ('admin', 'staff', 'trainer', 'member');
create type public.membership_status as enum ('pending', 'active', 'expired', 'cancelled', 'frozen');
create type public.payment_status as enum ('created', 'paid', 'failed', 'cancelled', 'refunded');
create type public.booking_status as enum ('booked', 'attended', 'cancelled', 'no_show');
create type public.trial_status as enum ('new', 'confirmed', 'attended', 'cancelled', 'converted');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.record_status as enum ('active', 'inactive', 'archived');

-- ─── updated_at trigger ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── users (profile for auth.users) ─────────────────────────────────
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role public.user_role not null default 'member',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index users_role_idx on public.users (role) where deleted_at is null;

-- ─── trainers ───────────────────────────────────────────────────────
create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users (id) on delete set null,
  slug text not null unique,
  name text not null,
  position text not null default '',
  specialization text not null default '',
  experience_years smallint not null default 0 check (experience_years >= 0),
  bio text not null default '',
  image_url text,
  certifications text[] not null default '{}',
  social jsonb not null default '{}',
  sort_order int not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index trainers_status_idx on public.trainers (status, sort_order) where deleted_at is null;

create table public.trainer_availability (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index trainer_availability_trainer_idx on public.trainer_availability (trainer_id, day_of_week);

-- ─── members ────────────────────────────────────────────────────────
create sequence public.member_code_seq start 1001;

create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  member_code text not null unique default ('ATX-' || nextval('public.member_code_seq')),
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  height_cm numeric(5, 1) check (height_cm between 50 and 260),
  fitness_goal text,
  emergency_contact_name text,
  emergency_contact_phone text,
  address text,
  assigned_trainer_id uuid references public.trainers (id) on delete set null,
  joined_at date not null default current_date,
  notes text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index members_trainer_idx on public.members (assigned_trainer_id);

-- ─── plans / memberships / payments ─────────────────────────────────
create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  duration_months smallint not null check (duration_months > 0),
  duration_days smallint not null check (duration_days > 0),
  price_paise integer not null check (price_paise >= 100),
  compare_at_paise integer,
  tagline text not null default '',
  features text[] not null default '{}',
  is_highlighted boolean not null default false,
  sort_order int not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  description text not null default '',
  discount_type text not null check (discount_type in ('percent', 'flat')),
  discount_value integer not null check (discount_value > 0),
  max_redemptions integer,
  redeemed_count integer not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  plan_ids uuid[] not null default '{}',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  plan_id uuid not null references public.membership_plans (id),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  amount_paise integer not null default 0,
  status public.membership_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index memberships_member_idx on public.memberships (member_id, end_date desc);
create index memberships_status_end_idx on public.memberships (status, end_date);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete restrict,
  member_id uuid not null references public.members (id) on delete restrict,
  plan_id uuid not null references public.membership_plans (id),
  membership_id uuid references public.memberships (id) on delete set null,
  coupon_id uuid references public.coupons (id) on delete set null,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount_paise integer not null check (amount_paise > 0),
  discount_paise integer not null default 0,
  currency char(3) not null default 'INR',
  status public.payment_status not null default 'created',
  method text,
  failure_reason text,
  receipt_number text unique,
  paid_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_member_idx on public.payments (member_id, created_at desc);
create index payments_status_idx on public.payments (status, created_at desc);

-- ─── classes ────────────────────────────────────────────────────────
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  duration_min smallint not null check (duration_min > 0),
  intensity smallint not null default 3 check (intensity between 1 and 5),
  description text not null default '',
  image_url text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  trainer_id uuid references public.trainers (id) on delete set null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  room text not null default '',
  capacity smallint not null default 20 check (capacity > 0),
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index class_schedules_day_idx on public.class_schedules (day_of_week, start_time);

create table public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.class_schedules (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  class_date date not null,
  status public.booking_status not null default 'booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, member_id, class_date)
);
create index class_bookings_member_idx on public.class_bookings (member_id, class_date);
create index class_bookings_schedule_idx on public.class_bookings (schedule_id, class_date) where status = 'booked';

create table public.personal_training (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  session_at timestamptz not null,
  duration_min smallint not null default 60,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index personal_training_member_idx on public.personal_training (member_id, session_at);
create index personal_training_trainer_idx on public.personal_training (trainer_id, session_at);

-- ─── attendance ─────────────────────────────────────────────────────
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  check_in_at timestamptz not null default now(),
  check_out_at timestamptz,
  method text not null default 'qr' check (method in ('qr', 'manual')),
  verified_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index attendance_member_idx on public.attendance (member_id, check_in_at desc);
create index attendance_day_idx on public.attendance (check_in_at desc);

-- ─── workout & diet ─────────────────────────────────────────────────
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid references public.trainers (id) on delete set null,
  title text not null,
  goal text,
  start_date date not null default current_date,
  end_date date,
  notes text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workout_plans_member_idx on public.workout_plans (member_id, status);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans (id) on delete cascade,
  day_label text not null,
  exercise text not null,
  sets smallint not null check (sets > 0),
  reps text not null,
  rest_seconds smallint not null default 60,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workout_exercises_plan_idx on public.workout_exercises (workout_plan_id, sort_order);

create table public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid references public.trainers (id) on delete set null,
  title text not null,
  daily_calories integer not null check (daily_calories > 0),
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fats_g integer not null default 0,
  notes text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index diet_plans_member_idx on public.diet_plans (member_id, status);

create table public.diet_meals (
  id uuid primary key default gen_random_uuid(),
  diet_plan_id uuid not null references public.diet_plans (id) on delete cascade,
  meal_time text not null,
  name text not null,
  items text not null default '',
  calories integer not null default 0,
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fats_g integer not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index diet_meals_plan_idx on public.diet_meals (diet_plan_id, sort_order);

-- ─── progress ───────────────────────────────────────────────────────
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5, 1) not null check (weight_kg between 20 and 400),
  bmi numeric(4, 1),
  body_fat_pct numeric(4, 1) check (body_fat_pct between 2 and 70),
  chest_cm numeric(5, 1),
  waist_cm numeric(5, 1),
  hips_cm numeric(5, 1),
  arms_cm numeric(5, 1),
  thighs_cm numeric(5, 1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index body_measurements_member_idx on public.body_measurements (member_id, measured_on);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  storage_path text not null,
  taken_on date not null default current_date,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index progress_photos_member_idx on public.progress_photos (member_id, taken_on desc) where deleted_at is null;

-- ─── content ────────────────────────────────────────────────────────
create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.gallery_categories (id) on delete set null,
  title text not null,
  kind text not null default 'image' check (kind in ('image', 'video')),
  url text not null,
  video_url text,
  width integer not null default 1600,
  height integer not null default 1067,
  sort_order int not null default 0,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index gallery_category_idx on public.gallery (category_id, sort_order) where deleted_at is null;

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  rating smallint not null default 5 check (rating between 1 and 5),
  review text not null,
  transformation text,
  member_since text,
  sort_order int not null default 0,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  discount_label text,
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null,
  cover_url text,
  body text not null default '',
  author text not null default 'ATHLEX Team',
  read_minutes smallint not null default 5,
  published_at timestamptz,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index blog_posts_published_idx on public.blog_posts (status, published_at desc) where deleted_at is null;

-- ─── leads & comms ──────────────────────────────────────────────────
create table public.trial_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email citext not null,
  preferred_date date not null,
  preferred_time text not null,
  interest text not null,
  message text,
  source text not null default 'website',
  status public.trial_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index trial_bookings_status_idx on public.trial_bookings (status, preferred_date);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null,
  phone text,
  subject text not null default 'General enquiry',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade, -- null = admin feed
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'whatsapp', 'sms')),
  type text not null,
  title text not null,
  body text not null default '',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'read')),
  read_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── updated_at triggers on every table ─────────────────────────────
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
