create or replace function public.has_org_role(_uid uuid, _org uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from user_roles
    where user_id = auth.uid() and organization_id = _org and role = _role
  )
$$;

create or replace function public.is_guardian(_uid uuid, _player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from guardian_relationships
    where guardian_id = auth.uid() and player_id = _player
  )
$$;

create or replace function public.is_team_coach(_uid uuid, _team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from coach_assignments
    where coach_id = auth.uid() and team_id = _team and active
  )
$$;

create or replace function public.is_team_admin(_uid uuid, _team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1
    from teams t
    join user_roles r on r.organization_id = t.organization_id
    where t.id = _team and r.user_id = auth.uid() and r.role = 'ssb_admin'
  )
$$;

create or replace function public.can_view_player(_uid uuid, _player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_guardian(auth.uid(), _player)
  or exists(
    select 1
    from team_memberships m
    where m.player_id = _player and m.active
      and (is_team_coach(auth.uid(), m.team_id) or is_team_admin(auth.uid(), m.team_id))
  )
  or exists(
    select 1
    from enrollment_requests e
    where e.player_id = _player
      and e.status in ('pending', 'needs_info')
      and has_org_role(auth.uid(), e.organization_id, 'ssb_admin')
  )
$$;

create or replace function public.is_association_official(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from user_roles
    where user_id = auth.uid() and role = 'association'
  )
$$;

alter function public.has_org_role(uuid, uuid, public.app_role) set search_path = public, pg_temp;
alter function public.is_guardian(uuid, uuid) set search_path = public, pg_temp;
alter function public.is_team_coach(uuid, uuid) set search_path = public, pg_temp;
alter function public.is_team_admin(uuid, uuid) set search_path = public, pg_temp;
alter function public.can_view_player(uuid, uuid) set search_path = public, pg_temp;
alter function public.is_association_official(uuid) set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.claim_parent_role() set search_path = public, pg_temp;
alter function public.dev_claim_demo_role(uuid, public.app_role) set search_path = public, pg_temp;
alter function public.create_child(text, date, text, boolean, boolean) set search_path = public, pg_temp;
alter function public.request_enrollment(uuid, uuid, text) set search_path = public, pg_temp;
alter function public.decide_enrollment(uuid, public.enrollment_status, uuid, text) set search_path = public, pg_temp;
alter function public.create_team(uuid, text, text) set search_path = public, pg_temp;
alter function public.assign_coach(uuid, text) set search_path = public, pg_temp;
alter function public.create_training(uuid, text, timestamptz, text) set search_path = public, pg_temp;
alter function public.submit_verification(uuid) set search_path = public, pg_temp;
alter function public.decide_verification(uuid, public.verification_status, text) set search_path = public, pg_temp;
alter function public.respond_enrollment(uuid, text) set search_path = public, pg_temp;

create unique index if not exists enrollment_one_active_request
  on public.enrollment_requests (player_id, organization_id)
  where status in ('pending', 'needs_info', 'approved');

create unique index if not exists team_memberships_one_active_player
  on public.team_memberships (team_id, player_id)
  where active;

create or replace function public.decide_enrollment(_req uuid, _decision public.enrollment_status, _team uuid, _note text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare r enrollment_requests; pname text;
begin
  select * into r from enrollment_requests where id=_req for update;
  if r.id is null then raise exception 'Permintaan tidak ditemukan'; end if;
  if not has_org_role(auth.uid(), r.organization_id, 'ssb_admin') then raise exception 'Tidak berwenang'; end if;
  if r.status <> 'pending' then raise exception 'Hanya permintaan menunggu yang dapat diputuskan'; end if;
  if is_guardian(auth.uid(), r.player_id) then raise exception 'Wali pemain tidak dapat memutuskan pendaftarannya'; end if;
  if _decision not in ('approved', 'rejected', 'needs_info') then raise exception 'Keputusan tidak valid'; end if;
  if _decision = 'approved' then
    if _team is null or not exists(select 1 from teams where id=_team and organization_id=r.organization_id) then
      raise exception 'Pilih tim dari SSB ini';
    end if;
    insert into team_memberships(team_id, player_id) values (_team, r.player_id);
  elsif coalesce(trim(_note), '') = '' then
    raise exception 'Alasan wajib diisi';
  end if;
  update enrollment_requests
    set status=_decision,
        team_id=case when _decision='approved' then _team else null end,
        decided_by=auth.uid(),
        decision_note=_note,
        decided_at=now()
    where id=_req;
  select full_name into pname from player_profiles where id=r.player_id;
  insert into notifications(user_id, title, body)
    select guardian_id, 'Status pendaftaran ' || pname,
      case _decision
        when 'approved' then 'Disetujui dan sudah masuk tim.'
        when 'rejected' then 'Ditolak: ' || _note
        else 'Perlu dilengkapi: ' || _note
      end
    from guardian_relationships where player_id=r.player_id;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id, details)
    values (auth.uid(), r.organization_id, 'decide_enrollment', 'enrollment_request', _req,
      jsonb_build_object('decision', _decision, 'team', _team, 'note', _note));
end $$;

revoke all on function public.has_org_role(uuid, uuid, public.app_role) from public, anon;
revoke all on function public.is_guardian(uuid, uuid) from public, anon;
revoke all on function public.is_team_coach(uuid, uuid) from public, anon;
revoke all on function public.is_team_admin(uuid, uuid) from public, anon;
revoke all on function public.can_view_player(uuid, uuid) from public, anon;
revoke all on function public.is_association_official(uuid) from public, anon;
grant execute on function public.has_org_role(uuid, uuid, public.app_role) to authenticated;
grant execute on function public.is_guardian(uuid, uuid) to authenticated;
grant execute on function public.is_team_coach(uuid, uuid) to authenticated;
grant execute on function public.is_team_admin(uuid, uuid) to authenticated;
grant execute on function public.can_view_player(uuid, uuid) to authenticated;
grant execute on function public.is_association_official(uuid) to authenticated;

drop policy if exists "memberships" on public.team_memberships;
create policy "memberships" on public.team_memberships for select to authenticated using (
  public.is_guardian(auth.uid(), player_id)
  or (active and public.is_team_coach(auth.uid(), team_id))
  or public.is_team_admin(auth.uid(), team_id)
);

revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;
drop policy if exists "own notif update" on public.notifications;
create policy "own notif update" on public.notifications for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.dev_claim_demo_role(_org uuid, _role public.app_role)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare k org_kind;
begin
  if auth.uid() is null then raise exception 'Belum masuk'; end if;
  if coalesce(auth.jwt()->'app_metadata'->>'allow_demo_role_claims', 'false') <> 'true' then
    raise exception 'Akun ini tidak diizinkan mengklaim peran demo';
  end if;
  select kind into k from organizations where id = _org and is_demo;
  if k is null then raise exception 'Hanya organisasi demo yang bisa diklaim'; end if;
  if not (
    (k = 'ssb' and _role = 'ssb_admin')
    or (k = 'organizer' and _role = 'organizer')
    or (k = 'association' and _role = 'association')
  ) then
    raise exception 'Peran tidak cocok dengan jenis organisasi';
  end if;
  insert into user_roles(user_id, role, organization_id)
    values (auth.uid(), _role, _org)
    on conflict do nothing;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id)
    values (auth.uid(), _org, 'dev_claim_role', 'organization', _org);
end $$;

revoke execute on function public.dev_claim_demo_role(uuid, public.app_role) from public, anon;
grant execute on function public.dev_claim_demo_role(uuid, public.app_role) to authenticated;
