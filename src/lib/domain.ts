// Aturan domain murni (tanpa I/O) — dipakai UI dan diuji unit.

export type AppRole = "player" | "parent" | "coach" | "ssb_admin" | "organizer" | "association";

export const roleLabel: Record<AppRole, string> = {
  player: "Pemain",
  parent: "Orang Tua/Wali",
  coach: "Pelatih",
  ssb_admin: "Manajemen SSB",
  organizer: "Penyelenggara",
  association: "Asosiasi",
};

export const enrollmentStatus: Record<
  "pending" | "needs_info" | "approved" | "rejected",
  { label: string; tone: "success" | "warning" | "danger" | "info" }
> = {
  pending: { label: "Menunggu Persetujuan", tone: "warning" },
  needs_info: { label: "Perlu Dilengkapi", tone: "info" },
  approved: { label: "Disetujui", tone: "success" },
  rejected: { label: "Ditolak", tone: "danger" },
};

export const verificationStatus: Record<
  "unverified" | "pending" | "verified" | "rejected",
  { label: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  unverified: { label: "Belum Diverifikasi", tone: "neutral" },
  pending: { label: "Dalam Review", tone: "warning" },
  verified: { label: "Terverifikasi", tone: "success" },
  rejected: { label: "Ditolak", tone: "danger" },
};

/** Usia pada tanggal acuan kompetisi (bukan usia hari ini). */
export function ageOnDate(birth: string | Date, reference: string | Date): number {
  const b = new Date(birth);
  const r = new Date(reference);
  let age = r.getUTCFullYear() - b.getUTCFullYear();
  const m = r.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && r.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

/** Kategori U-N: pemain layak bila usianya < N pada tanggal acuan. */
export function isEligibleForCategory(birth: string, maxAgeExclusive: number, referenceDate: string) {
  return ageOnDate(birth, referenceDate) < maxAgeExclusive;
}

export type MatchState = "scheduled" | "ready" | "live" | "awaiting" | "finalized";
export const matchStateLabel: Record<MatchState, string> = {
  scheduled: "Terjadwal",
  ready: "Siap",
  live: "Berlangsung",
  awaiting: "Menunggu Konfirmasi",
  finalized: "Resmi",
};
const nextState: Partial<Record<MatchState, MatchState>> = {
  scheduled: "ready",
  ready: "live",
  live: "awaiting",
  awaiting: "finalized",
};
export function advanceMatch(state: MatchState): MatchState {
  const n = nextState[state];
  if (!n) throw new Error("Hasil resmi tidak bisa diubah tanpa alur koreksi");
  return n;
}

export interface MatchResult {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  state: MatchState;
}
export interface StandingRow {
  team: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number;
}
/** Klasemen hanya dihitung dari hasil yang sudah resmi. */
export function computeStandings(matches: MatchResult[]): StandingRow[] {
  const t = new Map<string, StandingRow>();
  const row = (n: string) => {
    if (!t.has(n)) t.set(n, { team: n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
    return t.get(n)!;
  };
  for (const m of matches) {
    row(m.home); row(m.away);
    if (m.state !== "finalized") continue;
    const h = row(m.home), a = row(m.away);
    h.p++; a.p++;
    h.gf += m.homeGoals; h.ga += m.awayGoals; a.gf += m.awayGoals; a.ga += m.homeGoals;
    if (m.homeGoals > m.awayGoals) { h.w++; a.l++; h.pts += 3; }
    else if (m.homeGoals < m.awayGoals) { a.w++; h.l++; a.pts += 3; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  }
  return [...t.values()].sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.team.localeCompare(y.team));
}

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
