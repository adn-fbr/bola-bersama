import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOrgs, rpc } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { verificationStatus } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Crest, Empty, ErrorBox, LoadingList, PageHeader, Panel, Section, StatusBadge } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/verifikasi")({
  head: () => ({ meta: [{ title: "Verifikasi Organisasi — BOLAID" }, { name: "description", content: "Antrean verifikasi SSB." }] }),
  component: Page,
});

function Page() {
  const { active } = useApp();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orgs"], queryFn: fetchOrgs });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: (a: { org: string; status: string }) => rpc("decide_verification", { _org: a.org, _status: a.status, _note: notes[a.org] ?? "" }),
    onSuccess: () => { toast.success("Keputusan dicatat di audit log."); qc.invalidateQueries({ queryKey: ["orgs"] }); },
    onError: (e) => toast.error(e.message),
  });
  if (active?.role !== "association") return <Empty title="Halaman khusus Asosiasi" />;
  const pending = q.data?.filter((o) => o.verification === "pending") ?? [];
  const others = q.data?.filter((o) => o.kind === "ssb" && o.verification !== "pending") ?? [];
  return (
    <>
      <PageHeader title="Verifikasi organisasi" />
      <Section title={`Antrean (${pending.length})`}>
        {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !pending.length ? <Empty title="Antrean kosong" /> : (
          <div className="space-y-3">
            {pending.map((o) => (
              <Panel key={o.id}>
                <div className="flex items-center gap-3"><Crest name={o.name} /><div className="flex-1"><p className="font-semibold">{o.name}</p><p className="text-xs text-muted-foreground">{o.city}</p></div></div>
                <Textarea className="mt-3" placeholder="Alasan (wajib bila menolak)" value={notes[o.id] ?? ""} onChange={(e) => setNotes({ ...notes, [o.id]: e.target.value })} />
                <div className="mt-3 flex gap-2">
                  <Button className="h-11 flex-1" disabled={m.isPending} onClick={() => m.mutate({ org: o.id, status: "verified" })}>Setujui</Button>
                  <Button variant="outline" className="h-11 flex-1" disabled={m.isPending || !notes[o.id]?.trim()} onClick={() => m.mutate({ org: o.id, status: "rejected" })}>Tolak</Button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </Section>
      <Section title="Direktori SSB">
        <Panel className="p-0">
          {others.map((o) => (
            <div key={o.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
              <span className="flex-1 truncate font-medium">{o.name}</span>
              <StatusBadge tone={verificationStatus[o.verification].tone}>{verificationStatus[o.verification].label}</StatusBadge>
            </div>
          ))}
        </Panel>
      </Section>
    </>
  );
}
