-- ════════════════════════════════════════════════════════════════════
-- ATHLEX — auth hooks, role helpers, Row Level Security, RPCs, storage
-- ════════════════════════════════════════════════════════════════════

-- ─── Role helpers (security definer so policies don't recurse) ──────
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid() and deleted_at is null
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('admin', 'staff'), false)
$$;

create or replace function public.is_trainer()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'trainer', false)
$$;

create or replace function public.current_member_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.members where user_id = auth.uid() and deleted_at is null
$$;

create or replace function public.current_trainer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.trainers where user_id = auth.uid() and deleted_at is null
$$;

-- Trainer may access a member only if assigned to them
create or replace function public.trainer_owns_member(p_member uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where m.id = p_member and m.assigned_trainer_id = public.current_trainer_id()
  )
$$;

-- ─── New auth user → profile + member row ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  insert into public.members (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Prevent privilege escalation on users.role ─────────────────────
-- SECURITY INVOKER on purpose: current_user is then the caller's role, so API
-- users (anon/authenticated) are restricted while the SQL editor / service role are not.
create or replace function public.guard_user_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'Only admins can change roles';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Email is managed by auth';
    end if;
  end if;
  return new;
end $$;

create trigger guard_user_role before update on public.users
  for each row execute function public.guard_user_role();

-- ─── Enable RLS everywhere ──────────────────────────────────────────
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ─── users ──────────────────────────────────────────────────────────
create policy users_select on public.users for select to authenticated
  using (id = auth.uid() or public.is_staff() or public.is_trainer());
create policy users_update_self on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy users_staff_all on public.users for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ─── members ────────────────────────────────────────────────────────
create policy members_select on public.members for select to authenticated
  using (user_id = auth.uid() or public.is_staff() or public.trainer_owns_member(id));
create policy members_update_self on public.members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy members_staff_all on public.members for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ─── public catalogue (read for everyone, write for staff) ──────────
create policy plans_public_read on public.membership_plans for select using (status = 'active' and deleted_at is null);
create policy trainers_public_read on public.trainers for select using (status = 'active' and deleted_at is null);
create policy trainer_avail_public_read on public.trainer_availability for select using (true);
create policy classes_public_read on public.classes for select using (status = 'active' and deleted_at is null);
create policy schedules_public_read on public.class_schedules for select using (status = 'active');
create policy gallery_cat_public_read on public.gallery_categories for select using (true);
create policy gallery_public_read on public.gallery for select using (status = 'published' and deleted_at is null);
create policy testimonials_public_read on public.testimonials for select using (status = 'published' and deleted_at is null);
create policy offers_public_read on public.offers for select using (status = 'published' and deleted_at is null);
create policy blog_public_read on public.blog_posts for select using (status = 'published' and deleted_at is null and published_at <= now());
create policy settings_public_read on public.settings for select using (true);

do $$
declare t text;
begin
  foreach t in array array[
    'membership_plans','trainers','trainer_availability','classes','class_schedules','gallery_categories',
    'gallery','testimonials','offers','blog_posts','settings','coupons'
  ]
  loop
    execute format('create policy %I on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())', t || '_staff_all', t);
  end loop;
end $$;

-- Trainers can manage the class timetable they teach
create policy schedules_trainer_update on public.class_schedules for update to authenticated
  using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());

-- ─── memberships & payments: read own, write staff / service role ───
create policy memberships_select on public.memberships for select to authenticated
  using (member_id = public.current_member_id() or public.is_staff() or public.trainer_owns_member(member_id));
create policy memberships_staff_all on public.memberships for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy payments_select on public.payments for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy payments_staff_all on public.payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── bookings & sessions ────────────────────────────────────────────
create policy class_bookings_select on public.class_bookings for select to authenticated
  using (member_id = public.current_member_id() or public.is_staff() or public.is_trainer());
create policy class_bookings_cancel_own on public.class_bookings for update to authenticated
  using (member_id = public.current_member_id()) with check (member_id = public.current_member_id() and status = 'cancelled');
create policy class_bookings_staff_all on public.class_bookings for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy pt_select on public.personal_training for select to authenticated
  using (member_id = public.current_member_id() or trainer_id = public.current_trainer_id() or public.is_staff());
create policy pt_trainer_manage on public.personal_training for all to authenticated
  using (trainer_id = public.current_trainer_id() or public.is_staff())
  with check (trainer_id = public.current_trainer_id() or public.is_staff());

-- ─── attendance ─────────────────────────────────────────────────────
create policy attendance_select on public.attendance for select to authenticated
  using (member_id = public.current_member_id() or public.is_staff() or public.is_trainer());
create policy attendance_desk_insert on public.attendance for insert to authenticated
  with check (public.is_staff() or public.is_trainer());
create policy attendance_staff_all on public.attendance for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ─── workout / diet plans ───────────────────────────────────────────
create policy workout_plans_select on public.workout_plans for select to authenticated
  using (member_id = public.current_member_id() or public.is_staff() or public.trainer_owns_member(member_id));
create policy workout_plans_manage on public.workout_plans for all to authenticated
  using (public.is_staff() or public.trainer_owns_member(member_id))
  with check (public.is_staff() or public.trainer_owns_member(member_id));

create policy workout_ex_select on public.workout_exercises for select to authenticated
  using (exists (select 1 from public.workout_plans p where p.id = workout_plan_id
    and (p.member_id = public.current_member_id() or public.is_staff() or public.trainer_owns_member(p.member_id))));
create policy workout_ex_manage on public.workout_exercises for all to authenticated
  using (exists (select 1 from public.workout_plans p where p.id = workout_plan_id and (public.is_staff() or public.trainer_owns_member(p.member_id))))
  with check (exists (select 1 from public.workout_plans p where p.id = workout_plan_id and (public.is_staff() or public.trainer_owns_member(p.member_id))));

create policy diet_plans_select on public.diet_plans for select to authenticated
  using (member_id = public.current_member_id() or public.is_staff() or public.trainer_owns_member(member_id));
create policy diet_plans_manage on public.diet_plans for all to authenticated
  using (public.is_staff() or public.trainer_owns_member(member_id))
  with check (public.is_staff() or public.trainer_owns_member(member_id));

create policy diet_meals_select on public.diet_meals for select to authenticated
  using (exists (select 1 from public.diet_plans p where p.id = diet_plan_id
    and (p.member_id = public.current_member_id() or public.is_staff() or public.trainer_owns_member(p.member_id))));
create policy diet_meals_manage on public.diet_meals for all to authenticated
  using (exists (select 1 from public.diet_plans p where p.id = diet_plan_id and (public.is_staff() or public.trainer_owns_member(p.member_id))))
  with check (exists (select 1 from public.diet_plans p where p.id = diet_plan_id and (public.is_staff() or public.trainer_owns_member(p.member_id))));

-- ─── progress: members own their data ───────────────────────────────
create policy measurements_own on public.body_measurements for all to authenticated
  using (member_id = public.current_member_id()) with check (member_id = public.current_member_id());
create policy measurements_coach_read on public.body_measurements for select to authenticated
  using (public.is_staff() or public.trainer_owns_member(member_id));

create policy photos_own on public.progress_photos for all to authenticated
  using (member_id = public.current_member_id()) with check (member_id = public.current_member_id());
create policy photos_coach_read on public.progress_photos for select to authenticated
  using (public.is_staff() or public.trainer_owns_member(member_id));

-- ─── leads: anyone can submit, only staff can read ──────────────────
create policy trial_insert on public.trial_bookings for insert to anon, authenticated with check (status = 'new');
create policy trial_staff on public.trial_bookings for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy contact_insert on public.contact_messages for insert to anon, authenticated with check (status = 'new');
create policy contact_staff on public.contact_messages for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy newsletter_insert on public.newsletter_subscribers for insert to anon, authenticated with check (true);
create policy newsletter_staff on public.newsletter_subscribers for select to authenticated using (public.is_staff());

-- ─── notifications ──────────────────────────────────────────────────
create policy notifications_own on public.notifications for select to authenticated
  using (user_id = auth.uid() or (user_id is null and public.is_staff()));
create policy notifications_mark_read on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_staff on public.notifications for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- coupons are never publicly readable (validated server-side only)

-- ════════════════════════════════════════════════════════════════════
-- RPC: atomic class booking (capacity + active membership + no dupes)
-- ════════════════════════════════════════════════════════════════════
create or replace function public.book_class(p_schedule_id uuid, p_class_date date)
returns public.class_bookings
language plpgsql security definer set search_path = public as $$
declare
  v_member uuid := public.current_member_id();
  v_sched public.class_schedules;
  v_taken int;
  v_row public.class_bookings;
begin
  if v_member is null then raise exception 'NOT_A_MEMBER'; end if;
  if p_class_date < current_date or p_class_date > current_date + 14 then raise exception 'INVALID_DATE'; end if;

  if not exists (
    select 1 from public.memberships
    where member_id = v_member and status = 'active' and p_class_date between start_date and end_date
  ) then raise exception 'NO_ACTIVE_MEMBERSHIP'; end if;

  select * into v_sched from public.class_schedules where id = p_schedule_id and status = 'active' for update;
  if not found then raise exception 'CLASS_NOT_FOUND'; end if;
  if extract(isodow from p_class_date)::int - 1 <> v_sched.day_of_week then raise exception 'WRONG_DAY'; end if;

  select count(*) into v_taken from public.class_bookings
  where schedule_id = p_schedule_id and class_date = p_class_date and status = 'booked';
  if v_taken >= v_sched.capacity then raise exception 'CLASS_FULL'; end if;

  insert into public.class_bookings (schedule_id, member_id, class_date)
  values (p_schedule_id, v_member, p_class_date)
  on conflict (schedule_id, member_id, class_date)
    do update set status = 'booked' where public.class_bookings.status = 'cancelled'
  returning * into v_row;

  if v_row.id is null then raise exception 'ALREADY_BOOKED'; end if;
  return v_row;
end $$;

revoke all on function public.book_class(uuid, date) from public, anon;
grant execute on function public.book_class(uuid, date) to authenticated;

-- Public seat counts without exposing who booked
create or replace function public.class_seat_counts(p_from date, p_to date)
returns table (schedule_id uuid, class_date date, booked int)
language sql stable security definer set search_path = public as $$
  select schedule_id, class_date, count(*)::int
  from public.class_bookings
  where status = 'booked' and class_date between p_from and p_to
  group by 1, 2
$$;
grant execute on function public.class_seat_counts(date, date) to anon, authenticated;

-- ─── Admin directory view (RLS of underlying tables applies) ────────
create or replace view public.member_directory with (security_invoker = true) as
select
  m.id,
  m.member_code,
  m.user_id,
  u.full_name,
  u.email,
  u.phone,
  m.gender,
  m.fitness_goal,
  m.assigned_trainer_id,
  m.joined_at,
  m.status,
  ms.status as membership_status,
  ms.end_date as membership_end,
  p.name as plan_name,
  m.created_at,
  m.updated_at,
  m.deleted_at
from public.members m
join public.users u on u.id = m.user_id
left join lateral (
  select * from public.memberships x where x.member_id = m.id order by x.end_date desc limit 1
) ms on true
left join public.membership_plans p on p.id = ms.plan_id;

-- ─── Nightly expiry sweep (call from cron or pg_cron) ───────────────
create or replace function public.expire_memberships()
returns int language sql security definer set search_path = public as $$
  with x as (
    update public.memberships set status = 'expired'
    where status = 'active' and end_date < current_date
    returning 1
  ) select count(*)::int from x
$$;
revoke all on function public.expire_memberships() from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- Storage buckets
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('public-media', 'public-media', true) on conflict do nothing;

create policy "progress photos: owner rw" on storage.objects for all to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress photos: staff read" on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and public.is_staff());

create policy "public media: read" on storage.objects for select using (bucket_id = 'public-media');
create policy "public media: staff write" on storage.objects for all to authenticated
  using (bucket_id = 'public-media' and public.is_staff())
  with check (bucket_id = 'public-media' and public.is_staff());
