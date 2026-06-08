import Link from "next/link";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { getRefrigerant, getPressureAtTempF, type Refrigerant } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TypeChip } from "@/components/refrigerant/TypeChip";
import { PTCurveOverlay } from "@/components/svg/PTCurveOverlay";
import {
  ComparisonTable as DiffComparisonTable,
  Derived,
  FixCallout,
  Gauges,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import type { ComparisonFrontmatter } from "@/lib/mdx-comparison";

const SERIES_COLORS = ["var(--c-bubble)", "var(--c-safe-a3)"];

export interface ComparisonPageProps {
  fm: ComparisonFrontmatter;
  body?: string; // reserved for future MDX-body embedding
}

export function ComparisonPage({ fm }: ComparisonPageProps) {
  const a = getRefrigerant(fm.refrigerantA);
  const b = getRefrigerant(fm.refrigerantB);
  if (!a || !b) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold">Comparison data missing</h1>
        <p className="mt-4">Could not locate {fm.refrigerantA} or {fm.refrigerantB} in the dataset.</p>
      </article>
    );
  }

  const pageUrl = `${SITE_URL}/${fm.slug}/`;
  const schemaGraph = buildSchema(pageUrl, fm, a, b);

  const overlayData = [a, b].map((r, i) => ({
    name: r.displayName,
    points: r.ptChart,
    hasGlide: r.physical.hasSignificantGlide,
    color: SERIES_COLORS[i],
  })).filter((d) => d.points.length > 0);

  return (
    <>
      <JsonLd graph={schemaGraph} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{fm.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{fm.title}</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">{fm.introOneLiner}</p>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <RefrigerantSummary r={a} color={SERIES_COLORS[0]} />
          <RefrigerantSummary r={b} color={SERIES_COLORS[1]} />
        </section>

        {overlayData.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">PT curves, overlaid</h2>
            <PTCurveOverlay
              refrigerants={overlayData}
              ariaLabel={`Saturation pressure-temperature overlay for ${a.displayName} versus ${b.displayName}`}
            />
            <p className="mt-2 text-xs text-zinc-500">
              {a.physical.hasSignificantGlide || b.physical.hasSignificantGlide
                ? "Solid line = bubble, dashed = dew where the refrigerant has significant temperature glide."
                : "Both refrigerants are pure or near-azeotropic — single curve per series."}
            </p>
          </section>
        ) : null}

        {/* ──────────────────────── Enhanced sections (data-driven) ──────────────────────── */}

        <TechSection icon="data" tone="blue" title="Pressure comparison at service temperatures">
          <p>
            Side-by-side pressure values at common service temperatures, computed from
            CoolProp 7.2.0. Useful for retrofit feasibility — pressure deltas within ±20%
            typically allow drop-in compatible service equipment; larger deltas require
            component pressure-rating review.
          </p>
          <Panel title="Saturation pressure (PSIG) at common service temperatures" icon={TableIcon}>
            <PressureCompareTable a={a} b={b} />
          </Panel>
          <PressureDeltaBars a={a} b={b} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pressure delta visualization: positive = {b.displayName} runs higher than{" "}
            {a.displayName}; negative = lower. Service equipment pressure rating matters when
            delta exceeds ±20% on the discharge side. For {a.displayName} (zeotropic blend)
            bubble pressure is shown; for {b.displayName} same rule applies.
          </p>
        </TechSection>

        <TechSection icon="composition" tone="purple" title="Property differences side by side">
          <PropertyDeltaPanel a={a} b={b} />
        </TechSection>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Properties side by side</h2>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-zinc-500">Property</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">{a.displayName}</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">{b.displayName}</th>
                </tr>
              </thead>
              <tbody>
                <PropRow label="Type" valueA={a.type.replace("-", " ")} valueB={b.type.replace("-", " ")} />
                <PropRow label="ASHRAE class" valueA={a.safetyClass} valueB={b.safetyClass} />
                <PropRow
                  label="Composition"
                  valueA={a.composition.length === 0 ? "Pure" : a.composition.map((c) => `${(c.massFraction * 100).toFixed(1)}% ${c.component}`).join(" / ")}
                  valueB={b.composition.length === 0 ? "Pure" : b.composition.map((c) => `${(c.massFraction * 100).toFixed(1)}% ${c.component}`).join(" / ")}
                />
                <PropRow label="GWP (AR5)" valueA={String(a.environmental.gwp100Ar5 ?? "—")} valueB={String(b.environmental.gwp100Ar5 ?? "—")} />
                <PropRow label="ODP" valueA={String(a.environmental.odp ?? "—")} valueB={String(b.environmental.odp ?? "—")} />
                <PropRow label="Lubricant" valueA={a.lubricants.compatible.join(", ")} valueB={b.lubricants.compatible.join(", ")} />
                <PropRow
                  label="Boiling point @ 1 atm"
                  valueA={a.physical.boilingPointC !== null ? `${a.physical.boilingPointC.toFixed(1)}°C` : "—"}
                  valueB={b.physical.boilingPointC !== null ? `${b.physical.boilingPointC.toFixed(1)}°C` : "—"}
                />
                <PropRow
                  label="Critical point"
                  valueA={a.physical.critical.tempC !== null ? `${a.physical.critical.tempC.toFixed(1)}°C / ${a.physical.critical.pressurePsig?.toFixed(0)} PSIG` : "Blend (locus, not point)"}
                  valueB={b.physical.critical.tempC !== null ? `${b.physical.critical.tempC.toFixed(1)}°C / ${b.physical.critical.pressurePsig?.toFixed(0)} PSIG` : "Blend (locus, not point)"}
                />
                <PropRow
                  label="Temp glide"
                  valueA={`${a.physical.temperatureGlideF.toFixed(2)}°F`}
                  valueB={`${b.physical.temperatureGlideF.toFixed(2)}°F`}
                />
                <PropRow
                  label="AIM Act affected"
                  valueA={a.regulatoryStatus.aimActAffected ? "Yes" : "No"}
                  valueB={b.regulatoryStatus.aimActAffected ? "Yes" : "No"}
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Choose {a.displayName} if…</h2>
            <p className="mt-2 text-sm">{fm.chooseA}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Choose {b.displayName} if…</h2>
            <p className="mt-2 text-sm">{fm.chooseB}</p>
          </div>
        </section>

        {fm.whenNeither ? (
          <section className="mb-10 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">When neither is ideal</h2>
            <p className="mt-2 text-sm">{fm.whenNeither}</p>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Retrofit and transition</h2>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {fm.retrofitNotes.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
          </div>
        </section>

        <TechSection icon="climate" tone="amber" title="Regulatory and transition context">
          <RegulatoryContext a={a} b={b} />
        </TechSection>

        <TechSection icon="service" tone="amber" title={`Standard transition procedure — ${a.displayName} → ${b.displayName}`}>
          <TransitionProcedure a={a} b={b} />
        </TechSection>

        <TechSection icon="climate" tone="emerald" title={`Lifecycle and operational context`}>
          <LifecycleContext a={a} b={b} />
        </TechSection>

        <TechSection icon="service" tone="amber" title={`Service implications — ${a.displayName} → ${b.displayName}`}>
          <p>
            What a service technician needs to know when transitioning from {a.displayName}
            to {b.displayName} (or comparing them for new equipment specification). Two
            real-world scenarios show how the difference plays out in practice.
          </p>
        </TechSection>

        {generateComparisonScenarios(a, b).map((scenario, i) => (
          <ServiceProblem
            key={i}
            number={i + 1}
            refrigerant={`${a.displayName} ↔ ${b.displayName}`}
            title={scenario.title}
            scenario={scenario.scenario}
          >
            <Panel title="Comparison" icon={TableIcon}>
              <DiffComparisonTable headers={scenario.headers} rows={scenario.rows} />
            </Panel>
            <VerdictBanner status={scenario.verdict.status} title={scenario.verdict.title}>
              {scenario.verdict.body}
            </VerdictBanner>
            {scenario.fix ? <FixCallout>{scenario.fix}</FixCallout> : null}
          </ServiceProblem>
        ))}

        <TechSection icon="book" tone="emerald" title="When to use which tool for this comparison">
          <ul className="text-sm space-y-1">
            <li>
              <Link href={`/refrigerant/${a.slug}/`} className="underline">{a.displayName} full reference</Link>{" "}
              — properties, PT chart, lubricant, retrofit options for {a.displayName}.
            </li>
            <li>
              <Link href={`/refrigerant/${b.slug}/`} className="underline">{b.displayName} full reference</Link>{" "}
              — properties, PT chart, lubricant, retrofit options for {b.displayName}.
            </li>
            <li>
              <Link href="/refrigerant-pt-comparison-tool/" className="underline">PT Comparison Tool</Link>{" "}
              — overlay any 2-4 refrigerants&apos; PT curves interactively.
            </li>
            <li>
              <Link href="/refrigerant-retrofit-compatibility-calculator/" className="underline">Retrofit Compatibility Calculator</Link>{" "}
              — five-criterion compatibility analysis with verdict.
            </li>
            <li>
              <Link href="/refrigerant-comparison-guide/" className="underline">Refrigerant Comparison Guide</Link>{" "}
              — long-form sourced reference for all common HVAC refrigerant comparisons.
            </li>
          </ul>
        </TechSection>

        {fm.faqs && fm.faqs.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Frequently asked</h2>
            <div className="space-y-4">
              {fm.faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                  <summary className="cursor-pointer list-none font-semibold">
                    <span className="mr-2 text-zinc-400 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                    {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-10 grid gap-3 sm:grid-cols-2">
          <Link href={`/refrigerant/${a.slug}/`} className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">{a.displayName} full reference</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">PT chart, properties, retrofit guidance.</p>
          </Link>
          <Link href={`/refrigerant/${b.slug}/`} className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">{b.displayName} full reference</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">PT chart, properties, retrofit guidance.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources &amp; provenance</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Saturation pressures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999)</li>
            <li>Safety classifications per ANSI/ASHRAE Standard 34-2022</li>
            <li>GWP values per IPCC AR5 (2013) Working Group I, Table 8.A.1</li>
            <li>Regulatory context: EPA AIM Act (40 CFR Part 84), EU F-Gas Regulation 517/2014 + 2024/573, Kigali Amendment to Montreal Protocol</li>
            <li>{a.displayName}: {a.dataSource.ptChartSource}</li>
            <li>{b.displayName}: {b.dataSource.ptChartSource}</li>
            <li>Records generated {a.dataSource.ptChartGeneratedAt.slice(0, 10)}</li>
          </ul>
        </footer>
      </article>
    </>
  );
}

function RefrigerantSummary({ r, color }: { r: Refrigerant; color: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
        <Link href={`/refrigerant/${r.slug}/`} className="text-lg font-semibold text-blue-700 hover:underline dark:text-blue-300">
          {r.displayName}
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <TypeChip type={r.type} />
        <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-1 text-xs">
        <dt className="text-zinc-500">GWP (AR5)</dt>
        <dd className="font-mono">{r.environmental.gwp100Ar5 ?? "—"}</dd>
        <dt className="text-zinc-500">Lubricant</dt>
        <dd className="font-mono">{r.lubricants.compatible.join(", ")}</dd>
        <dt className="text-zinc-500">Glide @ 0°C</dt>
        <dd className="font-mono">{r.physical.temperatureGlideF.toFixed(1)}°F</dd>
      </dl>
    </div>
  );
}

function PropRow({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) {
  const differ = valueA !== valueB;
  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-2 text-xs uppercase tracking-wide text-zinc-500">{label}</td>
      <td className={`px-3 py-2 text-right ${differ ? "font-semibold" : ""}`}>{valueA}</td>
      <td className={`px-3 py-2 text-right ${differ ? "font-semibold" : ""}`}>{valueB}</td>
    </tr>
  );
}

/* ──────────────────────── Data-driven helpers ──────────────────────── */

function PressureCompareTable({ a, b }: { a: Refrigerant; b: Refrigerant }) {
  const temps = [-20, 0, 40, 70, 95, 120];
  const rows = temps.flatMap((t) => {
    const pa = getPressureAtTempF(a.slug, t);
    const pb = getPressureAtTempF(b.slug, t);
    if (!pa || !pb) return [];
    const delta = ((pb.bubble - pa.bubble) / pa.bubble) * 100;
    return [{
      temp: t,
      aBubble: pa.bubble,
      bBubble: pb.bubble,
      delta,
    }];
  });

  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
            <th className="py-1.5 text-left">Temperature</th>
            <th className="py-1.5 text-right">{a.displayName}</th>
            <th className="py-1.5 text-right">{b.displayName}</th>
            <th className="py-1.5 text-right">Δ vs {a.displayName}</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {rows.map((r) => (
            <tr key={r.temp} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
              <td className="py-1.5 text-left">{r.temp}°F</td>
              <td className="py-1.5 text-right">{r.aBubble.toFixed(0)} PSIG</td>
              <td className="py-1.5 text-right">{r.bBubble.toFixed(0)} PSIG</td>
              <td className={`py-1.5 text-right font-semibold ${Math.abs(r.delta) > 20 ? "text-red-700 dark:text-red-300" : Math.abs(r.delta) > 10 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                {r.delta > 0 ? "+" : ""}{r.delta.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PressureDeltaBars({ a, b }: { a: Refrigerant; b: Refrigerant }) {
  const temps = [-20, 0, 40, 70, 95, 120];
  const data = temps.flatMap((t) => {
    const pa = getPressureAtTempF(a.slug, t);
    const pb = getPressureAtTempF(b.slug, t);
    if (!pa || !pb) return [];
    return [{ temp: t, delta: ((pb.bubble - pa.bubble) / pa.bubble) * 100 }];
  });

  if (data.length === 0) return null;

  const maxAbs = Math.max(20, ...data.map((d) => Math.abs(d.delta))) * 1.1;
  const W = 720;
  const ROW_H = 28;
  const PAD_T = 40;
  const PAD_B = 28;
  const LABEL_W = 80;
  const PAD_R = 60;
  const BAR_W = W - LABEL_W - PAD_R;
  const centerX = LABEL_W + BAR_W / 2;
  const xScale = (v: number) => centerX + (v / maxAbs) * (BAR_W / 2);
  const H = PAD_T + data.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Pressure delta visualization: ${b.displayName} relative to ${a.displayName} at common service temperatures.`}
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Pressure delta: {b.displayName} vs {a.displayName} (% deviation)
      </text>
      <line x1={centerX} y1={PAD_T - 4} x2={centerX} y2={PAD_T + data.length * ROW_H} stroke="currentColor" opacity={0.5} strokeWidth={1.5} />
      <text x={centerX} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>0%</text>
      {[-maxAbs, -maxAbs / 2, maxAbs / 2, maxAbs].map((t) => (
        <g key={`tick-${t}`}>
          <line x1={xScale(t)} y1={PAD_T - 4} x2={xScale(t)} y2={PAD_T + data.length * ROW_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t > 0 ? "+" : ""}{t.toFixed(0)}%</text>
        </g>
      ))}
      {data.map((d, i) => {
        const y = PAD_T + i * ROW_H;
        const isPositive = d.delta >= 0;
        const barX = isPositive ? centerX : xScale(d.delta);
        const barW = Math.abs(xScale(d.delta) - centerX);
        const color = Math.abs(d.delta) > 20 ? "#c45757" : Math.abs(d.delta) > 10 ? "#d49a2b" : "#5a8a3a";
        return (
          <g key={d.temp}>
            <text x={LABEL_W - 8} y={y + 16} textAnchor="end" fontSize="11" fontWeight={500} fill="currentColor">
              {d.temp}°F
            </text>
            <rect x={barX} y={y + 6} width={barW} height={14} fill={color} rx={2} />
            <text x={isPositive ? xScale(d.delta) + 6 : xScale(d.delta) - 6} y={y + 16} fontSize="10" fontWeight={600} fill="currentColor" textAnchor={isPositive ? "start" : "end"}>
              {d.delta > 0 ? "+" : ""}{d.delta.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PropertyDeltaPanel({ a, b }: { a: Refrigerant; b: Refrigerant }) {
  const gwpA = a.environmental.gwp100Ar5 ?? 0;
  const gwpB = b.environmental.gwp100Ar5 ?? 0;
  const gwpReduction = gwpA > 0 ? ((gwpB - gwpA) / gwpA) * 100 : 0;

  return (
    <div className="space-y-3">
      <Panel title="Key differences at a glance" icon={TableIcon}>
        <ul className="text-sm space-y-1.5">
          {a.safetyClass !== b.safetyClass ? (
            <li>
              <strong>Safety class change:</strong> {a.displayName} ({a.safetyClass}) →{" "}
              {b.displayName} ({b.safetyClass}).{" "}
              {b.safetyClass.startsWith("A2") && a.safetyClass === "A1"
                ? "A2L equipment requirements apply: sealed motors, charge limits, leak detection per IEC 60335-2-40."
                : a.safetyClass.startsWith("B") || b.safetyClass.startsWith("B")
                  ? "Class B refrigerants require purpose-built equipment, machine-room compliance, specialized handling."
                  : "Same toxicity class, different flammability characteristics."}
            </li>
          ) : null}
          <li>
            <strong>GWP impact:</strong> {a.displayName} = {gwpA.toLocaleString()},{" "}
            {b.displayName} = {gwpB.toLocaleString()} ({gwpReduction > 0 ? "+" : ""}
            {gwpReduction.toFixed(0)}% vs {a.displayName}).{" "}
            {gwpReduction < -50
              ? `Switching reduces direct climate impact substantially.`
              : gwpReduction > 50
                ? `Switching increases direct climate impact.`
                : `GWP delta is modest.`}
          </li>
          <li>
            <strong>Lubricant:</strong> {a.displayName}: {a.lubricants.compatible.join("/")};{" "}
            {b.displayName}: {b.lubricants.compatible.join("/")}.{" "}
            {a.lubricants.compatible.includes("MO") && !b.lubricants.compatible.includes("MO")
              ? `Retrofit requires oil change (mineral oil to POE).`
              : a.lubricants.compatible.includes("POE") && b.lubricants.compatible.includes("POE")
                ? `Same lubricant family — no oil change needed.`
                : `Lubricant systems differ; check compatibility per manufacturer.`}
          </li>
          {Math.abs(a.physical.temperatureGlideF - b.physical.temperatureGlideF) > 5 ? (
            <li>
              <strong>Glide change:</strong> {a.displayName} glide ={" "}
              {Math.abs(a.physical.temperatureGlideF).toFixed(1)}°F; {b.displayName} glide ={" "}
              {Math.abs(b.physical.temperatureGlideF).toFixed(1)}°F. Service measurement
              (superheat / subcooling) needs dew/bubble curve awareness for the
              higher-glide blend.
            </li>
          ) : null}
          {a.regulatoryStatus.aimActAffected !== b.regulatoryStatus.aimActAffected ? (
            <li>
              <strong>AIM Act status:</strong>{" "}
              {a.regulatoryStatus.aimActAffected ? a.displayName : b.displayName} is affected
              by AIM Act phase-down; the other is not. Drives new-equipment specification
              decisions in US market.
            </li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}

function RegulatoryContext({ a, b }: { a: Refrigerant; b: Refrigerant }) {
  const aimAct = a.regulatoryStatus.aimActAffected || b.regulatoryStatus.aimActAffected;
  const gwpAffected = (a.environmental.gwp100Ar5 ?? 0) > 700 || (b.environmental.gwp100Ar5 ?? 0) > 700;

  return (
    <div className="space-y-3">
      <p>
        Both refrigerants sit in an active regulatory transition driven by climate-impact
        rules. The transitions affect availability, pricing, and new-equipment specification.
      </p>
      <ul className="text-sm space-y-1">
        <li>
          <strong>EPA AIM Act (40 CFR Part 84):</strong> US HFC production / import phase-down.
          Cap declines from 90% allocation (2022) to 15% by 2036.{" "}
          {aimAct ? `One or both refrigerants here are AIM Act-affected.` : `Neither refrigerant is directly affected.`}
          {gwpAffected ? ` New residential AC equipment over 700 GWP prohibited as of 2025.` : ""}
        </li>
        <li>
          <strong>EU F-Gas Regulation (517/2014, updated 2024/573):</strong> European
          stationary refrigeration GWP cap typically 150 (much tighter than AIM Act). Drives
          earlier adoption of very-low-GWP options in European markets.
        </li>
        <li>
          <strong>Kigali Amendment to Montreal Protocol (2016):</strong> international HFC
          phase-down framework (198 countries). The AIM Act and EU F-Gas are regional
          implementations. Schedules differ by country group.
        </li>
        <li>
          <strong>ASHRAE 34-2022:</strong> safety classification (A1, A2L, A3, B1, B2L). For
          A2L refrigerants like R-32, R-454B, R-454C, R-455A: equipment must be A2L-certified,
          charge limits per IEC 60335-2-40 apply.
        </li>
      </ul>
    </div>
  );
}

interface ComparisonScenario {
  title: string;
  scenario: string;
  headers: string[];
  rows: { label: string; cells: string[]; tone?: "baseline" | "delta" }[];
  verdict: { status: "ok" | "warn" | "bad" | "info"; title: string; body: string };
  fix?: string;
}

function generateComparisonScenarios(a: Refrigerant, b: Refrigerant): ComparisonScenario[] {
  const scenarios: ComparisonScenario[] = [];

  // Scenario 1: Pressure envelope comparison at residential AC operating points
  const tempsForCompare = [40, 70, 95];
  const compareRows = tempsForCompare.flatMap((t) => {
    const pa = getPressureAtTempF(a.slug, t);
    const pb = getPressureAtTempF(b.slug, t);
    if (!pa || !pb) return [];
    const delta = ((pb.bubble - pa.bubble) / pa.bubble) * 100;
    return [{
      label: `${t}°F`,
      cells: [`${pa.bubble.toFixed(0)} PSIG`, `${pb.bubble.toFixed(0)} PSIG`, `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`],
      tone: "delta" as const,
    }];
  });

  if (compareRows.length > 0) {
    const maxDelta = Math.max(...compareRows.map((r) => Math.abs(parseFloat(r.cells[2]))));
    const verdictStatus: "ok" | "warn" | "bad" | "info" =
      maxDelta <= 10 ? "ok" : maxDelta <= 25 ? "warn" : "bad";
    const verdictTitle =
      maxDelta <= 10
        ? "Pressure envelope match — drop-in compatible"
        : maxDelta <= 25
          ? "Moderate pressure delta — standard retrofit"
          : "Large pressure delta — equipment changes required";
    const verdictBody =
      maxDelta <= 10
        ? `${a.displayName} and ${b.displayName} pressures match within ±10% across service range. Service equipment rated for one handles the other; transition is drop-in pressure-wise (still verify lubricant, safety class, glide).`
        : maxDelta <= 25
          ? `Pressure delta is moderate. Standard retrofit procedure applies (recover, change filter-drier, evacuate, recharge by weight). Service equipment pressure rating margin should be checked but typically adequate.`
          : `Pressure delta exceeds typical retrofit-acceptable margin. Component pressure ratings need engineering review; full equipment replacement is often the right answer rather than retrofit.`;

    scenarios.push({
      title: `Pressure envelope check for ${a.displayName} → ${b.displayName}`,
      scenario: `Field tech needs to know: do ${a.displayName} service tools handle ${b.displayName}, or does the pressure delta require new equipment? PT chart comparison at service temperatures gives the answer.`,
      headers: ["Temp", a.displayName, b.displayName, "Δ"],
      rows: compareRows,
      verdict: { status: verdictStatus, title: verdictTitle, body: verdictBody },
      fix: maxDelta > 25
        ? `Component pressure ratings must be verified for the higher-pressure refrigerant. R-410A-rated service equipment (800 PSI gauges) handles many newer refrigerants, but R-744 (transcritical) requires 3000+ PSI components.`
        : maxDelta > 10
          ? `Standard retrofit procedure with current service equipment. Verify final SH/SC after charging.`
          : `No equipment changes for pressure alone. Verify lubricant compatibility before retrofit (see properties table above).`,
    });
  }

  // Scenario 2: Lubricant + safety class implications
  const sameLubricant = a.lubricants.compatible.some((l) => b.lubricants.compatible.includes(l));
  const safetyChange = a.safetyClass !== b.safetyClass;
  scenarios.push({
    title: `Service-side implications: lubricant and safety`,
    scenario: `Beyond pressure envelope, the switch from ${a.displayName} to ${b.displayName} affects lubricant, safety class, and operating procedure.`,
    headers: ["Concern", a.displayName, b.displayName, "Action"],
    rows: [
      {
        label: "Lubricant",
        cells: [a.lubricants.compatible.join("/") || "—", b.lubricants.compatible.join("/") || "—", sameLubricant ? "No change" : "Oil change required"],
        tone: sameLubricant ? "baseline" : "delta",
      },
      {
        label: "Safety class",
        cells: [a.safetyClass, b.safetyClass, safetyChange ? (b.safetyClass.startsWith("A2") ? "A2L equipment" : b.safetyClass.startsWith("B") ? "B-class procedures" : "Same toxicity, different flammability") : "No change"],
        tone: safetyChange ? "delta" : "baseline",
      },
      {
        label: "Glide",
        cells: [`${Math.abs(a.physical.temperatureGlideF).toFixed(1)}°F`, `${Math.abs(b.physical.temperatureGlideF).toFixed(1)}°F`, Math.abs(a.physical.temperatureGlideF - b.physical.temperatureGlideF) > 5 ? "Curve awareness" : "Minor"],
        tone: Math.abs(a.physical.temperatureGlideF - b.physical.temperatureGlideF) > 5 ? "delta" : "baseline",
      },
    ],
    verdict: {
      status: !sameLubricant || safetyChange ? "warn" : "ok",
      title: !sameLubricant && safetyChange
        ? "Both lubricant change and safety class shift required"
        : !sameLubricant
          ? "Lubricant change required for retrofit"
          : safetyChange
            ? "Safety class shift — equipment must be re-certified"
            : "No major service-side changes",
      body: !sameLubricant && safetyChange
        ? `Full retrofit procedure with oil change + A2L equipment certification. For existing equipment, this is typically not feasible — full equipment replacement is the right answer.`
        : !sameLubricant
          ? `Standard HFC retrofit: drain old oil, flush system, replace with new lubricant family, charge by weight.`
          : safetyChange
            ? `Field retrofit isn't possible — A2L safety classification requires equipment-level certification (sealed motors, charge limits, leak detection). Replace equipment at end-of-life with A2L-certified unit.`
            : `Service procedures essentially the same. Retrofit is mostly a refrigerant swap without equipment changes.`,
    },
  });

  return scenarios;
}

function TransitionProcedure({ a, b }: { a: Refrigerant; b: Refrigerant }) {
  const sameLube = a.lubricants.compatible.some((l) => b.lubricants.compatible.includes(l));
  const safetyChange = a.safetyClass !== b.safetyClass;
  const bIsA2L = b.safetyClass.startsWith("A2");
  const aPress = getPressureAtTempF(a.slug, 95)?.bubble ?? 0;
  const bPress = getPressureAtTempF(b.slug, 95)?.bubble ?? 0;
  const pressDelta = aPress > 0 ? ((bPress - aPress) / aPress) * 100 : 0;
  const glideChange = Math.abs(a.physical.temperatureGlideF - b.physical.temperatureGlideF) > 3;
  const bGlide = Math.abs(b.physical.temperatureGlideF);
  const dropIn = sameLube && !safetyChange && Math.abs(pressDelta) < 15 && !glideChange;

  return (
    <div className="space-y-3">
      <p>
        Step-by-step service procedure for transitioning an existing {a.displayName} system
        to {b.displayName}, derived from the property differences above. Always cross-check
        equipment OEM service literature for the specific equipment being serviced. The
        steps below codify EPA Section 608 requirements (recovery, evacuation,
        documentation) plus refrigerant-specific accommodations for lubricant, safety class,
        pressure envelope, and glide differences. Skipping any of the regulatory steps
        (leak check, recovery, evacuation, documentation) creates compliance liability;
        skipping refrigerant-specific accommodations creates equipment-failure risk.
      </p>
      <Panel title={`Field-service transition procedure (${a.displayName} → ${b.displayName})`} icon={CalcIcon}>
        <ol className="list-decimal pl-5 text-sm space-y-2">
          <li>
            <strong>EPA Section 608 leak-check first.</strong> Verify the existing system
            isn&apos;t leaking before any work. If it&apos;s leaking, find and repair the
            leak — adding refrigerant (existing or new) to a leaking system violates 40 CFR
            Part 82.
          </li>
          <li>
            <strong>Recover {a.displayName}.</strong> Use a recovery machine rated for{" "}
            {a.safetyClass} refrigerants. Recover into properly-labeled cylinders;
            don&apos;t mix recovered {a.displayName} with virgin or recovered{" "}
            {b.displayName} (cross-contamination invalidates reclaim).
          </li>
          {!sameLube ? (
            <li>
              <strong>Drain {a.lubricants.compatible[0] ?? "old"} lubricant and flush.</strong>{" "}
              {a.displayName} runs on {a.lubricants.compatible.join("/") || "—"};{" "}
              {b.displayName} requires {b.lubricants.compatible.join("/") || "—"}. Drain the
              compressor crankcase, accumulator, and any oil traps. Flush the system with a
              compatible flush solvent or run {b.lubricants.compatible[0] ?? "the new"}{" "}
              lubricant through the system and re-drain to clear residual{" "}
              {a.lubricants.compatible[0] ?? "old oil"}. Mixing mineral oil with POE in an
              HFC system produces oil-return failures within hours of operation.
            </li>
          ) : (
            <li>
              <strong>Lubricant compatible — no oil change required.</strong> Both refrigerants
              run on {a.lubricants.compatible[0] ?? "the same"} lubricant family. Keep the
              existing oil charge; just replace the filter-drier and any compromised seals.
            </li>
          )}
          <li>
            <strong>Replace filter-drier.</strong> Install a new drier rated for{" "}
            {b.displayName} ({b.lubricants.compatible[0] ?? "compatible"} lubricant).
            Filter-driers are single-use after exposure to a refrigerant; the old drier may
            have absorbed contaminants you don&apos;t want carrying into the new charge.
          </li>
          <li>
            <strong>Pressure-test and evacuate to ≤500 microns.</strong> Pressure-test with
            dry nitrogen to verify no leaks. Pull deep vacuum and hold ≥30 minutes with
            vacuum pump isolated to confirm no leak-back. This step is non-negotiable —
            non-condensables (air, moisture) trapped in the system raise discharge pressure
            and damage the compressor.
          </li>
          <li>
            <strong>Charge {b.displayName} by weight to nameplate</strong>
            {Math.abs(pressDelta) > 10 ? (
              <>
                {" "}
                — adjusted for the {pressDelta > 0 ? "+" : ""}
                {pressDelta.toFixed(0)}% pressure difference vs {a.displayName}
              </>
            ) : null}
            . Use a calibrated recovery / charging scale. Charging by gauge feel produces
            frequent overcharge errors.
          </li>
          <li>
            <strong>Verify with SH and SC at steady state</strong>
            {bGlide > 3 ? (
              <>
                . {b.displayName} is zeotropic with {bGlide.toFixed(1)}°F glide — use the
                dew curve at suction for SH, bubble curve at discharge for SC. Wrong-curve
                selection introduces error equal to the glide
              </>
            ) : (
              <>
                . {b.displayName} has minimal glide (pure or near-azeotrope), so the
                bubble = dew curve and standard PT chart math applies
              </>
            )}
            . Target SC = 8-12°F for TXV systems; target SH per OEM nameplate.
          </li>
          {bIsA2L && !a.safetyClass.startsWith("A2") ? (
            <li>
              <strong>A2L safety compliance.</strong> {b.displayName} is{" "}
              {b.safetyClass} (mildly flammable). Field retrofit of A1-only equipment to
              A2L generally isn&apos;t possible — equipment must be A2L-certified per UL /
              IEC 60335-2-40 (sealed motors, charge limits per room volume, leak detection
              on larger systems). The realistic path is full equipment replacement, not
              refrigerant swap.
            </li>
          ) : null}
          <li>
            <strong>Document and label.</strong> Update the equipment data plate to reflect
            {" "}
            {b.displayName}. EPA Section 608 requires records of refrigerant added /
            recovered; OEM warranty may require documentation of approved-refrigerant
            substitution.
          </li>
        </ol>
      </Panel>
      {dropIn ? (
        <KeyInsight tone="emerald" icon="insight" title="This pair is structurally compatible">
          Same lubricant, same safety class, pressure delta &lt; 15%, similar glide character
          — {b.displayName} is a drop-in replacement for {a.displayName} pressure-wise.
          Standard transition procedure applies; no equipment modifications or component
          re-rating typically required.
        </KeyInsight>
      ) : null}
    </div>
  );
}

function LifecycleContext({ a, b }: { a: Refrigerant; b: Refrigerant }) {
  const gwpA = a.environmental.gwp100Ar5 ?? 0;
  const gwpB = b.environmental.gwp100Ar5 ?? 0;
  const aimAct = a.regulatoryStatus.aimActAffected || b.regulatoryStatus.aimActAffected;
  const aAffected = a.regulatoryStatus.aimActAffected;
  const bAffected = b.regulatoryStatus.aimActAffected;
  const aGwpAboveCap = gwpA > 700;
  const bGwpAboveCap = gwpB > 700;

  return (
    <div className="space-y-3">
      <p>
        Beyond the per-service-call decision, the {a.displayName} ↔ {b.displayName} choice
        sits inside a broader regulatory and lifecycle context. The transition direction
        (which is the predecessor, which is the successor) is driven by climate policy and
        the AIM Act phase-down, not technical preference alone.
      </p>
      <Panel title="Lifecycle and regulatory snapshot" icon={TableIcon}>
        <ul className="text-sm space-y-1.5">
          <li>
            <strong>GWP profile:</strong> {a.displayName} = {gwpA.toLocaleString()} GWP
            (AR5); {b.displayName} = {gwpB.toLocaleString()} GWP.{" "}
            {gwpA > 0 && gwpB > 0
              ? `Switching from ${a.displayName} to ${b.displayName} ${gwpB < gwpA ? "reduces" : "increases"} direct refrigerant climate impact by ${Math.abs(((gwpB - gwpA) / gwpA) * 100).toFixed(0)}%.`
              : ""}
          </li>
          {aAffected || bAffected ? (
            <li>
              <strong>AIM Act exposure:</strong>{" "}
              {aAffected && bAffected
                ? `Both refrigerants are subject to the AIM Act phase-down (HFC allocation declining toward 15% of baseline by 2036).`
                : aAffected
                  ? `${a.displayName} is AIM Act-affected; ${b.displayName} is not — the transition reduces regulatory exposure.`
                  : `${b.displayName} is AIM Act-affected; ${a.displayName} is not — the transition increases regulatory exposure (unusual direction).`}
              {" "}
              {aGwpAboveCap || bGwpAboveCap
                ? `One or both refrigerants exceed the 700 GWP cap for new residential AC equipment (in effect since January 1, 2025).`
                : ``}
            </li>
          ) : (
            <li>
              <strong>AIM Act exposure:</strong> Neither refrigerant is directly affected by
              the AIM Act phase-down. Other regional regulations (EU F-Gas, Kigali signatory
              implementations) may still apply.
            </li>
          )}
          <li>
            <strong>EU F-Gas Regulation:</strong>{" "}
            {gwpA > 150 && gwpB > 150
              ? `Both refrigerants exceed the EU F-Gas 150 GWP cap for new stationary refrigeration. Selection in European market favors very-low-GWP HFOs and natural refrigerants.`
              : gwpA > 150
                ? `${a.displayName} exceeds the EU F-Gas 150 GWP cap; ${b.displayName} is compliant. The switch aligns with EU regulatory direction.`
                : gwpB > 150
                  ? `${b.displayName} exceeds the EU F-Gas 150 GWP cap; ${a.displayName} is compliant.`
                  : `Both refrigerants are below the EU F-Gas 150 GWP cap — compliant for European stationary refrigeration.`}
          </li>
          <li>
            <strong>Service supply outlook:</strong>{" "}
            {aimAct
              ? `Service supply of AIM Act-affected refrigerants persists during phase-down via reclaimed and allocated production, with prices rising as supply tightens. Plan for refrigerant cost escalation over equipment lifetime.`
              : `Neither refrigerant faces near-term supply constraints from US AIM Act phase-down. Pricing follows normal commodity dynamics.`}
          </li>
          <li>
            <strong>TEWI / LCCP framing:</strong> Total Equivalent Warming Impact accounts
            for both direct refrigerant emissions (leakage, end-of-life) and indirect
            emissions from equipment energy consumption. For HVAC equipment with ≤5% annual
            leak rate, indirect emissions typically dominate TEWI by 80-90% — meaning
            equipment efficiency matters more than refrigerant GWP for total climate
            impact. For commercial refrigeration with higher leak rates, the balance can
            tip toward favoring low-GWP refrigerants.
          </li>
        </ul>
      </Panel>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Regulatory sources: EPA AIM Act (40 CFR Part 84), EU F-Gas Regulation 517/2014 and
        update 2024/573, Kigali Amendment to the Montreal Protocol (2016), Japan
        Fluorocarbon Emissions Control Law. GWP values per IPCC AR5 (2013) WG-I Table 8.A.1.
      </p>
    </div>
  );
}

function buildSchema(pageUrl: string, fm: ComparisonFrontmatter, a: Refrigerant, b: Refrigerant): object[] {
  const graph: object[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: fm.title,
      description: fm.metaDescription ?? fm.introOneLiner,
      url: pageUrl,
      datePublished: a.dataSource.ptChartGeneratedAt,
      dateModified: a.dataSource.ptChartGeneratedAt,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: [
        { "@id": `${SITE_URL}/refrigerant/${a.slug}/#refrigerant` },
        { "@id": `${SITE_URL}/refrigerant/${b.slug}/#refrigerant` },
      ],
    },
  ];

  if (fm.faqs && fm.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: fm.faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
      { "@type": "ListItem", position: 3, name: fm.title },
    ],
  });

  return graph;
}
