import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import {
  fetchChildren, fetchCoachTeams, fetchOrgRequests, fetchOrgTeams, fetchOrgs, fetchTrainings, rpc,
} from "@/lib/api";
import {
  ageOnDate, computeStandings, enrollmentStatus, fmtDate, fmtDateTime, verificationStatus,
} from "@/lib/domain";
import { demoApplications, demoCompetitions, demoMatches } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import {
  Crest, DevDataNotice, Empty, ErrorBox, LoadingList, PageHeader, Panel, Section, Stat, StatusBadge,
} from "./kit";
import { CalendarDays, ChevronRight, MapPin, Plus, Star } from "lucide-react";

export function TrainingCard({ t }: { t: { id: string; title: string; starts_at: string; location: string; teams: { name: string } | null } }) {
  const d = new Date(t.starts_at);
  return (
    <Panel className="flex items-center gap-3 p-3">
      <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-accent py-1.5 text-accent-foreground">
        <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString("id-ID", { month: "short" })}</span>
        <span className="font-display text-lg font-bold leading-none">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{t.title}</p>
        <p className="truncate text-xs text-muted-foreground">{t.teams?.name} · {fmtDateTime(t.starts_at)}</p>
        {t.location && <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3" />{t.location}</p>}
      </div>
    </Panel>
  );
}

function Upcoming({ teamIds }: { teamIds?: string[] | undefined }) {
  const q = useQuery({ queryKey: ["trainings"], queryFn: fetchTrainings });
  if (q.isLoading) return <LoadingList rows={2} />;
  if (q.error) return <ErrorBox error={q.error} />;
  const list = (q.data ?? []).filter((t) => !teamIds || teamIds.includes(t.team_id)).slice(0, 3);
  if (!list.length) return <Empty title="Belum ada jadwal" hint="Jadwal latihan dari pelatih akan muncul di sini." />;
  return <div className="space-y-2">{list.map((t) => <TrainingCard key={t.id} t={t} />)}</div>;
}

export function OnboardingHome() {
  const { refetch, user } = useApp();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => rpc("claim_parent_role"),
    onSuccess: () => { toast.success("Peran Orang Tua/Wali aktif."); refetch(); qc.invalidateQueries(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Selamat datang!" subtitle="Pilih bagaimana Anda terlibat di sepak bola usia dini." />
      <div className="space-y-3">
        <Panel>
          <p className="font-semibold">Saya Orang Tua/Wali</p>
          <p className="mt-1 text-sm text-muted-foreground">Buat profil anak dan daftarkan ke SSB.</p>
          <Button className="mt-3 h-11 w-full" onClick={() => m.mutate()} disabled={m.isPending}>Lanjut sebagai Orang Tua/Wali</Button>
        </Panel>
        <Panel>
          <p className="font-semibold">Saya Pelatih</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Minta pengurus SSB menugaskan Anda memakai email <b className="break-all">{user.email}</b>. Tim akan muncul otomatis.
          </p>
        </Panel>
        <Panel>
          <p className="font-semibold">Pengurus SSB, Penyelenggara, atau Asosiasi</p>
          <p className="mt-1 text-sm text-muted-foreground">Selama pengembangan, Anda bisa mencoba peran ini lewat organisasi demo.</p>
          <Button asChild variant="outline" className="mt-3 h-11 w-full"><Link to="/akun">Buka organisasi demo</Link></Button>
        </Panel>
      </div>
    </>
  );
}

export function ParentHome() {
  const { user } = useApp();
  const q = useQuery({ queryKey: ["children"], queryFn: fetchChildren });
  const name = (user.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0] ?? "";
  return (
    <>
      <PageHeader title={`Halo${name ? `, ${name}` : ""}`} subtitle="Ringkasan anak dan jadwal terdekat." />
      <Section title="Anak saya" action={<Button asChild size="sm" variant="ghost"><Link to="/anak"><Plus className="size-4" />Tambah</Link></Button>}>
        {q.isLoading ? <LoadingList rows={1} /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? (
          <Empty title="Belum ada profil anak" hint="Buat profil anak untuk mendaftar ke SSB." action={<Button asChild><Link to="/anak">Buat profil anak</Link></Button>} />
        ) : (
          <div className="space-y-2.5">
            {q.data.map((g) => {
              const p = g.player_profiles!;
              const team = p.team_memberships.find((m) => m.active)?.teams;
              const lastReq = [...p.enrollment_requests].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
              const st = team ? enrollmentStatus.approved : lastReq ? enrollmentStatus[lastReq.status] : null;
              return (
                <Link key={p.id} to="/anak" className="block">
                  <Panel className="flex items-center gap-3">
                    <Crest name={p.full_name} className="rounded-full bg-primary text-primary-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{team ? `${team.name} · ${team.organizations?.name}` : "Belum tergabung di tim"}</p>
                      {st && <div className="mt-1.5"><StatusBadge tone={st.tone}>{st.label}</StatusBadge></div>}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Panel>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
      <Section title="Jadwal terdekat" action={<Link to="/jadwal" className="text-sm font-semibold text-primary">Semua</Link>}>
        <Upcoming />
      </Section>
    </>
  );
}

export function PlayerHome() {
  const { active } = useApp();
  const q = useQuery({ queryKey: ["children"], queryFn: fetchChildren });
  const p = q.data?.find((g) => g.player_profiles?.id === active?.playerId)?.player_profiles;
  const team = p?.team_memberships.find((m) => m.active)?.teams;
  return (
    <>
      <div className="mb-3 rounded-lg bg-info-soft px-3 py-2 text-xs text-navy">Pratinjau tampilan pemain oleh wali. Akun pemain mandiri menyusul.</div>
      {q.isLoading ? <LoadingList rows={2} /> : !p ? <Empty title="Profil tidak ditemukan" /> : (
        <>
          <div className="pitch-lines mb-5 rounded-2xl p-5 text-navy-foreground">
            <p className="text-xs uppercase tracking-widest text-lime">Ayo, juara!</p>
            <h1 className="mt-1 text-3xl font-extrabold">{p.full_name}</h1>
            <p className="mt-1 text-sm opacity-80">{p.position || "Posisi belum diatur"} · {ageOnDate(p.birth_date, new Date())} tahun</p>
            <p className="mt-3 text-sm font-semibold">{team ? `${team.name} · ${team.organizations?.name}` : "Belum tergabung di tim"}</p>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-2">
            <Stat label="Latihan" value="—" hint="Fase 2" />
            <Stat label="Main" value="—" hint="Fase 3" />
            <Stat label="Lencana" value={<Star className="size-6 text-lime" />} />
          </div>
          <Section title="Latihan berikutnya"><Upcoming teamIds={team ? [team.id] : []} /></Section>
        </>
      )}
    </>
  );
}

export function CoachHome() {
  const { user } = useApp();
  const q = useQuery({ queryKey: ["coachTeams", user.id], queryFn: () => fetchCoachTeams(user.id) });
  return (
    <>
      <PageHeader title="Ruang Pelatih" subtitle="Tim yang ditugaskan kepada Anda." />
      <Section title="Tim saya">
        {q.isLoading ? <LoadingList rows={2} /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? (
          <Empty title="Belum ada tim" hint="Pengurus SSB perlu menugaskan Anda ke tim." />
        ) : (
          <div className="space-y-2.5">
            {q.data.map((a) => a.teams && (
              <Link key={a.id} to="/tim" className="block">
                <Panel className="flex items-center gap-3">
                  <Crest name={a.teams.name} />
                  <div className="flex-1"><p className="font-semibold">{a.teams.name}</p><p className="text-xs text-muted-foreground">{a.teams.organizations?.name}</p></div>
                  <StatusBadge tone="info">{a.teams.age_group}</StatusBadge>
                </Panel>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <Section title="Aksi cepat">
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-14"><Link to="/tim"><CalendarDays className="size-4" />Buat sesi latihan</Link></Button>
          <Button variant="outline" className="h-14" onClick={() => toast.info("Pencatatan kehadiran hadir di Fase 2.")}>Catat kehadiran</Button>
        </div>
      </Section>
      <Section title="Jadwal terdekat"><Upcoming /></Section>
    </>
  );
}

export function SsbHome() {
  const { active } = useApp();
  const orgId = active!.orgId!;
  const qc = useQueryClient();
  const req = useQuery({ queryKey: ["orgRequests", orgId], queryFn: () => fetchOrgRequests(orgId) });
  const teams = useQuery({ queryKey: ["orgTeams", orgId], queryFn: () => fetchOrgTeams(orgId) });
  const orgs = useQuery({ queryKey: ["orgs"], queryFn: fetchOrgs });
  const org = orgs.data?.find((o) => o.id === orgId);
  const pending = req.data?.filter((r) => r.status === "pending" || r.status === "needs_info").length ?? 0;
  const players = teams.data?.reduce((n, t) => n + t.team_memberships.filter((m) => m.active).length, 0) ?? 0;
  const submit = useMutation({
    mutationFn: () => rpc("submit_verification", { _org: orgId }),
    onSuccess: () => { toast.success("Permohonan verifikasi dikirim ke asosiasi."); qc.invalidateQueries({ queryKey: ["orgs"] }); },
    onError: (e) => toast.error(e.message),
  });
  const v = org ? verificationStatus[org.verification] : null;
  return (
    <>
      <PageHeader title={active!.orgName ?? "SSB"} subtitle={org?.city} action={v && <StatusBadge tone={v.tone}>{v.label}</StatusBadge>} />
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="Menunggu review" value={pending} />
        <Stat label="Tim" value={teams.data?.length ?? "–"} />
        <Stat label="Pemain aktif" value={players} />
      </div>
      {pending > 0 && (
        <Link to="/pendaftaran" className="mb-6 block">
          <Panel className="flex items-center justify-between border-warning/40 bg-warning-soft">
            <span className="text-sm font-semibold text-warning">{pending} pendaftaran menunggu keputusan Anda</span>
            <ChevronRight className="size-4 text-warning" />
          </Panel>
        </Link>
      )}
      {org && (org.verification === "unverified" || org.verification === "rejected") && (
        <Section title="Verifikasi organisasi">
          <Panel>
            <p className="text-sm text-muted-foreground">Ajukan verifikasi ke asosiasi agar SSB dapat mengikuti kompetisi resmi.</p>
            <Button className="mt-3 h-11 w-full" onClick={() => submit.mutate()} disabled={submit.isPending}>Ajukan verifikasi</Button>
          </Panel>
        </Section>
      )}
      <Section title="Jadwal latihan"><Upcoming teamIds={teams.data?.map((t) => t.id)} /></Section>
    </>
  );
}

export function OrganizerHome() {
  const standings = computeStandings(demoMatches);
  return (
    <>
      <PageHeader title="Dashboard Kompetisi" subtitle="Liga Bocah Nusantara" />
      <DevDataNotice>kompetisi, pendaftaran tim, dan pertandingan masih fiktif (Fase 3).</DevDataNotice>
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="Kompetisi" value={demoCompetitions.length} />
        <Stat label="Aplikasi" value={demoApplications.length} />
        <Stat label="Laga resmi" value={demoMatches.filter((m) => m.state === "finalized").length} />
      </div>
      <Section title="Pemimpin klasemen" action={<Link to="/pertandingan" className="text-sm font-semibold text-primary">Pertandingan</Link>}>
        <Panel className="p-0">
          {standings.slice(0, 3).map((s, i) => (
            <div key={s.team} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
              <span className="w-4 font-display font-bold text-muted-foreground">{i + 1}</span>
              <span className="flex-1 truncate text-sm font-medium">{s.team}</span>
              <span className="font-display font-bold">{s.pts}</span>
            </div>
          ))}
        </Panel>
      </Section>
    </>
  );
}

export function AssociationHome() {
  const orgs = useQuery({ queryKey: ["orgs"], queryFn: fetchOrgs });
  const pending = orgs.data?.filter((o) => o.verification === "pending").length ?? 0;
  const ssb = orgs.data?.filter((o) => o.kind === "ssb").length ?? 0;
  return (
    <>
      <PageHeader title="Dashboard Asosiasi" subtitle="Organisasi dan kompetisi dalam lingkup Anda." />
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="SSB" value={ssb} />
        <Stat label="Antrean verifikasi" value={pending} />
        <Stat label="Kompetisi" value={demoCompetitions.length} hint="demo" />
      </div>
      <Section title="Perlu ditinjau">
        <Link to="/verifikasi" className="block">
          <Panel className="flex items-center justify-between"><span className="text-sm font-semibold">{pending} permohonan verifikasi</span><ChevronRight className="size-4" /></Panel>
        </Link>
      </Section>
      <p className="text-xs text-muted-foreground">Asosiasi tidak otomatis mendapat akses ke data pribadi anak.</p>
    </>
  );
}
