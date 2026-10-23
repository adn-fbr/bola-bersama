drop policy if exists "teams readable" on public.teams;
create policy "teams visible to assigned participants" on public.teams
for select to authenticated using (
  public.has_org_role(auth.uid(), organization_id, 'ssb_admin')
  or public.is_team_coach(auth.uid(), id)
  or exists (
    select 1
    from public.team_memberships m
    where m.team_id = teams.id
      and m.active
      and public.is_guardian(auth.uid(), m.player_id)
  )
);

create or replace function public.dev_claim_demo_role(_org uuid, _role public.app_role)
returns void language plpgsql security definer set search_path = public as $$
declare k org_kind;
begin
  if auth.uid() is null then raise exception 'Belum masuk'; end if;
  if coalesce(auth.jwt()->'app_metadata'->>'allow_demo_role_claims', 'false') <> 'true' then
    raise exception 'Akun ini tidak diizinkan mengklaim peran demo';
  end if;
  select kind into k from organizations where id=_org and is_demo;
  if k is null then raise exception 'Hanya organisasi demo yang bisa diklaim'; end if;
  if not ((k='ssb' and _role='ssb_admin') or (k='organizer' and _role='organizer') or (k='association' and _role='association')) then
    raise exception 'Peran tidak cocok dengan jenis organisasi'; end if;
  insert into user_roles(user_id, role, organization_id) values (auth.uid(), _role, _org) on conflict do nothing;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id)
    values (auth.uid(), _org, 'dev_claim_role', 'organization', _org);
end $$;

create or replace function public.respond_enrollment(_req uuid, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare r enrollment_requests;
begin
  select * into r from enrollment_requests where id=_req for update;
  if r.id is null then raise exception 'Permintaan tidak ditemukan'; end if;
  if not is_guardian(auth.uid(), r.player_id) then raise exception 'Anda bukan wali pemain ini'; end if;
  if r.status <> 'needs_info' then raise exception 'Permintaan tidak menunggu kelengkapan'; end if;
  if length(trim(coalesce(_note, ''))) < 2 then raise exception 'Jawaban kelengkapan wajib diisi'; end if;
  if length(trim(_note)) > 2000 then raise exception 'Jawaban terlalu panjang'; end if;

  update enrollment_requests
    set note = concat_ws(E'\n', nullif(trim(note), ''), trim(_note)),
        status = 'pending',
        decision_note = null,
        decided_by = null,
        decided_at = null
    where id=_req;
  insert into notifications(user_id, title, body)
    select user_id, 'Kelengkapan pendaftaran diterima', 'Wali mengirim informasi tambahan untuk ditinjau.'
    from user_roles where organization_id=r.organization_id and role='ssb_admin';
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id, details)
    values (auth.uid(), r.organization_id, 'respond_enrollment', 'enrollment_request', _req,
      jsonb_build_object('response', trim(_note)));
end $$;

revoke execute on function public.respond_enrollment(uuid, text) from anon, public;
grant execute on function public.respond_enrollment(uuid, text) to authenticated;
