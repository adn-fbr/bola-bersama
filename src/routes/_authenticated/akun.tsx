import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchDemoOrgs, rpc } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { roleLabel, type AppRole } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Crest, PageHeader, Panel, Section, StatusBadge } from "@/components/kit";
import { History, LifeBuoy, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({ meta: [{ title: "Akun — BOLAID" }, { name: "description", content: "Akun, peran, dan privasi." }] }),
  component: Page,
});

const roleFor: Record<"ssb" | "organizer" | "association", AppRole> = { ssb: "ssb_admin", organizer: "organizer", association: "association" };

function Page() {
  const { user, contexts, active, setActive, refetch } = useApp();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const demo = useQuery({ queryKey: ["demoOrgs"], queryFn: fetchDemoOrgs });
  const claim = useMutation({
    mutationFn: (o: { id: string; kind: "ssb" | "organizer" | "association" }) => rpc("dev_claim_demo_role", { _org: o.id, _role: roleFor[o.kind] }),
    onSuccess: () => { toast.success("Peran demo ditambahkan. Ganti peran di bagian atas."); refetch(); qc.invalidateQueries(); },
    onError: (e) => toast.error(e.message),
  });
  const parent = useMutation({
    mutationFn: () => rpc("claim_parent_role"),
    onSuccess: () => { toast.success("Peran Orang Tua/Wali aktif."); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const hasParent = contexts.some((c) => c.role === "parent");
  return (
    <>
      <PageHeader title="Akun" subtitle={user.email} />
      <Section title="Peran & organisasi saya">
        <Panel className="p-0">
          {contexts.length === 0 && <p className="p-4 text-sm text-muted-foreground">Belum ada peran.</p>}
          {contexts.map((c) => (
            <button key={c.key} onClick={() => { setActive(c.key); navigate({ to: "/beranda" }); }} className="flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{roleLabel[c.role]}</p>
                <p className="truncate text-xs text-muted-foreground">{c.orgName ?? c.playerName ?? "Pribadi"}{c.role === "player" ? " · pratinjau wali" : ""}</p>
              </div>
              {active?.key === c.key && <StatusBadge tone="success">Aktif</StatusBadge>}
            </button>
          ))}
        </Panel>
        {!hasParent && <Button variant="outline" className="mt-2 h-11 w-full" onClick={() => parent.mutate()}>Tambah peran Orang Tua/Wali</Button>}
      </Section>

      <Section title="Organisasi demo (pengembangan)">
        <p className="mb-2 text-xs text-muted-foreground">Hanya akun uji yang diizinkan server dapat mencoba peran organisasi fiktif. Di produksi, peran diberikan lewat undangan dan verifikasi.</p>
        <div className="space-y-2">
          {demo.data?.map((o) => {
            const has = contexts.some((c) => c.orgId === o.id && c.role === roleFor[o.kind]);
            return (
              <Panel key={o.id} className="flex items-center gap-3 p-3">
                <Crest name={o.name} />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{o.name}</p><p className="text-xs text-muted-foreground">{roleLabel[roleFor[o.kind]]} · {o.city}</p></div>
                {has ? <StatusBadge tone="success">Dimiliki</StatusBadge> : <Button size="sm" variant="outline" disabled={claim.isPending} onClick={() => claim.mutate(o)}>Coba</Button>}
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section title="Lainnya">
        <Panel className="p-0">
          <Link to="/audit" className="flex items-center gap-3 border-b px-4 py-3"><History className="size-4" />Riwayat aktivitas</Link>
          <div className="flex items-start gap-3 border-b px-4 py-3"><ShieldCheck className="mt-0.5 size-4" /><div><p>Privasi & persetujuan</p><p className="text-xs text-muted-foreground">Persetujuan wali tercatat saat profil anak dibuat. Pencabutan persetujuan diproses lewat SSB (alur mandiri menyusul).</p></div></div>
          <div className="flex items-start gap-3 px-4 py-3"><LifeBuoy className="mt-0.5 size-4" /><div><p>Bantuan</p><p className="text-xs text-muted-foreground">Hubungi pengurus SSB Anda untuk pertanyaan jadwal dan pendaftaran.</p></div></div>
        </Panel>
      </Section>
      <Button variant="outline" className="h-12 w-full" onClick={signOut}><LogOut className="size-4" />Keluar</Button>
    </>
  );
}
