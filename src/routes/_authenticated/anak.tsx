import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchChildren, fetchSsbs, rpc } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { ageOnDate, enrollmentStatus, fmtDate, verificationStatus } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Crest, Empty, ErrorBox, LoadingList, PageHeader, Panel, StatusBadge } from "@/components/kit";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/anak")({
  head: () => ({ meta: [{ title: "Profil Anak — BOLAID" }, { name: "description", content: "Kelola profil anak dan pendaftaran SSB." }] }),
  component: AnakPage,
});

function AnakPage() {
  const { active } = useApp();
  const q = useQuery({ queryKey: ["children"], queryFn: fetchChildren });
  const [adding, setAdding] = useState(false);
  const [enrollFor, setEnrollFor] = useState<{ id: string; name: string } | null>(null);
  const [responding, setResponding] = useState<{ id: string; name: string; reason: string } | null>(null);
  if (active?.role !== "parent") return <Empty title="Halaman khusus Orang Tua/Wali" />;
  return (
    <>
      <PageHeader title="Anak saya" action={<Button onClick={() => setAdding(true)}><Plus className="size-4" />Tambah</Button>} />
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? (
        <Empty title="Belum ada profil anak" hint="Hanya data yang diperlukan untuk pembinaan sepak bola yang kami minta." action={<Button onClick={() => setAdding(true)}>Buat profil anak</Button>} />
      ) : (
        <div className="space-y-4">
          {q.data.map((g) => {
            const p = g.player_profiles!;
            const team = p.team_memberships.find((m) => m.active)?.teams;
            const reqs = [...p.enrollment_requests].sort((a, b) => b.created_at.localeCompare(a.created_at));
            const canEnroll = !reqs.some((r) => r.status === "pending" || r.status === "needs_info") && !team;
            return (
              <Panel key={p.id}>
                <div className="flex items-center gap-3">
                  <Crest name={p.full_name} className="rounded-full bg-primary text-primary-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{ageOnDate(p.birth_date, new Date())} tahun · {p.position || "Posisi belum diatur"} · {g.relation}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground">Tim saat ini</p>
                  <p className="font-semibold">{team ? `${team.name} · ${team.organizations?.name}` : "Belum tergabung"}</p>
                </div>
                {reqs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Riwayat pendaftaran SSB</p>
                    {reqs.map((r) => (
                      <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.organizations?.name}</p>
                          <p className="text-xs text-muted-foreground">Diajukan {fmtDate(r.created_at)}{r.decided_at ? ` · diputuskan ${fmtDate(r.decided_at)}` : ""}</p>
                          {r.decision_note && r.status !== "approved" && <p className="text-xs text-muted-foreground">Catatan: {r.decision_note}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge tone={enrollmentStatus[r.status].tone}>{enrollmentStatus[r.status].label}</StatusBadge>
                          {r.status === "needs_info" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setResponding({ id: r.id, name: p.full_name, reason: r.decision_note ?? "" })}
                            >
                              Lengkapi
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {canEnroll && <Button className="mt-4 h-11 w-full" variant="outline" onClick={() => setEnrollFor({ id: p.id, name: p.full_name })}>Daftarkan ke SSB</Button>}
              </Panel>
            );
          })}
        </div>
      )}
      <AddChildSheet open={adding} onOpenChange={setAdding} />
      <EnrollSheet target={enrollFor} onClose={() => setEnrollFor(null)} />
      <RespondEnrollmentSheet key={responding?.id ?? "none"} target={responding} onClose={() => setResponding(null)} />
    </>
  );
}

function AddChildSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { refetch } = useApp();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", birth: "", position: "", consentData: false, consentMedia: false });
  const m = useMutation({
    mutationFn: () => rpc("create_child", { _name: f.name, _birth: f.birth, _position: f.position, _consent_data: f.consentData, _consent_media: f.consentMedia }),
    onSuccess: () => {
      toast.success("Profil anak dibuat.");
      qc.invalidateQueries({ queryKey: ["children"] });
      refetch();
      onOpenChange(false);
      setStep(1);
      setF({ name: "", birth: "", position: "", consentData: false, consentMedia: false });
    },
    onError: (e) => toast.error(e.message),
  });
  const step1Ok = f.name.trim().length >= 2 && !!f.birth;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader><SheetTitle>Profil anak · Langkah {step} dari 2</SheetTitle></SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="flex gap-1.5">{[1, 2].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
          {step === 1 ? (
            <>
              <div className="space-y-1.5"><Label htmlFor="cn">Nama lengkap anak</Label><Input id="cn" className="h-12" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="cb">Tanggal lahir</Label><Input id="cb" type="date" className="h-12" value={f.birth} onChange={(e) => setF({ ...f, birth: e.target.value })} /><p className="text-xs text-muted-foreground">Dipakai untuk kelayakan kategori umur.</p></div>
              <div className="space-y-1.5"><Label htmlFor="cp">Posisi favorit (opsional)</Label><Input id="cp" className="h-12" placeholder="mis. Gelandang" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} /></div>
              {!step1Ok && <p className="text-xs text-muted-foreground">Isi nama dan tanggal lahir untuk lanjut.</p>}
              <Button className="h-12 w-full" disabled={!step1Ok} onClick={() => setStep(2)}>Lanjut</Button>
            </>
          ) : (
            <>
              <label className="flex gap-3 rounded-lg border p-3 text-sm">
                <Checkbox checked={f.consentData} onCheckedChange={(v) => setF({ ...f, consentData: v === true })} />
                <span><b>Wajib:</b> Saya wali sah anak ini dan menyetujui pengolahan data pembinaan sepak bola sesuai kebijakan privasi.</span>
              </label>
              <label className="flex gap-3 rounded-lg border p-3 text-sm">
                <Checkbox checked={f.consentMedia} onCheckedChange={(v) => setF({ ...f, consentMedia: v === true })} />
                <span>Opsional: izinkan SSB memakai foto/video anak untuk dokumentasi internal. Bisa dicabut kapan saja.</span>
              </label>
              {!f.consentData && <p className="text-xs text-warning">Persetujuan wajib diperlukan untuk menyimpan profil.</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(1)}>Kembali</Button>
                <Button className="h-12 flex-1" disabled={!f.consentData || m.isPending} onClick={() => m.mutate()}>Simpan profil</Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EnrollSheet({ target, onClose }: { target: { id: string; name: string } | null; onClose: () => void }) {
  const qc = useQueryClient();
  const ssbs = useQuery({ queryKey: ["ssbs"], queryFn: fetchSsbs, enabled: !!target });
  const [org, setOrg] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const m = useMutation({
    mutationFn: () => rpc("request_enrollment", { _player: target!.id, _org: org, _note: note }),
    onSuccess: () => { toast.success("Pendaftaran dikirim. Menunggu persetujuan SSB."); qc.invalidateQueries({ queryKey: ["children"] }); setOrg(null); setNote(""); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Sheet open={!!target} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader><SheetTitle>Daftarkan {target?.name}</SheetTitle></SheetHeader>
        <div className="space-y-3 px-4 pb-6">
          {ssbs.isLoading ? <LoadingList rows={2} /> : ssbs.error ? <ErrorBox error={ssbs.error} /> : !ssbs.data?.length ? (
            <Empty title="Belum ada SSB yang tersedia" hint="Coba lagi nanti atau hubungi pengelola." />
          ) : ssbs.data.map((s) => (
              <button key={s.id} onClick={() => setOrg(s.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${org === s.id ? "border-primary bg-accent" : "bg-card"}`}>
                <Crest name={s.name} />
                <div className="flex-1"><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.city}</p></div>
                <StatusBadge tone={verificationStatus[s.verification].tone}>{verificationStatus[s.verification].label}</StatusBadge>
              </button>
            ))}
          <div className="space-y-1.5"><Label htmlFor="en">Catatan untuk SSB (opsional)</Label><Textarea id="en" value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. Bisa latihan sore hari" /></div>
          <p className="text-xs text-muted-foreground">SSB hanya melihat nama, tanggal lahir, dan posisi anak.</p>
          <Button className="h-12 w-full" disabled={!org || m.isPending} onClick={() => m.mutate()}>Kirim pendaftaran</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RespondEnrollmentSheet({
  target,
  onClose,
}: {
  target: { id: string; name: string; reason: string } | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const m = useMutation({
    mutationFn: () => rpc("respond_enrollment", { _req: target!.id, _note: note }),
    onSuccess: () => {
      toast.success("Informasi tambahan dikirim ke SSB.");
      qc.invalidateQueries({ queryKey: ["children"] });
      setNote("");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Sheet open={!!target} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader><SheetTitle>Lengkapi pendaftaran {target?.name}</SheetTitle></SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          {target?.reason && <Panel className="text-sm"><p className="font-semibold">Permintaan dari SSB</p><p className="mt-1">{target.reason}</p></Panel>}
          <div className="space-y-1.5">
            <Label htmlFor="en-response">Informasi tambahan</Label>
            <Textarea id="en-response" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
            <p className="text-xs text-muted-foreground">Jawaban Anda akan ditambahkan ke catatan pendaftaran dan ditinjau kembali oleh SSB.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 flex-1" onClick={onClose}>Batal</Button>
            <Button className="h-12 flex-1" disabled={note.trim().length < 2 || m.isPending} onClick={() => m.mutate()}>
              Kirim jawaban
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
