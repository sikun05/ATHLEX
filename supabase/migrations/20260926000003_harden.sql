-- Advisor fixes: internal helpers aren't public API; trigger fns aren't callable RPCs.
alter function public.set_updated_at() set search_path = public;

revoke execute on function public.current_user_role(), public.is_admin(), public.is_staff(), public.is_trainer(),
  public.current_member_id(), public.current_trainer_id(), public.trainer_owns_member(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
