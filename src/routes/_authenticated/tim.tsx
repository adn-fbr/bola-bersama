import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchCoachTeams, fetchOrgTeams, fetchProfiles, fetchRoster, rpc } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { ageOnDate, fmtDate } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Crest, Empty, ErrorBox, LoadingList, PageHeader, Panel, Section, StatusBadge } from "@/components/kit";
import { Plus, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tim")({
  head: () => ({ meta: [{ title: "Tim — BOLAID" }, { name: "description", content: "Kelola tim, pelatih, dan roster." }] }),
  component: Page,
});

function Page() {
  const { active } = useApp();
  if (active?.role === "ssb_admin") return <SsbTeams orgId={active.orgId!} />;
  if (active?.role === "coach") return <CoachTeams />;
  return <Empty title="Halaman khusus Pelatih dan Manajemen SSB" />;
}

function SsbTeams({ orgId }: { orgId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orgTeams", orgId], queryFn: () => fetchOrgTeams(orgId) });
  const coachIds = [...new Set(q.data?.flatMap((t) => t.coach_assignments.filter((c) => c.active).map((c) => c.coach_id)) ?? [])];
  const coaches = useQuery({ queryKey: ["profiles", coachIds], queryFn: () => fetchProfiles(coachIds), enabled: coachIds.length > 0 });
  const [newOpen, setNewOpen] = useState(false);
  const [assignTo, setAssignTo] = useState<{ id: string; name: string } | null>(null);
  const [f, setF] = useState({ name: "", age: "U-10" });
  const [email, setEmail] = useState("");
  const inv = () => qc.invalidateQueries({ queryKey: ["orgTeams"] });
  const create = useMutation({
    mutationFn: () => rpc("create_team", { _org: orgId, _name: f.name, _age: f.age }),
    onSuccess: () => { toast.success("Tim dibuat."); inv(); setNewOpen(false); setF({ name: "", age: "U-10" }); },
    onError: (e) => toast.error(e.message),
  });
  const assign = useMutation({
    mutationFn: () => rpc("assign_coach", { _team: assignTo!.id, _email: email }),
    onSuccess: () => { toast.success("Pelatih ditugaskan."); inv(); setAssignTo(null); setEmail(""); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Tim & pelatih" action={<Button onClick={() => setNewOpen(true)}><Plus className="size-4" />Tim</Button>} />
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? <Empty title="Belum ada tim" /> : (
        <div className="space-y-3">
          {q.data.map((t) => {
            const active = t.coach_assignments.filter((c) => c.active);
            return (
              <Panel key={t.id}>
                <div className="flex items-center gap-3">
                  <Crest name={t.name} />
                  <div className="flex-1"><p className="font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.team_memberships.filter((m) => m.active).length} pemain aktif</p></div>
                  <StatusBadge tone="info">{t.age_group}</StatusBadge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-xs font-semibold text-muted-foreground">Pelatih:</span>
                  {active.length ? active.map((c) => <StatusBadge key={c.id} tone="success">{coaches.data?.find((p) => p.id === c.coach_id)?.full_name || "Pelatih"}</StatusBadge>) : <StatusBadge tone="warning">Belum ada</StatusBadge>}
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setAssignTo({ id: t.id, name: t.name })}><UserPlus className="size-4" />Tugaskan</Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>Tim baru</SheetTitle></SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="space-y-1.5"><Label htmlFor="tn">Nama tim</Label><Input id="tn" className="h-12" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="mis. Garuda Muda U-8" /></div>
            <div className="space-y-1.5"><Label>Kelompok umur</Label>
              <div className="flex flex-wrap gap-2">{["U-8", "U-10", "U-12", "U-14", "U-16"].map((a) => <Button key={a} type="button" variant={f.age === a ? "default" : "outline"} onClick={() => setF({ ...f, age: a })}>{a}</Button>)}</div>
            </div>
            <Button className="h-12 w-full" disabled={f.name.trim().length < 2 || create.isPending} onClick={() => create.mutate()}>Buat tim</Button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={!!assignTo} onOpenChange={(v) => !v && setAssignTo(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>Tugaskan pelatih · {assignTo?.name}</SheetTitle></SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="space-y-1.5"><Label htmlFor="ce">Email akun pelatih</Label><Input id="ce" type="email" className="h-12" value={email} onChange={(e) => setEmail(e.target.value)} /><p className="text-xs text-muted-foreground">Pelatih harus sudah punya akun BOLAID. Ia hanya akan melihat pemain di tim ini.</p></div>
            <Button className="h-12 w-full" disabled={!email.includes("@") || assign.isPending} onClick={() => assign.mutate()}>Tugaskan</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function CoachTeams() {
  const { user } = useApp();
  const q = useQuery({ queryKey: ["coachTeams", user.id], queryFn: () => fetchCoachTeams(user.id) });
  const [teamId, setTeamId] = useState<string | null>(null);
  const teams = q.data?.map((a) => a.teams!).filter(Boolean) ?? [];
  const current = teams.find((t) => t.id === teamId) ?? teams[0];
  return (
    <>
      <PageHeader title="Tim saya" />
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !current ? <Empty title="Belum ada tim yang ditugaskan" /> : (
        <>
          {teams.length > 1 && (
            <div className="mb-4 flex gap-2 overflow-x-auto">{teams.map((t) => <Button key={t.id} size="sm" variant={t.id === current.id ? "default" : "outline"} onClick={() => setTeamId(t.id)}>{t.name}</Button>)}</div>
          )}
          <TrainingForm teamId={current.id} />
          <Roster teamId={current.id} />
        </>
      )}
    </>
  );
}

function Roster({ teamId }: { teamId: string }) {
  const q = useQuery({ queryKey: ["roster", teamId], queryFn: () => fetchRoster(teamId) });
  return (
    <Section title={`Pemain tim (${q.data?.length ?? 0})`}>
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? <Empty title="Belum ada pemain" hint="Pemain muncul setelah pendaftaran disetujui SSB." /> : (
        <Panel className="p-0">
          {q.data.map((m) => m.player_profiles && (
            <div key={m.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
              <Crest name={m.player_profiles.full_name} className="size-9 rounded-full bg-primary text-xs text-primary-foreground" />
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{m.player_profiles.full_name}</p><p className="text-xs text-muted-foreground">{ageOnDate(m.player_profiles.birth_date, new Date())} th · {m.player_profiles.position || "–"} · sejak {fmtDate(m.started_at)}</p></div>
            </div>
          ))}
        </Panel>
      )}
    </Section>
  );
}

function TrainingForm({ teamId }: { teamId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", when: "", location: "" });
  const m = useMutation({
    mutationFn: () => rpc("create_training", { _team: teamId, _title: f.title, _starts: new Date(f.when).toISOString(), _location: f.location }),
    onSuccess: () => { toast.success("Sesi latihan dibuat. Wali diberi tahu."); qc.invalidateQueries({ queryKey: ["trainings"] }); setOpen(false); setF({ title: "", when: "", location: "" }); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <Button className="mb-6 h-12 w-full" onClick={() => setOpen(true)}><Plus className="size-4" />Buat sesi latihan</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>Sesi latihan baru</SheetTitle></SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="space-y-1.5"><Label htmlFor="tt">Judul</Label><Input id="tt" className="h-12" placeholder="mis. Passing & kontrol bola" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="tw">Waktu</Label><Input id="tw" type="datetime-local" className="h-12" value={f.when} onChange={(e) => setF({ ...f, when: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="tl">Lokasi</Label><Input id="tl" className="h-12" placeholder="mis. Lapangan Sidolig" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
            <Button className="h-12 w-full" disabled={f.title.trim().length < 2 || !f.when || m.isPending} onClick={() => m.mutate()}>Simpan</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
