import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/* ──────────────────────── Verdict colour / icon maps ──────────────────────── */

export type Verdict = "ok" | "warn" | "bad" | "info";

const VERDICT_BORDER: Record<Verdict, string> = {
  ok: "border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30",
  warn: "border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/30",
  bad: "border-l-red-500 bg-red-50/60 dark:bg-red-950/30",
  info: "border-l-sky-500 bg-sky-50/60 dark:bg-sky-950/30",
};

const VERDICT_TEXT: Record<Verdict, string> = {
  ok: "text-emerald-700 dark:text-emerald-300",
  warn: "text-amber-700 dark:text-amber-300",
  bad: "text-red-700 dark:text-red-300",
  info: "text-sky-700 dark:text-sky-300",
};

const VERDICT_ICON: Record<Verdict, LucideIcon> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  bad: AlertCircle,
  info: Info,
};

const VERDICT_LABEL: Record<Verdict, string> = {
  ok: "OK",
  warn: "Investigate",
  bad: "Action required",
  info: "Result",
};

/* ──────────────────────── ServiceProblem (top-level card) ──────────────────────── */

export interface ServiceProblemProps {
  number: number;
  title: string;
  refrigerant: string;
  scenario: React.ReactNode;
  children: React.ReactNode;
}

export function ServiceProblem({ number, title, refrigerant, scenario, children }: ServiceProblemProps) {
  return (
    <section className="my-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <header className="flex items-start gap-3 border-b border-zinc-200 bg-zinc-50/70 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-sm font-bold text-white tabular-nums dark:bg-zinc-100 dark:text-zinc-900">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Service problem</span>
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {refrigerant}
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-semibold leading-tight">{title}</h3>
        </div>
      </header>
      <div className="space-y-3 px-5 py-4 text-sm text-zinc-700 dark:text-zinc-300">
        <p className="leading-relaxed">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scenario · </span>
          {scenario}
        </p>
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────── Panel (labeled sub-block inside a problem) ──────────────────────── */

export interface PanelProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function Panel({ title, icon: Icon, children }: PanelProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="flex items-center gap-1.5 border-b border-zinc-200/70 px-3 py-1.5 dark:border-zinc-800/70">
        <Icon className="h-3 w-3 text-zinc-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {title}
        </span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}

/* ──────────────────────── Gauges (coloured chips for measurements) ──────────────────────── */

export interface GaugeItem {
  label: string;
  value: string;
  side?: "low" | "high";
}

export function Gauges({ items }: { items: GaugeItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((g, i) => {
        const tone =
          g.side === "high"
            ? "border-red-200 bg-red-50/60 dark:border-red-900/30 dark:bg-red-950/20"
            : g.side === "low"
              ? "border-blue-200 bg-blue-50/60 dark:border-blue-900/30 dark:bg-blue-950/20"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40";
        return (
          <div key={i} className={`rounded-md border px-2.5 py-1.5 ${tone}`}>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">{g.label}</div>
            <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
              {g.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────── Lookups (INPUT → OUTPUT chart-lookup rows) ──────────────────────── */

export interface LookupRow {
  input: string;
  output: string;
  note?: string;
}

export function Lookups({ rows }: { rows: LookupRow[] }) {
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded bg-zinc-200/70 px-2 py-0.5 font-mono tabular-nums dark:bg-zinc-800/60">
            {r.input}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-zinc-400" />
          <span className="rounded bg-zinc-200/70 px-2 py-0.5 font-mono font-semibold tabular-nums dark:bg-zinc-800/60">
            {r.output}
          </span>
          {r.note ? <span className="text-xs text-zinc-500 dark:text-zinc-400">{r.note}</span> : null}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────── Derived (calculation rows colour-coded by verdict) ──────────────────────── */

export interface DerivedRow {
  formula: string;
  verdict: Verdict;
  note?: string;
}

export function Derived({ rows }: { rows: DerivedRow[] }) {
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => {
        const Icon = VERDICT_ICON[r.verdict];
        return (
          <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${VERDICT_TEXT[r.verdict]}`} />
            <span className="font-mono tabular-nums">{r.formula}</span>
            {r.note ? <span className={`text-xs ${VERDICT_TEXT[r.verdict]}`}>{r.note}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────── ComparisonTable (refrigerant-vs-refrigerant table) ──────────────────────── */

export interface ComparisonRow {
  label: string;
  cells: string[];
  tone?: "baseline" | "delta";
}

export function ComparisonTable({ headers, rows }: { headers: string[]; rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
            {headers.map((h, i) => (
              <th key={i} className={`py-1.5 ${i === 0 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
              <td className="py-1.5 font-medium">{r.label}</td>
              {r.cells.map((c, j) => (
                <td
                  key={j}
                  className={`py-1.5 text-right font-mono tabular-nums ${
                    j === r.cells.length - 1 && r.tone === "delta"
                      ? "font-semibold text-amber-700 dark:text-amber-300"
                      : ""
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────── VerdictBanner ──────────────────────── */

export interface VerdictBannerProps {
  status: Verdict;
  title: string;
  children: React.ReactNode;
}

export function VerdictBanner({ status, title, children }: VerdictBannerProps) {
  const Icon = VERDICT_ICON[status];
  return (
    <div className={`rounded-md border border-l-4 p-3 ${VERDICT_BORDER[status]} border-zinc-200 dark:border-zinc-800`}>
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${VERDICT_TEXT[status]}`} />
        <div className="min-w-0 flex-1">
          <div className={`text-[10px] font-bold uppercase tracking-wider ${VERDICT_TEXT[status]}`}>
            {VERDICT_LABEL[status]} · {title}
          </div>
          <div className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── FixCallout ──────────────────────── */

export function FixCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex items-start gap-2">
        <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Fix</div>
          <div className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
        </div>
      </div>
    </div>
  );
}
