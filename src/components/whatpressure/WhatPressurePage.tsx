import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon, Thermometer } from "lucide-react";

/**
 * Minimal inline-markdown renderer for narrativeIntro / FAQ answers — handles
 * `[label](url)`, `**bold**`, `*emphasis*`. Internal `/` URLs use Next Link;
 * external use <a target="_blank">. Mirrors the same helper in ComparisonPage.
 */
function renderInline(text: string): React.ReactNode[] {
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const parts: React.ReactNode[] = [];
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) parts.push(text.slice(i, m.index));
    if (m[1] !== undefined && m[2] !== undefined) {
      const label = m[1];
      const href = m[2];
      const isInternal = href.startsWith("/") && !href.startsWith("//");
      parts.push(
        isInternal ? (
          <Link key={parts.length} href={href} className="underline">{label}</Link>
        ) : (
          <a key={parts.length} href={href} className="underline break-all" target="_blank" rel="noopener noreferrer">{label}</a>
        ),
      );
    } else if (m[3] !== undefined) {
      parts.push(<strong key={parts.length}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      parts.push(<em key={parts.length}>{m[4]}</em>);
    }
    i = m.index + m[0].length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts.map((p, idx) => typeof p === "string" ? <Fragment key={idx}>{p}</Fragment> : p);
}
import { getRefrigerant, getPressureAtTempF, satPressure, type Refrigerant } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { AHRI_GUIDELINE_N_CITATION, ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { typeLabel } from "@/components/refrigerant/TypeChip";
import {
  ComparisonTable,
  Derived,
  FixCallout,
  Gauges,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { loadWhatPressure } from "@/lib/mdx-what-pressure";
import { contentDates, UpdatedLine } from "@/lib/content-dates";
import { SystemGaugesDiagram } from "@/components/diagrams/SystemGaugesDiagram";
import { getGaugeOperatingPoint } from "@/data/gauge-operating-points";

export interface WhatPressurePageProps {
  id: string;
}

export function WhatPressurePage({ id }: WhatPressurePageProps) {
  const mdx = loadWhatPressure(id);
  if (!mdx) return <ContentComingSoon id={id} />;

  const fm = mdx.frontmatter;
  const r = getRefrigerant(fm.refrigerantSlug);
  if (!r) notFound();

  const pageUrl = `${SITE_URL}/what-pressure-should-${id}/`;
  const schemaGraph = buildSchema(pageUrl, fm, r, id);
  const gaugePoint = getGaugeOperatingPoint(r.slug);
  const { rows: displayRanges, dropped: droppedRows } = computeOperatingRanges(r.slug, fm);
  const serviceScenarios = fm.serviceScenarios ?? generateServiceScenarios(r);

  // Saturation-envelope endpoints for the default bullet: clamp to the fluid's
  // actual PT-chart range so low-critical fluids (R-744 crit 87.8°F, R-13 83.7°F)
  // don't ask for a saturation pressure above their critical point (which renders "—").
  const envRows = [...r.ptChart].sort((a, b) => a.tempF - b.tempF);
  const envLoT = envRows.length ? Math.max(-20, envRows[0].tempF) : -20;
  const envHiT = envRows.length ? Math.min(95, envRows[envRows.length - 1].tempF) : 95;

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

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{fm.title}</h1>
          <UpdatedLine route={`/what-pressure-should-${id}/`} />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Link href={`/refrigerant/${r.slug}/`} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
              {r.displayName}
            </Link>
            <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
          </div>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">{fm.introOneLiner}</p>
        </header>

        <section className="mb-10 rounded-md border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Saturation pressure ≠ operating pressure</h2>
          <p className="mt-1 text-sm">
            The numbers below are <strong>operating</strong> pressures — what your manifold gauges read on a running
            system at a given outdoor ambient. Operating pressures depend on charge, ambient, indoor load, superheat,
            and subcooling. The {r.displayName} <em>saturation</em> pressures are different — those are
            thermodynamic equilibrium values you can look up on the{" "}
            <Link href={`/refrigerant/${r.slug}/`} className="underline">{r.displayName} PT chart</Link>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Operating pressure ranges</h2>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 font-medium">Condition</th>
                  <th className="px-3 py-2 font-medium text-right">Suction (low side)</th>
                  <th className="px-3 py-2 font-medium text-right">Discharge (high side)</th>
                  {!fm.pressureModel ? (
                    <>
                      <th className="px-3 py-2 font-medium text-right">Superheat target</th>
                      <th className="px-3 py-2 font-medium text-right">Subcooling target</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {displayRanges.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-3 py-2">{row.application}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.suctionLow}–{row.suctionHigh} PSIG</td>
                    <td className="px-3 py-2 text-right font-mono">{row.dischargeNote ? <span className="text-xs font-sans italic text-zinc-500">{row.dischargeNote}</span> : `${row.dischargeLow}–${row.dischargeHigh} PSIG`}</td>
                    {!fm.pressureModel ? (
                      <>
                        <td className="px-3 py-2 text-right font-mono text-xs">{row.superheatTargetF ? `${row.superheatTargetF[0]}–${row.superheatTargetF[1]}°F` : "—"}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs">{row.subcoolingNote ? <span className="font-sans italic text-zinc-500">{row.subcoolingNote}</span> : row.subcoolingTargetF ? `${row.subcoolingTargetF[0]}–${row.subcoolingTargetF[1]}°F` : "—"}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {fm.pressureModel ? (
            <div className="mt-2 space-y-1 text-xs text-zinc-500">
              <p>
                <strong>How we calculate these:</strong> {METHOD_TEXT[fm.pressureModel]}
              </p>
              <p>
                Suction and head are interpolated from the CoolProp-verified {r.displayName} saturation
                dataset (dew and bubble curves) and rounded to whole PSIG — no hand-entered values.
              </p>
              {droppedRows.length > 0 ? (
                <p>
                  Rows omitted (would need saturation data beyond the published {r.displayName} PT
                  range): {droppedRows.join("; ")}.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">Source: {fm.operatingRangesSource}</p>
          )}
        </section>

        {gaugePoint ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">Design-point view</h2>
            <SystemGaugesDiagram
              slug={r.slug}
              evapTempF={gaugePoint.evapTempF}
              condTempF={gaugePoint.condTempF}
              contextLabel={gaugePoint.contextLabel}
              altDutyNote={gaugePoint.altDutyNote}
            />
          </section>
        ) : null}

        {fm.narrativeIntro ? (
          <section className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
            {fm.narrativeIntro.split(/\n\s*\n/).map((p, i) => <p key={i}>{renderInline(p.trim())}</p>)}
          </section>
        ) : null}

        {/* ──────────────────────── Enhanced sections (data-driven) ──────────────────────── */}

        <TechSection icon="chart" tone="blue" title={`${r.displayName} saturation pressure quick reference`}>
          <p>
            Saturation pressure at common service temperatures, from the verified PT dataset
            (CoolProp 7.2.0). Use this for quick mental cross-reference against your manifold
            readings — operating pressure on a running system varies around these saturation
            values based on charge, ambient, and load.
          </p>
          <SaturationQuickRefTable r={r} />
          <PtCurveSnapshot r={r} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {r.displayName} saturation curve over the service temperature range. Source:
            CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS), generated{" "}
            {r.dataSource.ptChartGeneratedAt.slice(0, 10)}.
          </p>
        </TechSection>

        <TechSection icon="composition" tone="purple" title="Operating envelope across application conditions">
          <p>
            Operating pressure ranges visualized — suction (blue) and discharge (red) bars at
            each application condition. Wider bars indicate larger variation expected; tighter
            bars indicate the operating point is more constrained.
          </p>
          <OperatingEnvelopeBars ranges={displayRanges} />
        </TechSection>

        <TechSection icon="thermometer" tone="emerald" title={`${r.displayName} property snapshot`}>
          <Panel title="Quick property reference" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <PropertyRow label="Safety class" value={r.safetyClass} />
                  <PropertyRow label="Type" value={typeLabel(r.type)} />
                  <PropertyRow label="GWP (IPCC AR5, 100-yr)" value={r.environmental.gwp100Ar5 !== null ? String(r.environmental.gwp100Ar5) : "—"} />
                  <PropertyRow label="ODP" value={r.environmental.odp !== null ? String(r.environmental.odp) : "—"} />
                  <PropertyRow label="Normal boiling point" value={r.slug === "r-744" ? "none: CO₂ sublimes at −109.2°F at 1 atm (triple point 60.4 psig, −69.8°F)" : r.physical.boilingPointF !== null ? `${r.physical.boilingPointF.toFixed(1)}°F` : "—"} />
                  <PropertyRow label="Critical temperature" value={r.physical.critical.tempF !== null ? `${r.physical.critical.tempF.toFixed(1)}°F` : "—"} />
                  <PropertyRow label="Critical pressure" value={r.physical.critical.pressurePsig !== null ? `${r.physical.critical.pressurePsig.toFixed(0)} PSIG` : "—"} />
                  <PropertyRow label="Temperature glide" value={`${Math.abs(r.physical.temperatureGlideF).toFixed(1)}°F`} />
                  <PropertyRow label="Lubricant compatibility" value={r.lubricants.compatible.length > 0 ? r.lubricants.compatible.join(", ") : "—"} />
                  <PropertyRow label="AIM Act affected" value={r.regulatoryStatus.aimActAffected ? "Yes" : "No"} />
                </tbody>
              </table>
            </div>
          </Panel>
        </TechSection>

        {serviceScenarios.length > 0 ? (
          <>
            <TechSection icon="service" tone="amber" title={`Real service scenarios for ${r.displayName}`}>
              <p>
                Field scenarios showing common diagnostic patterns when reading{" "}
                {r.displayName} system pressures. Each maps manifold readings to a verdict and
                specific service action.
              </p>
            </TechSection>

            {serviceScenarios.map((scenario, i) => (
              <ServiceProblem
                key={i}
                number={i + 1}
                refrigerant={r.displayName}
                title={scenario.title}
                scenario={scenario.scenario}
              >
                <Panel title="Measured" icon={Gauge}>
                  <Gauges items={scenario.measured} />
                </Panel>
                <Panel title="PT chart lookup" icon={CalcIcon}>
                  <Lookups rows={scenario.lookups} />
                </Panel>
                <Panel title="Derived" icon={Activity}>
                  <Derived rows={scenario.derived} />
                </Panel>
                <VerdictBanner status={scenario.verdict.status} title={scenario.verdict.title}>
                  {scenario.verdict.body}
                </VerdictBanner>
                {scenario.fix ? <FixCallout>{scenario.fix}</FixCallout> : null}
              </ServiceProblem>
            ))}
          </>
        ) : null}

        <TechSection icon="composition" tone="emerald" title={`Operating envelope and equipment context — ${r.displayName}`}>
          <p>
            {r.displayName}{" "}pressures sit inside an operating envelope bounded by the
            refrigerant&apos;s thermodynamic properties (saturation curve, critical point)
            and the equipment&apos;s pressure-rated components. Understanding both bounds
            tells you what pressure readings are normal versus what readings indicate a
            system fault.
          </p>
          <Panel title="Pressure envelope reference" icon={TableIcon}>
            {fm.envelopeBullets && fm.envelopeBullets.length > 0 ? (
              <ul className="text-sm space-y-1.5">
                {fm.envelopeBullets.map((b, i) => (
                  <li key={i}>
                    <strong>{b.label}:</strong> {b.body}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="text-sm space-y-1.5">
                <li>
                  <strong>Saturation envelope:</strong> {r.displayName} saturation pressure
                  ranges from{" "}
                  {getPressureAtTempF(r.slug, envLoT)?.bubble.toFixed(0) ?? "—"} PSIG at {envLoT}°F
                  to {getPressureAtTempF(r.slug, envHiT)?.bubble.toFixed(0) ?? "—"} PSIG at {envHiT}°F.{" "}
                  {r.physical.critical.tempF !== null
                    ? `Critical temperature is ${r.physical.critical.tempF.toFixed(1)}°F — above this point no saturation state exists.`
                    : `Critical temperature is well above the service range — sub-critical operation throughout.`}
                </li>
                <li>
                  <strong>Equipment pressure rating:</strong>{" "}
                  {r.physical.critical.pressurePsig !== null
                    ? `${r.displayName} critical pressure is ${r.physical.critical.pressurePsig.toFixed(0)} PSIG.`
                    : ""}{" "}
                  High- and low-pressure cutout setpoints are set by the equipment
                  manufacturer, not derived from a refrigerant property — use the OEM
                  nameplate / service-manual values (there is no standard
                  percentage-of-critical-pressure cutout rule).
                </li>
                <li>
                  <strong>Charging metric:</strong>{" "}
                  {r.physical.hasSignificantGlide
                    ? `${r.displayName} is zeotropic with ${Math.abs(r.physical.temperatureGlideF).toFixed(1)}°F glide. TXV systems charge by subcooling using the bubble curve at discharge pressure; superheat measurement uses the dew curve at suction pressure. Wrong-curve selection introduces error equal to the glide value.`
                    : `${r.displayName} is pure or near-azeotropic with minimal glide, so bubble ≡ dew on the saturation curve. Standard PT chart math applies without curve-selection concerns.`}
                </li>
                <li>
                  <strong>Lubricant requirement:</strong> {r.displayName} runs on{" "}
                  {r.lubricants.compatible.length > 0 ? r.lubricants.compatible.join(" / ") : "manufacturer-specified"}{" "}
                  lubricant.{" "}
                  {r.lubricants.compatible.includes("POE")
                    ? `POE oil is hygroscopic — keep cylinder sealed, change filter-drier on every service visit, evacuate to ≤500 microns before recharging to remove residual moisture.`
                    : r.lubricants.compatible.includes("MO")
                      ? `Mineral oil is moisture-tolerant but limited to ${r.type.includes("hcfc") || r.type.includes("hydrocarbon") ? "the refrigerant types it&apos;s rated for" : "specific refrigerants"}.`
                      : `Follow OEM-specified handling for the lubricant family.`}
                </li>
                <li>
                  <strong>Regulatory status:</strong>{" "}
                  {fm.regulatoryNote
                    ? fm.regulatoryNote
                    : r.regulatoryStatus.aimActAffected
                      ? `${r.displayName} is subject to the EPA AIM Act phase-down (40 CFR Part 84). Service supply continues from reclaimed and allocated production, with prices rising as supply tightens. Plan refrigerant cost escalation over equipment lifetime.`
                      : `${r.displayName} is not directly affected by the AIM Act. Service supply follows normal commodity dynamics.`}
                </li>
              </ul>
            )}
          </Panel>
        </TechSection>

        <TechSection icon="warning" tone="amber" title={`Common ${r.displayName} measurement mistakes`}>
          {fm.commonMistakes && fm.commonMistakes.length > 0 ? (
            <ol className="list-decimal pl-5 text-sm space-y-1">
              {fm.commonMistakes.map((m, i) => (
                <li key={i}>
                  <strong>{m.emphasis}</strong> {m.body}
                </li>
              ))}
            </ol>
          ) : (
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>
                <strong>PSIG vs PSIA confusion.</strong> Service manifold gauges read PSIG;
                tables sometimes use PSIA. PSIA = PSIG + 14.696. Confusing the two shifts
                saturation lookups by ~5°F at low-side pressures.
              </li>
              {r.physical.hasSignificantGlide ? (
                <li>
                  <strong>Wrong curve for {r.displayName}.</strong> {r.displayName} is
                  zeotropic with {Math.abs(r.physical.temperatureGlideF).toFixed(1)}°F glide.
                  Use the dew curve at suction pressure for superheat, bubble curve at
                  discharge for subcooling. Wrong-curve selection introduces error equal to the
                  glide value.
                </li>
              ) : (
                <li>
                  <strong>{r.displayName} has minimal glide</strong>{" "}(pure refrigerant or
                  near-azeotrope), so bubble ≡ dew on the saturation curve. Curve selection on
                  the PT chart doesn&apos;t matter for {r.displayName}.
                </li>
              )}
              <li>
                <strong>Probing temperature without insulating.</strong> Ambient air pulls the
                reading toward room temperature, inflating apparent superheat or depressing
                apparent subcooling.
              </li>
              <li>
                <strong>Reading before steady state.</strong> Allow 10-20 minutes after
                compressor start for pressures and temperatures to stabilize.
              </li>
              <li>
                <strong>Treating saturation as operating.</strong> Saturation is the
                thermodynamic reference; operating pressure on a running system depends on
                charge, ambient, load, superheat, and subcooling.
              </li>
              {r.physical.critical.tempF !== null && r.physical.critical.tempF < 150 ? (
                <li>
                  <strong>{r.displayName} has a low critical temperature</strong>{" "}
                  ({r.physical.critical.tempF.toFixed(1)}°F). Above this temperature there is
                  no saturation state — for warm-ambient applications, transcritical operation
                  or system shutdown applies. Look up{" "}
                  <Link href={`/refrigerant/${r.slug}/`} className="underline">
                    the {r.displayName} reference page
                  </Link>{" "}
                  for transcritical guidance.
                </li>
              ) : null}
            </ol>
          )}
        </TechSection>

        <TechSection icon="book" tone="emerald" title={`When pressures fall outside ${r.displayName} normal range`}>
          <p>
            Use the calculators on this site to convert your readings into superheat,
            subcooling, and diagnostic patterns:
          </p>
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — suction PSIG + line °F → superheat for {r.displayName}.
            </li>
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — liquid PSIG + line °F → subcooling.
            </li>
            <li>
              <Link href="/pt-superheat-subcooling-calculator/" className="underline">Combined SH/SC/PT</Link>{" "}
              — both sides + pattern-matching diagnostic banner.
            </li>
            <li>
              <Link href="/system-pressure-diagnostic-calculator/" className="underline">System Pressure Diagnostic</Link>{" "}
              — multi-input diagnostic with approach temperatures.
            </li>
            <li>
              <Link href="/high-head-pressure-causes/" className="underline">High head pressure causes</Link>{" "}
              — decision tree for high-side problems.
            </li>
          </ul>
        </TechSection>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Diagnostic procedure</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Step-by-step procedure to interpret {r.displayName} pressure readings on a service call.
          </p>
          <ol className="space-y-4">
            {fm.diagnosticSteps.map((step, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-semibold">
                  <span className="mr-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{i + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{renderInline(step.text)}</p>
                {step.tools && step.tools.length > 0 ? (
                  <p className="mt-2 text-xs text-zinc-500"><strong>Tools:</strong> {step.tools.join(", ")}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

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
                    {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{renderInline(p.trim())}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          <Link href={`/refrigerant/${r.slug}/`} className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">{r.displayName} full reference</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Saturation chart, properties, retrofit guidance.</p>
          </Link>
          <Link href="/superheat-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Superheat Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Suction PSIG + line °F → superheat.</p>
          </Link>
          <Link href="/subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Subcooling Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Liquid PSIG + line °F → subcooling.</p>
          </Link>
          <Link href="/low-suction-pressure/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Low suction pressure</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Diagnostic tree — undercharge, restriction, airflow patterns.</p>
          </Link>
          <Link href="/ac-low-side-pressure-too-high/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">AC low side pressure too high</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Overcharge, TXV overfeed, restricted evap airflow.</p>
          </Link>
          {r.slug === "r-410a" ? (
            <>
              <Link href="/r410a-superheat-chart/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <h3 className="text-sm font-semibold">R-410A superheat chart</h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Fixed-orifice target SH by WB × DB.</p>
              </Link>
              <Link href="/r410a-charging-chart/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <h3 className="text-sm font-semibold">R-410A charging chart</h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">TXV subcooling + fixed-orifice SH on one page.</p>
              </Link>
            </>
          ) : null}
          {r.slug === "r-22" ? (
            <Link href="/r22-superheat-chart/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <h3 className="text-sm font-semibold">R-22 superheat chart</h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Fixed-orifice target SH by WB × DB.</p>
            </Link>
          ) : null}
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources &amp; provenance</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              {fm.pressureModel
                ? `Operating pressure ranges: computed from the ${r.displayName} PT dataset (dew/bubble saturation via satPressure), rounded to whole PSIG — see the method note under the table.`
                : `Operating pressure ranges: ${fm.operatingRangesSource}`}
            </li>
            <li>Saturation pressures: CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS</li>
            <li>Safety classification: ANSI/ASHRAE Standard 34-2022</li>
            <li>GWP values: IPCC AR5 (2013) Working Group I, Table 8.A.1</li>
            {fm.extraSources?.map((s, i) => <li key={`extra-${i}`}>{s}</li>)}
          </ul>
          <p className="mt-3">
            Operating pressure varies with charge, ambient, indoor load, airflow, and equipment condition. Use these
            ranges as a starting reference; always defer to the equipment manufacturer&apos;s charging procedure for the
            specific system. See <Link href="/superheat-subcooling-fundamentals/" className="underline">superheat &amp;
            subcooling fundamentals</Link> for the distinction between saturation and operating pressures.
          </p>
        </footer>
      </article>
    </>
  );
}

/* ──────────────────────── Computed operating ranges ──────────────────────── */

type WPFrontmatter = NonNullable<ReturnType<typeof loadWhatPressure>>["frontmatter"];

/** A single operating-table row after suction/head are resolved to PSIG. */
interface DisplayRange {
  application: string;
  suctionLow: number;
  suctionHigh: number;
  dischargeLow: number;
  dischargeHigh: number;
  /** Text shown for discharge instead of a numeric range (transcritical rows). */
  dischargeNote?: string;
  /** Legacy-only companion target columns (unset on computed pages). */
  superheatTargetF?: [number, number];
  subcoolingTargetF?: [number, number];
  /** Text shown for subcooling instead of a numeric target (transcritical rows). */
  subcoolingNote?: string;
}

/** Residential indoor evaporator saturation band (normal indoor load). */
const RESIDENTIAL_EVAP_LOW_F = 38;
const RESIDENTIAL_EVAP_HIGH_F = 45;

/**
 * Method blurb printed under the computed table. Verbatim per the task spec so
 * every operating-pressure page states exactly how its numbers were derived.
 */
const METHOD_TEXT: Record<NonNullable<WPFrontmatter["pressureModel"]>, string> = {
  "residential-ac":
    "suction is the dew pressure for a 38–45°F evaporator (normal indoor load); head is the liquid (bubble) pressure 15–25°F above outdoor temperature, the usual condensing split for residential condensers (high-efficiency units run near the low end). Suction mostly follows indoor load and airflow, not outdoor temperature. Charge by the manufacturer's method: subcooling for TXV/EEV, superheat for fixed orifice.",
  "commercial-refrigeration":
    "suction is the dew pressure within ±3°F of the listed evaporator temperature; head is the liquid (bubble) pressure 15–30°F above ambient for air-cooled condensing units. Evaporator TD, head-pressure controls and condenser size shift these; follow the equipment data plate.",
};

/**
 * Resolve every operating-table row to whole-PSIG suction/head.
 *
 * pressureModel set → compute from the PT dataset via satPressure (no typed
 * values). A row whose formula needs a temperature outside the fluid's PT
 * range (e.g. R-454B head at a 115°F outdoor needs bubble @140°F but the
 * dataset stops at 134°F) is DROPPED and reported — never extrapolated.
 *
 * pressureModel unset → legacy pages: fall back to the hand-entered literals.
 */
function computeOperatingRanges(
  slug: string,
  fm: WPFrontmatter,
): { rows: DisplayRange[]; dropped: string[] } {
  const model = fm.pressureModel;
  const rows: DisplayRange[] = [];
  const dropped: string[] = [];

  for (const row of fm.operatingRanges) {
    if (!model) {
      rows.push({
        application: row.application,
        suctionLow: row.suctionPsigLow ?? 0,
        suctionHigh: row.suctionPsigHigh ?? 0,
        dischargeLow: row.dischargePsigLow ?? 0,
        dischargeHigh: row.dischargePsigHigh ?? 0,
        dischargeNote: row.dischargeNote,
        superheatTargetF: row.superheatTargetF,
        subcoolingTargetF: row.subcoolingTargetF,
        subcoolingNote: row.subcoolingNote,
      });
      continue;
    }

    // Suction band: residential = fixed indoor evaporator; commercial = ±3°F
    // around the row's evaporator saturation temperature.
    let sucLoT: number, sucHiT: number;
    if (model === "residential-ac") {
      sucLoT = RESIDENTIAL_EVAP_LOW_F;
      sucHiT = RESIDENTIAL_EVAP_HIGH_F;
    } else {
      if (row.evaporatorF === undefined) {
        dropped.push(`${row.application} (missing evaporator temperature)`);
        continue;
      }
      sucLoT = row.evaporatorF - 3;
      sucHiT = row.evaporatorF + 3;
    }

    // Head band: bubble pressure over the condensing split above ambient.
    const headHiOffset = model === "residential-ac" ? 25 : 30;
    const suctionLow = satPressure(slug, sucLoT, "dew");
    const suctionHigh = satPressure(slug, sucHiT, "dew");
    const dischargeLow = satPressure(slug, row.ambientF + 15, "bubble");
    const dischargeHigh = satPressure(slug, row.ambientF + headHiOffset, "bubble");

    if (suctionLow === null || suctionHigh === null || dischargeLow === null || dischargeHigh === null) {
      dropped.push(`${row.application} (needs saturation data beyond the published ${slug.toUpperCase()} PT range)`);
      continue;
    }

    rows.push({
      application: row.application,
      suctionLow: Math.round(suctionLow),
      suctionHigh: Math.round(suctionHigh),
      dischargeLow: Math.round(dischargeLow),
      dischargeHigh: Math.round(dischargeHigh),
    });
  }

  return { rows, dropped };
}

/* ──────────────────────── Data-driven helper components ──────────────────────── */

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
      <td className="py-1.5 text-xs uppercase tracking-wide text-zinc-500">{label}</td>
      <td className="py-1.5 text-right font-mono text-sm">{value}</td>
    </tr>
  );
}

function SaturationQuickRefTable({ r }: { r: Refrigerant }) {
  const temps = [-20, 0, 20, 40, 70, 95, 120];
  const rows = temps
    .map((t) => {
      const p = getPressureAtTempF(r.slug, t);
      if (!p) return null;
      return { temp: t, bubble: p.bubble, dew: p.dew };
    })
    .filter((r): r is { temp: number; bubble: number; dew: number } => r !== null);

  if (rows.length === 0) return null;

  const hasGlide = r.physical.hasSignificantGlide;

  return (
    <Panel title="Saturation pressure at common service temperatures" icon={TableIcon}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
              <th className="py-1.5 text-left">Temperature</th>
              <th className="py-1.5 text-right">{hasGlide ? "Bubble (PSIG)" : "Saturation (PSIG)"}</th>
              {hasGlide ? <th className="py-1.5 text-right">Dew (PSIG)</th> : null}
              <th className="py-1.5 text-right">PSIA</th>
              <th className="py-1.5 text-right">kPa gauge</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {rows.map((row) => (
              <tr key={row.temp} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="py-1.5 text-left">{row.temp}°F</td>
                <td className="py-1.5 text-right">{row.bubble.toFixed(1)}</td>
                {hasGlide ? <td className="py-1.5 text-right">{row.dew.toFixed(1)}</td> : null}
                <td className="py-1.5 text-right">{(row.bubble + 14.696).toFixed(1)}</td>
                <td className="py-1.5 text-right">{(row.bubble * 6.8948).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PtCurveSnapshot({ r }: { r: Refrigerant }) {
  const W = 720;
  const H = 320;
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 40;
  const PAD_B = 40;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;

  const points = r.ptChart.filter((p) => p.tempF >= -40 && p.tempF <= 150);
  if (points.length < 2) return null;

  const pressures = points.flatMap((p) => [p.bubblePsig, p.dewPsig]);
  const xMin = -40;
  const xMax = 150;
  const yMin = 0;
  const yMax = Math.max(...pressures) * 1.05;

  const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
  const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const bubblePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.tempF).toFixed(1)} ${yScale(p.bubblePsig).toFixed(1)}`)
    .join(" ");
  const dewPath = r.physical.hasSignificantGlide
    ? points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.tempF).toFixed(1)} ${yScale(p.dewPsig).toFixed(1)}`)
        .join(" ")
    : null;

  const xTicks = [-40, -20, 0, 20, 40, 60, 80, 100, 120, 140];
  const yTickStep = Math.ceil(yMax / 8 / 25) * 25;
  const yTicks: number[] = [];
  for (let t = 0; t <= yMax; t += yTickStep) yTicks.push(t);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${r.displayName} saturation pressure-temperature curve from -40°F to 150°F.`}
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        {r.displayName} saturation curve
      </text>
      {xTicks.map((t) => (
        <g key={`gx-${t}`}>
          <line x1={xScale(t)} y1={PAD_T} x2={xScale(t)} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T + PLOT_H + 14} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>{t}</text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`gy-${t}`}>
          <line x1={PAD_L} y1={yScale(t)} x2={PAD_L + PLOT_W} y2={yScale(t)} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={PAD_L - 6} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.7}>{t}</text>
        </g>
      ))}
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.5} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.5} />
      <text x={PAD_L + PLOT_W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.8}>
        Temperature (°F)
      </text>
      <text x={14} y={PAD_T + PLOT_H / 2} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.8} transform={`rotate(-90 14 ${PAD_T + PLOT_H / 2})`}>
        Saturation pressure (PSIG)
      </text>
      <path d={bubblePath} stroke="#3a8ed1" strokeWidth={2.5} fill="none" />
      {dewPath ? <path d={dewPath} stroke="#8e4dd1" strokeWidth={2.25} strokeDasharray="6 3" fill="none" /> : null}
      {dewPath ? (
        <g transform={`translate(${PAD_L + 16}, ${PAD_T - 12})`}>
          <line x1={0} y1={4} x2={22} y2={4} stroke="#3a8ed1" strokeWidth={2.5} />
          <text x={28} y={8} fontSize="11" fontWeight={500} fill="currentColor">Bubble</text>
          <line x1={100} y1={4} x2={122} y2={4} stroke="#8e4dd1" strokeWidth={2.25} strokeDasharray="6 3" />
          <text x={128} y={8} fontSize="11" fontWeight={500} fill="currentColor">Dew ({Math.abs(r.physical.temperatureGlideF).toFixed(1)}°F glide)</text>
        </g>
      ) : null}
    </svg>
  );
}

function OperatingEnvelopeBars({ ranges }: { ranges: DisplayRange[] }) {
  if (ranges.length === 0) return null;
  const allP = ranges.flatMap((r) => [r.suctionLow, r.suctionHigh, r.dischargeLow, r.dischargeHigh]);
  const xMax = Math.max(...allP) * 1.05;

  const W = 720;
  const ROW_H = 50;
  const PAD_T = 40;
  const PAD_B = 28;
  const LABEL_W = 160;
  const PAD_R = 60;
  const BAR_W = W - LABEL_W - PAD_R;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + ranges.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Operating pressure envelope by application condition: suction (blue) and discharge (red) ranges."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Operating envelope by application (PSIG)
      </text>
      {[0, 100, 200, 300, 400, 500, 600, 700, 800].filter((t) => t <= xMax).map((t) => (
        <g key={`gx-${t}`}>
          <line x1={xScale(t)} y1={PAD_T - 4} x2={xScale(t)} y2={PAD_T + ranges.length * ROW_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}
      {ranges.map((range, i) => {
        const y = PAD_T + i * ROW_H;
        return (
          <g key={i}>
            <text x={LABEL_W - 8} y={y + 18} textAnchor="end" fontSize="10" fontWeight={500} fill="currentColor">
              {range.application}
            </text>
            <rect x={xScale(range.suctionLow)} y={y + 6} width={xScale(range.suctionHigh) - xScale(range.suctionLow)} height={12} fill="#3a8ed1" rx={2} />
            <text x={xScale(range.suctionHigh) + 4} y={y + 16} fontSize="9" fill="#3a8ed1" fontWeight={500}>SP {range.suctionLow}-{range.suctionHigh}</text>
            {range.dischargeHigh > 0 ? (
              <>
                <rect x={xScale(range.dischargeLow)} y={y + 22} width={xScale(range.dischargeHigh) - xScale(range.dischargeLow)} height={12} fill="#c45757" rx={2} />
                <text x={xScale(range.dischargeHigh) + 4} y={y + 32} fontSize="9" fill="#c45757" fontWeight={500}>DP {range.dischargeLow}-{range.dischargeHigh}</text>
              </>
            ) : (
              <text x={xScale(0) + 4} y={y + 32} fontSize="9" fill="#c45757" fontWeight={500}>High side: controller-set (transcritical)</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ──────────────────────── Service scenario generator ──────────────────────── */

interface GeneratedScenario {
  title: string;
  scenario: string;
  measured: { label: string; value: string; side?: "low" | "high" }[];
  lookups: { input: string; output: string; note?: string }[];
  derived: { formula: string; verdict: "ok" | "warn" | "bad" | "info"; note?: string }[];
  verdict: { status: "ok" | "warn" | "bad" | "info"; title: string; body: string };
  fix?: string;
}

function generateServiceScenarios(r: Refrigerant): GeneratedScenario[] {
  // The former auto-generated residential scenarios were fabricated: fixed
  // 0.78 / 1.25 multipliers applied to the 40°F/95°F saturation values, not
  // dataset-derived operating points. Removed in task 3A. The R-744 set was
  // likewise fabricated and physically impossible (900 PSIG labelled 33°F sat
  // when it is ~75°F; a 40 PSIG suction below CO₂'s 60.4 PSIG triple point; a
  // 1100 PSIG "60°F sat" above the 1055 PSIG critical pressure) — removed in
  // task 6E. Pages that need scenarios now supply hand-checked ones via
  // frontmatter (fm.serviceScenarios).
  void r;
  return [];
}

function ContentComingSoon({ id }: { id: string }) {
  const pageUrl = `${SITE_URL}/what-pressure-should-${id}/`;
  const placeholderSchema = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: `Operating-pressure reference for ${id.toUpperCase()} — editorial pending`,
      description: `Operating-pressure ranges and diagnostic procedure for ${id.toUpperCase()}. Editorial pass pending; the page renders rather than 404ing so internal links stay live.`,
      url: pageUrl,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
        { "@type": "ListItem", position: 3, name: `What pressure should ${id.toUpperCase()} be?` },
      ],
    },
  ];
  return (
    <>
      <JsonLd graph={placeholderSchema} />
      <article className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Operating-pressure reference coming soon</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Per-refrigerant operating-pressure data for <code>{id}</code> hasn&apos;t been compiled yet. The page renders
        rather than 404ing so internal links stay live; sourced operating ranges land in a follow-up editorial pass.
      </p>
      <p className="mt-4 text-sm">
        In the meantime, see the{" "}
        <Link href={`/refrigerant/${id.startsWith("r") ? id : `r-${id}`}/`} className="underline">
          {id.toUpperCase()} reference page
        </Link>{" "}
        for the saturation chart and properties.
      </p>
    </article>
    </>
  );
}

function buildSchema(pageUrl: string, fm: NonNullable<ReturnType<typeof loadWhatPressure>>["frontmatter"], r: NonNullable<ReturnType<typeof getRefrigerant>>, id: string) {
  const d = contentDates(`/what-pressure-should-${id}/`);
  const graph: object[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: fm.title,
      description: fm.metaDescription ?? fm.introOneLiner,
      url: pageUrl,
      datePublished: d.published,
      dateModified: d.updated,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/refrigerant/${r.slug}/#refrigerant` },
      citation: [AHRI_GUIDELINE_N_CITATION],
    },
    {
      "@type": "HowTo",
      "@id": `${pageUrl}#howto`,
      name: `How to interpret ${r.displayName} system pressures`,
      description: `Step-by-step diagnostic procedure for reading and interpreting ${r.displayName} suction and discharge pressures.`,
      totalTime: "PT15M",
      tool: (fm.diagnosticTools ?? [
        "Refrigerant manifold gauge set rated for the refrigerant",
        "Contact or clamp-on temperature probe (+/-1°F accuracy)",
        "EPA Section 608 certification (Type II or Universal)",
      ]).map((name) => ({ "@type": "HowToTool", name })),
      step: fm.diagnosticSteps.map((s) => ({
        "@type": "HowToStep",
        name: s.title,
        // Strip inline Markdown ([label](url), **bold**, *em*) so the schema
        // carries plain prose, not raw markup.
        text: s.text
          .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1"),
      })),
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

export function buildWhatPressureMetadata(id: string): Metadata {
  const path = `/what-pressure-should-${id}/`;
  const mdx = loadWhatPressure(id);
  if (!mdx) {
    return pageMetadata({
      title: `What Pressure Should ${id.toUpperCase()} Be?`,
      description: "Operating pressure reference for HVAC refrigerants.",
      path,
    });
  }
  return pageMetadata({
    title: mdx.frontmatter.metaTitle ?? mdx.frontmatter.title,
    description: mdx.frontmatter.metaDescription ?? mdx.frontmatter.introOneLiner,
    path,
  });
}
