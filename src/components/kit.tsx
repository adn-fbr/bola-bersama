// Komponen bersama BOLAID: badge status, kartu, header, empty state, dsb.
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Inbox } from "lucide-react";

const badge = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", {
  variants: {
    tone: {
      success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning",
      danger: "bg-danger-soft text-destructive",
      info: "bg-info-soft text-navy",
      neutral: "bg-muted text-muted-foreground",
      live: "bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});
export function StatusBadge({ tone, children }: VariantProps<typeof badge> & { children: ReactNode }) {
  return <span className={badge({ tone })}>{children}</span>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string | undefined; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-base font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>{children}</div>;
}

export function Crest({ name, className }: { name: string; className?: string }) {
  const initials = name.replace(/^SSB\s+/i, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy font-display text-sm font-bold text-lime", className)}>
      {initials}
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-card px-6 py-10 text-center">
      <Inbox className="mb-3 size-8 text-muted-foreground" />
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi."}</span>
    </div>
  );
}

/** Label wajib untuk fitur yang masih memakai data pengembangan. */
export function DevDataNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
      Data pengembangan (fiktif) — {children ?? "fitur ini belum tersambung ke database."}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Panel className="p-3.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Panel>
  );
}
