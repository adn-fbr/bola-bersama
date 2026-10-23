import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOrgRequests, fetchOrgTeams, rpc } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { ageOnDate, enrollmentStatus, fmtDate } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Empty, ErrorBox, LoadingList, PageHeader, Panel, StatusBadge } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/pendaftaran")({
  head: () => ({ meta: [{ title: "Review Pendaftaran — BOLAID" }, { name: "description", content: "Review permintaan pendaftaran pemain." }] }),
  component: Page,
});

type Req = Awaited<ReturnType<typeof fetchOrgRequests>>[number];

function Page() {
  const { active } = useApp();
  const [tab, setTab] = useState("open");
  const [sel, setSel] = useState<Req | null>(null);
  const orgId = active?.role === "ssb_admin" ? active.orgId! : null;
  const q = useQuery({ queryKey: ["orgRequests", orgId], queryFn: () => fetchOrgRequests(orgId!), enabled: !!orgId });
  if (!orgId) return <Empty title="Halaman khusus Manajemen SSB" />;
  const list = (q.data ?? []).filter((r) => (tab === "open" ? r.status === "pending" || r.status === "needs_info" : r.status === "approved" || r.status === "rejected"));
  return (
    <>
      <PageHeader title="Pendaftaran pemain" subtitle={active!.orgName ?? ""} />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="w-full"><TabsTrigger value="open" className="flex-1">Perlu keputusan</TabsTrigger><TabsTrigger value="done" className="flex-1">Riwayat</TabsTrigger></TabsList>
      </Tabs>
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !list.length ? (
        <Empty title={tab === "open" ? "Tidak ada pendaftaran baru" : "Belum ada riwayat"} />
      ) : (
        <div className="space-y-2.5">
          {list.map((r) => (
            <button key={r.id} className="block w-full text-left" onClick={() => tab === "open" && setSel(r)}>
              <Panel className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.player_profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.player_profiles && ageOnDate(r.player_profiles.birth_date, new Date())} tahun · {r.player_profiles?.position || "–"} · {fmtDate(r.created_at)}</p>
                </div>
                <StatusBadge tone={enrollmentStatus[r.status].tone}>{enrollmentStatus[r.status].label}</StatusBadge>
              </Panel>
            </button>
          ))}
        </div>
      )}
      <Decide req={sel} orgId={orgId} onClose={() => setSel(null)} />
    </>
  );
}

function Decide({ req, orgId, onClose }: { req: Req | null; orgId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const teams = useQuery({ queryKey: ["orgTeams", orgId], queryFn: () => fetchOrgTeams(orgId), enabled: !!req });
  const [team, setTeam] = useState<string>("");
  const [note, setNote] = useState("");
  const m = useMutation({
    mutationFn: (decision: "approved" | "rejected" | "needs_info") => rpc("decide_enrollment", { _req: req!.id, _decision: decision, _team: decision === "approved" ? team : null, _note: note }),
    onSuccess: (_d, decision) => {
      toast.success(decision === "approved" ? "Disetujui. Pemain masuk tim." : "Keputusan disimpan dan wali diberi tahu.");
      qc.invalidateQueries({ queryKey: ["orgRequests"] });
      qc.invalidateQueries({ queryKey: ["orgTeams"] });
      setTeam(""); setNote(""); onClose();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Sheet open={!!req} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader><SheetTitle>{req?.player_profiles?.full_name}</SheetTitle></SheetHeader>
        {req && (
          <div className="space-y-4 px-4 pb-6">
            <Panel className="text-sm">
              <p>Tanggal lahir: <b>{fmtDate(req.player_profiles!.birth_date)}</b></p>
              <p>Posisi: <b>{req.player_profiles!.position || "–"}</b></p>
              {req.note && <p className="mt-2 text-muted-foreground">Catatan wali: “{req.note}”</p>}
              <p className="mt-2 text-xs text-muted-foreground">Kontak dan dokumen wali tidak ditampilkan di sini.</p>
            </Panel>
            {teams.isLoading ? <LoadingList rows={1} /> : teams.error ? <ErrorBox error={teams.error} /> : (
              <div className="space-y-1.5">
                <Label>Tempatkan di tim</Label>
                <Select value={team} onValueChange={setTeam}>
                  <SelectTrigger className="h-12"><SelectValue placeholder={teams.data?.length ? "Pilih tim" : "Buat tim dulu di menu Tim"} /></SelectTrigger>
                  <SelectContent>{teams.data?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.age_group})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5"><Label htmlFor="dn">Catatan / alasan</Label><Textarea id="dn" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Wajib bila menolak atau meminta kelengkapan" /></div>
            <Button className="h-12 w-full" disabled={!team || teams.isLoading || !!teams.error || m.isPending} onClick={() => m.mutate("approved")}>Setujui & masukkan ke tim</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="h-12 flex-1" disabled={!note.trim() || m.isPending} onClick={() => m.mutate("needs_info")}>Minta kelengkapan</Button>
              <Button variant="destructive" className="h-12 flex-1" disabled={!note.trim() || m.isPending} onClick={() => { if (confirm("Tolak pendaftaran ini? Keputusan tidak bisa dibatalkan.")) m.mutate("rejected"); }}>Tolak</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
