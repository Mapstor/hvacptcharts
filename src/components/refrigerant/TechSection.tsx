import {
  Activity,
  AlertTriangle,
  Atom,
  BookOpen,
  Calculator,
  Database,
  Droplets,
  FlaskConical,
  Gauge,
  Globe2,
  Leaf,
  Lightbulb,
  Recycle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  Thermometer,
  TrendingUp,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/* ──────────────────────── icon / tone maps ──────────────────────── */

const ICON_MAP: Record<string, LucideIcon> = {
  chart: Activity,
  trending: TrendingUp,
  thermometer: Thermometer,
  composition: FlaskConical,
  atom: Atom,
  lubricant: Droplets,
  warning: AlertTriangle,
  insight: Lightbulb,
  service: Wrench,
  climate: Leaf,
  globe: Globe2,
  shield: ShieldCheck,
  recycle: Recycle,
  table: TableIcon,
  data: Database,
  gauge: Gauge,
  calculator: Calculator,
  book: BookOpen,
  sparkles: Sparkles,
  source: ScrollText,
  glide: Waves,
};

type Tone = "blue" | "amber" | "emerald" | "purple" | "sky" | "red" | "zinc";

const TONE_BORDER: Record<Tone, string> = {
  blue: "border-blue-200 dark:border-blue-900/40",
  amber: "border-amber-200 dark:border-amber-900/40",
  emerald: "border-emerald-200 dark:border-emerald-900/40",
  purple: "border-purple-200 dark:border-purple-900/40",
  sky: "border-sky-200 dark:border-sky-900/40",
  red: "border-red-200 dark:border-red-900/40",
  zinc: "border-zinc-200 dark:border-zinc-800",
};

const TONE_BG: Record<Tone, string> = {
  blue: "bg-blue-50/40 dark:bg-blue-950/20",
  amber: "bg-amber-50/40 dark:bg-amber-950/20",
  emerald: "bg-emerald-50/40 dark:bg-emerald-950/20",
  purple: "bg-purple-50/40 dark:bg-purple-950/20",
  sky: "bg-sky-50/40 dark:bg-sky-950/20",
  red: "bg-red-50/40 dark:bg-red-950/20",
  zinc: "bg-white dark:bg-zinc-950",
};

const TONE_ICON: Record<Tone, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

/* ──────────────────────── TechSection ──────────────────────── */

export interface TechSectionProps {
  icon?: string;
  tone?: Tone;
  title: string;
  children: React.ReactNode;
}

/**
 * Wrap MDX prose in a styled card so the page never has unstructured walls
 * of text. Icon + colored badge + title bar + prose body.
 */
export function TechSection({ icon = "insight", tone = "blue", title, children }: TechSectionProps) {
  const Icon = ICON_MAP[icon] ?? Lightbulb;
  return (
    <section className={`my-6 overflow-hidden rounded-xl border ${TONE_BORDER[tone]} ${TONE_BG[tone]}`}>
      <header className="flex items-center gap-2.5 border-b border-current/10 px-5 py-3">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${TONE_ICON[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </header>
      <div className="prose prose-sm prose-zinc max-w-none px-5 py-4 dark:prose-invert prose-p:my-2.5 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-table:my-3">
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────── KeyInsight (compact callout) ──────────────────────── */

export interface KeyInsightProps {
  tone?: Tone;
  icon?: string;
  title?: string;
  children: React.ReactNode;
}

export function KeyInsight({ tone = "amber", icon = "insight", title, children }: KeyInsightProps) {
  const Icon = ICON_MAP[icon] ?? Lightbulb;
  return (
    <div
      className={`my-4 rounded-lg border p-4 ${TONE_BORDER[tone]} ${TONE_BG[tone]}`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${TONE_ICON[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          {title ? (
            <div className="text-sm font-semibold">{title}</div>
          ) : null}
          <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-1.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── NumberFact (single sourced number with context) ──────────────────────── */

export interface NumberFactProps {
  value: string | number;
  unit?: string;
  label: string;
  context: string;
  tone?: Tone;
  sourceId?: string;
}

export function NumberFact({ value, unit, label, context, tone = "blue", sourceId }: NumberFactProps) {
  return (
    <div className={`my-3 flex items-start gap-4 rounded-lg border p-4 ${TONE_BORDER[tone]} ${TONE_BG[tone]}`}>
      <div className="shrink-0 text-center">
        <div className="font-mono text-2xl font-bold leading-none">{value}</div>
        {unit ? <div className="mt-1 text-[10px] text-zinc-500">{unit}</div> : null}
      </div>
      <div className="min-w-0 flex-1 border-l border-current/10 pl-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {label}
          {sourceId ? (
            <a href={`#src-${sourceId}`} className="ml-1.5 text-[10px] text-blue-600 hover:underline dark:text-blue-400">
              [src]
            </a>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{context}</p>
      </div>
    </div>
  );
}
