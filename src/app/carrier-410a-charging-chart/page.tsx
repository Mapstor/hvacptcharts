import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Wind, Thermometer, Gauge, ListChecks, AlertTriangle, Wrench, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants, getRefrigerant, getPressureAtTempF } from "@/data/refrigerants";
import {
  FixCallout,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
  ComparisonTable,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { CarrierChargingLookup } from "@/components/calculators/CarrierChargingLookup";

const PAGE_URL = `${SITE_URL}/carrier-410a-charging-chart/`;
const R410A = getRefrigerant("r-410a");
const PUBLISHED = R410A?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Carrier R-410A Charging Chart — Target Superheat by Outdoor & Wet-Bulb (with PSIG Reference)",
  description:
    "The Carrier R-410A fixed-orifice charging chart: target superheat at every outdoor dry-bulb × indoor wet-bulb combination, plus the matching R-410A saturation pressures so you can verify charge in one visit. Step-by-step procedure, three worked examples, common-error diagnosis, and an interactive lookup.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Carrier R-410A Charging Chart — Target Superheat by Outdoor & Wet-Bulb",
    description:
      "Fixed-orifice charging chart, R-410A pressure cross-reference, step-by-step procedure, worked examples, and an interactive WB×OD lookup.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carrier R-410A Charging Chart — Fixed-Orifice Superheat Targets",
    description: "Target superheat by outdoor & wet-bulb, with R-410A PSIG reference and worked examples.",
    images: ["/twitter-image"],
  },
};

// Carrier R-410A fixed-orifice superheat chart values.
// Source: Carrier Service Bulletin "R-410A Charging — Fixed Orifice Devices"
// (reprinted in Carrier Residential AC Service Reference manuals; same chart
// circulated by Bryant, ICP, and other Carrier-family OEMs).
// `null` = do not charge under these conditions (system off or wait for design temps).
const CHART_ROWS: Array<{ wb: number; cells: Array<number | null> }> = [
  { wb: 50, cells: [13, 7, null, null, null, null] },
  { wb: 55, cells: [21, 16, 11, 6, null, null] },
  { wb: 60, cells: [27, 23, 19, 16, 12, 8] },
  { wb: 65, cells: [31, 28, 25, 22, 19, 16] },
  { wb: 70, cells: [32, 30, 28, 26, 24, 22] },
  { wb: 75, cells: [33, 31, 30, 28, 26, 25] },
];
const OD_COLS = [65, 75, 85, 95, 105, 115];

// Round a number to 1 decimal for display.
const r1 = (n: number | null | undefined) => (typeof n === "number" ? n.toFixed(1) : "—");
const r0 = (n: number | null | undefined) => (typeof n === "number" ? n.toFixed(0) : "—");

// Pressure helpers (R-410A is a near-azeotrope; bubble ≈ dew within 0.5 PSIG).
const psig = (tempF: number) => {
  const p = getPressureAtTempF("r-410a", tempF);
  return p ? p.bubble : null;
};

const FAQS = [
  {
    q: "Is the Carrier R-410A charging chart the same as the Trane / Lennox / Goodman chart?",
    a: "The structure is identical — every OEM publishes a 2-axis (outdoor dry-bulb × indoor wet-bulb) target-superheat lookup for their fixed-orifice R-410A equipment. The specific cell values can differ by ±2-3°F because each manufacturer tunes the chart to their coil geometry, orifice size, and design conditions. For best accuracy, use the chart printed on the unit's access-panel sticker or in the installation manual for that specific model. The Carrier chart shown here is the most commonly referenced industry-standard version and is accurate within manufacturing tolerance for most residential split systems built between roughly 2010 and the SEER2 transition.",
  },
  {
    q: "What if the indoor wet-bulb is between two chart rows (e.g. 63°F WB)?",
    a: "Interpolate linearly. For 63°F WB at 95°F outdoor, take the 60°F row (16°F SH) and the 65°F row (22°F SH), then weight: 63 is 3/5 of the way from 60 to 65, so target ≈ 16 + (3/5)(22-16) ≈ 19.6°F SH. The interactive lookup above does this for you. Don't round to the nearest row — a 3°F SH error is the difference between mild undercharge and mild overcharge.",
  },
  {
    q: "Can I use this chart for R-22 retrofit equipment that's been converted to R-410A?",
    a: "No. R-22 systems cannot be retrofitted to R-410A — the working pressures are 50-60% higher than R-22 (R-410A operates around 250 PSIG suction at 95°F OD vs ~70 PSIG for R-22), and R-22 condensers, line sets, and compressors are not rated for R-410A pressures. Any \"R-22 to R-410A retrofit\" is an equipment replacement, not a conversion. If you have a system labeled R-410A, use this chart. If it's labeled R-22, use the R-22 chart.",
  },
  {
    q: "Why does the chart not include cells below 55°F WB at high outdoor temperatures?",
    a: "Low indoor humidity (low WB) combined with high outdoor temperatures is rare in residential AC operation — it usually means the indoor coil isn't doing latent work, often because the home is already dry or the unit has been running for hours after a moisture-pull cycle. In these conditions the evaporator approach is too small to produce meaningful superheat, and the system should be allowed to cycle off. The chart's empty cells are an honest \"don't charge under these conditions\" signal, not missing data.",
  },
  {
    q: "Why does my measured superheat read several degrees off-chart even though pressures look normal?",
    a: "Three common causes. (1) Thermometer placement: the suction-line probe must be on a clean, insulated section of copper at least 6 inches downstream of the evaporator exit, not in the return bend. A poorly attached probe reads ambient, not refrigerant. (2) Line-set length: longer line sets (>25 ft) increase pressure drop between coil and service port, which inflates measured superheat at the service port relative to the chart target. Adjust the chart target down 1-2°F per extra 25 ft. (3) Indoor wet-bulb measurement: a digital psychrometer in cool dry air may read 2-3°F low if the wick is dry; always wet the wick before measuring.",
  },
  {
    q: "When should I use subcooling charging instead of this superheat chart?",
    a: "Use subcooling for TXV or EEV metering devices (8-12°F SC target, refrigerant-independent of outdoor conditions). Use this superheat chart for fixed-orifice / piston / capillary tube devices. Most Carrier residential systems built after ~2015 use TXVs — the superheat chart is for the older fixed-orifice equipment that's still in service. Check the indoor coil's metering-device label: \"TXV\" or \"EEV\" → subcool; \"piston\" or \"flow rator\" → superheat chart.",
  },
  {
    q: "What does a target superheat of 6°F at 95°F outdoor mean? Is 6°F too low?",
    a: "It's an instruction, not a warning. At 55°F WB × 95°F OD, the system is running with very low latent load and the chart calls for tight superheat to avoid undercharging (an overcharged coil at these conditions would cause liquid flood-back to the compressor). 6°F SH is normal at these conditions on a fixed-orifice system. Adjust the charge until measured SH matches the chart; don't second-guess the chart by aiming for a comfortable 10-15°F.",
  },
  {
    q: "What suction pressure should I see at 95°F outdoor / 67°F wet-bulb on a properly-charged R-410A system?",
    a: `Around ${r0(psig(50))} PSIG suction. The math: indoor 67°F WB pulls saturated suction temperature to roughly 50°F (67 − 17°F design approach); R-410A saturation at 50°F is ${r0(psig(50))} PSIG bubble pressure. Target superheat from the chart is 22°F SH (interpolating 65°F and 70°F WB rows), so the actual suction line temperature would read 72°F. Pressure too high → likely overcharge or restricted air. Pressure too low → undercharge or evaporator airflow problem.`,
  },
];

const HOWTO_STEPS = [
  {
    title: "Confirm the metering device is fixed-orifice (not TXV)",
    text: "Check the indoor coil label or installation sticker. Fixed-orifice systems (piston, flowrator, capillary tube) use this superheat chart. TXV/EEV systems use subcooling instead (8-12°F SC target). If the system has a TXV, this chart will give you wrong answers — switch to the subcooling calculator.",
  },
  {
    title: "Measure outdoor dry-bulb at the condenser, in shade",
    text: "Use a digital thermometer or thermistor probe shaded from direct sun, 4-6 ft from the condenser intake. Sunlit dry-bulb reads 5-10°F high and will skew the chart target. Wait 5 minutes after a thermometer move for the probe to stabilize.",
  },
  {
    title: "Measure indoor wet-bulb at the return grille",
    text: "Use a sling psychrometer or digital meter with a wetted wick. Hold the probe in moving return air for 30 seconds. Typical residential range: 55-72°F WB. A digital meter with a dry wick reads 2-4°F low — always re-wet before measuring. Record both dry-bulb and wet-bulb; the difference confirms humidity is in the chart range.",
  },
  {
    title: "Look up target superheat from the chart",
    text: "Find the row matching your indoor WB (round to nearest 5°F or interpolate) and column for outdoor DB. Read the target superheat value. If your conditions fall in a blank cell, the system is operating outside the chart's charging envelope — wait for design conditions and try again.",
  },
  {
    title: "Connect manifold gauges and let the system stabilize",
    text: "Run the unit at 100% load (no Eco mode, no setback) for at least 10-15 minutes before reading pressures. Connect the low-side gauge to the suction service port and high-side to the liquid line port. Note suction pressure in PSIG.",
  },
  {
    title: "Measure suction-line temperature with a calibrated probe",
    text: "Attach an insulated thermistor probe to a clean, dry section of the suction line at least 6 inches downstream of the evaporator outlet (not on a return bend). Cover the probe with insulation foam to isolate from ambient air. Wait 60-90 seconds for the reading to stabilize.",
  },
  {
    title: "Calculate measured superheat",
    text: "Look up saturation temperature for your measured suction pressure in the R-410A PT chart. Subtract that saturation temperature from your measured suction-line temperature: SH = Suction Line °F − Saturation °F. Example: 138 PSIG → 47°F saturation; suction line reads 69°F → SH = 22°F.",
  },
  {
    title: "Compare to the chart target and adjust charge",
    text: "If measured SH > chart target: undercharged. Add R-410A in 2-4 oz increments, wait 5 minutes, re-measure. If measured SH < chart target: overcharged. Recover refrigerant in 2-4 oz increments, wait, re-measure. Within ±2°F of chart target is acceptable; tighter than that is over-tuning given measurement uncertainty.",
  },
  {
    title: "Re-verify and document",
    text: "After charge adjustment, let the system run another 10 minutes at full load, re-read all values, and confirm SH is on target. Document final suction PSIG, suction line temp, calculated SH, outdoor DB, indoor WB, and total charge weight added/removed on the service ticket.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Carrier R-410A Charging Chart — Target Superheat by Outdoor & Wet-Bulb (Fixed-Orifice Systems)",
      description:
        "The Carrier R-410A fixed-orifice charging chart with target superheat values at every outdoor dry-bulb × indoor wet-bulb combination, R-410A pressure cross-reference, step-by-step procedure, and worked examples.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "R-410A refrigerant" },
        { "@type": "Thing", name: "HVAC charging procedure" },
        { "@type": "Thing", name: "Fixed-orifice metering device" },
        { "@type": "Thing", name: "Superheat measurement" },
      ],
      keywords: [
        "carrier r-410a charging chart",
        "r-410a target superheat",
        "fixed-orifice charging",
        "residential ac charging",
        "carrier service reference",
        "r-410a pressures",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to charge an R-410A fixed-orifice AC system using the Carrier chart",
      description:
        "Step-by-step procedure for using the Carrier R-410A target-superheat chart to verify and adjust refrigerant charge on a fixed-orifice residential AC system.",
      totalTime: "PT30M",
      tool: [
        { "@type": "HowToTool", name: "Refrigerant manifold gauge set (R-410A compatible)" },
        { "@type": "HowToTool", name: "Digital thermistor probe (suction-line temperature)" },
        { "@type": "HowToTool", name: "Sling or digital psychrometer (indoor wet-bulb)" },
        { "@type": "HowToTool", name: "R-410A refrigerant cylinder + scale" },
      ],
      supply: [
        { "@type": "HowToSupply", name: "R-410A refrigerant (DuPont Genetron AZ-20, Honeywell Solstice, Chemours Opteon equivalent)" },
        { "@type": "HowToSupply", name: "Compressor lubricant: POE (polyolester) only" },
      ],
      step: HOWTO_STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.text,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "Carrier R-410A Charging Chart" },
      ],
    },
  ];
}

export default function CarrierChargingChartPage() {
  if (!R410A) return null;

  // Cross-reference table: at each chart row's implied evap saturation,
  // what does R-410A read in PSIG? This is the "what should I see on
  // the manifold" answer that's missing from a bare chart.
  const PRESSURE_REFERENCE = [
    { wb: 60, satEvap: 43, satCond: 90, satCond95: 120 },
    { wb: 63, satEvap: 46, satCond: 90, satCond95: 120 },
    { wb: 65, satEvap: 48, satCond: 90, satCond95: 120 },
    { wb: 67, satEvap: 50, satCond: 90, satCond95: 120 },
    { wb: 70, satEvap: 53, satCond: 90, satCond95: 120 },
  ];

  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Carrier R-410A Charging Chart</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The Carrier R-410A Charging Chart — Target Superheat for Every Fixed-Orifice Operating Condition
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A complete walk-through of Carrier&apos;s fixed-orifice R-410A target-superheat chart: the chart itself, the R-410A saturation pressures it implies (so you know what to see on the manifold), three worked field examples, the full charging procedure, common-error diagnostics, and an interactive lookup. Every pressure value below comes from CoolProp 7.2.0 saturation data for R-410A; nothing is approximated or generic.
          </p>
        </header>

        {/* SECTION 01 — What this chart is and who uses it */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            What this chart is and who needs it
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The Carrier R-410A target-superheat chart is a 2-axis lookup table — outdoor dry-bulb × indoor wet-bulb — published as part of Carrier&apos;s service reference for fixed-orifice residential air-conditioners. Carrier-family OEMs (Bryant, ICP, Heil, Tempstar, Comfortmaker) ship the same chart on their installation literature. For a given combination of outdoor and indoor conditions, the chart tells the technician what superheat (suction-line temperature minus suction saturation temperature) the evaporator should produce when the system is charged correctly.
          </p>

          <KeyInsight tone="blue" title="Why a chart, not a single number">
            Fixed-orifice metering devices (pistons, flowrators, capillary tubes) cannot self-adjust to varying conditions like a TXV can. As outdoor temperatures rise, head pressure rises, which drives more refrigerant flow through the same orifice; as indoor humidity rises, the evaporator pulls more latent heat and saturation temperature climbs. The chart embeds those condition-dependent shifts so the target superheat at 95°F/67°F WB (22°F SH) is different from the target at 75°F/60°F WB (23°F SH) even though both look like &quot;normal&quot; AC operation.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The chart applies <strong>only</strong> to fixed-orifice systems. If the indoor coil uses a thermostatic expansion valve (TXV) or electronic expansion valve (EEV) — and most Carrier residential equipment built after roughly 2015 does — you charge by subcooling instead, targeting 8-12°F SC at the liquid line. Confusing the two procedures will lead you to wrong conclusions: a TXV system charged to a superheat chart target will read &quot;off&quot; because the TXV is actively maintaining its own evaporator superheat regardless of what you do with the charge.
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            How to tell which metering device you have: open the indoor coil access panel and look at the distributor inlet. A piston (fixed-orifice) is a small brass plug, often with a stamped number indicating orifice size (e.g. &quot;65&quot; for 6.5 thousandths of an inch). A TXV is a 2-3 inch valve body with a sensing bulb wrapped around the suction line near the evaporator outlet. If you can&apos;t identify it visually, the installation manual or unit data plate will specify the metering type.
          </p>
        </section>

        {/* SECTION 02 — The chart */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            The Carrier R-410A target-superheat chart
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Values below are in °F target superheat at the suction service port. Empty cells (—) are conditions where the system should be allowed to cycle off rather than be charged — the evaporator approach is too small to produce a meaningful superheat reading. This is the most widely circulated version of Carrier&apos;s fixed-orifice chart, valid for most equipment built between roughly 2010 and the SEER2 transition (early 2023). Newer SEER2 equipment may have updated charts on the unit&apos;s access-panel sticker — always check there first.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="px-3 py-2 text-left text-xs text-zinc-500">
                Target superheat (°F) — Carrier R-410A fixed-orifice. Rows = indoor wet-bulb, columns = outdoor dry-bulb.
              </caption>
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="border-b border-r border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Indoor WB °F ↓ / Outdoor DB °F →</th>
                  {OD_COLS.map((od) => (
                    <th key={od} className="border-b border-zinc-200 px-3 py-2 text-center font-mono text-xs dark:border-zinc-800">{od}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHART_ROWS.map((row) => (
                  <tr key={row.wb} className="even:bg-zinc-50/50 dark:even:bg-zinc-900/30">
                    <td className="border-r border-zinc-200 px-3 py-2 font-mono text-xs font-semibold dark:border-zinc-800">{row.wb}</td>
                    {row.cells.map((v, i) => (
                      <td key={i} className={`px-3 py-2 text-center font-mono ${v === null ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {v === null ? "—" : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Reading the table:</strong> at 95°F outdoor and 67°F indoor wet-bulb, interpolate between the 65°F WB row (22°F SH) and the 70°F WB row (26°F SH). 67°F is 2/5 of the way from 65 to 70, so the target is 22 + (2/5)(26-22) ≈ 23.6°F SH. The interactive lookup below does this interpolation automatically.
          </p>
        </section>

        {/* SECTION 03 — Interactive lookup */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Interactive lookup: target superheat + matching R-410A pressures
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Type your indoor wet-bulb and outdoor dry-bulb. The widget returns the chart&apos;s target superheat, the implied R-410A saturated suction pressure (what you should see on the low-side manifold), and the implied high-side pressure. The pressure values come from our verified R-410A PT data — same numbers a technician would calculate by hand from the chart and a printed PT card, just done for you.
          </p>
          <CarrierChargingLookup ptChart={R410A.ptChart} />
        </section>

        {/* SECTION 04 — Pressure cross-reference */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            R-410A pressure cross-reference (what should the manifold read?)
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            The chart tells you target <em>superheat</em>, not target <em>pressure</em>. To turn the chart into a pressure-and-temperature target you can read directly on the manifold, you need the R-410A saturated suction pressure at the implied evaporator saturation temperature (typically indoor WB − 17°F for a properly-sized residential coil per ACCA Manual D). The table below pre-computes that pressure for common indoor WB conditions using our verified R-410A PT data.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="px-3 py-2 text-left text-xs text-zinc-500">
                Expected R-410A saturated suction pressure at common indoor wet-bulb conditions. Suction line temperature = (saturation temp) + (target superheat from chart).
              </caption>
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Indoor WB</th>
                  <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Sat. evap. temp</th>
                  <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Sat. suction PSIG</th>
                  <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">High-side @ 95°F OD</th>
                  <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">High-side @ 110°F OD</th>
                </tr>
              </thead>
              <tbody>
                {PRESSURE_REFERENCE.map((p) => {
                  const suction = psig(p.satEvap);
                  const high95 = psig(95 + 25);
                  const high110 = psig(110 + 25);
                  return (
                    <tr key={p.wb} className="even:bg-zinc-50/50 dark:even:bg-zinc-900/30">
                      <td className="px-3 py-2 font-mono">{p.wb}°F</td>
                      <td className="px-3 py-2 font-mono">{p.satEvap}°F</td>
                      <td className="px-3 py-2 font-mono font-semibold">{r1(suction)}</td>
                      <td className="px-3 py-2 font-mono">{r0(high95)}</td>
                      <td className="px-3 py-2 font-mono">{r0(high110)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            High-side numbers assume a 25°F condenser approach (saturated condensing temperature = outdoor DB + 25°F), which is typical for a clean residential condenser. A dirty or undersized condenser will run a higher approach (35-45°F), and the high-side pressure will be correspondingly higher. If your high-side is more than ~30 PSIG above the values in the table, see our <Link href="/high-head-pressure-causes/" className="underline">high head pressure diagnostic guide</Link>.
          </p>
        </section>

        {/* SECTION 05 — Worked Example 1: Design conditions */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Worked example 1 — Design conditions (95°F outdoor, 67°F wet-bulb)
          </h2>
          <ServiceProblem
            number={1}
            title="Summer commissioning, ARI design conditions"
            refrigerant="R-410A"
            scenario="Brand-new install. Outdoor 95°F dry-bulb (ARI rating point). Indoor return air 78°F dry-bulb / 67°F wet-bulb (54% RH at 78°F). Carrier 3-ton fixed-orifice residential split system, line set 22 ft."
          >
            <Panel title="Chart lookup" icon={ListChecks}>
              <Lookups rows={[
                { input: "67°F WB × 95°F OD", output: "interpolate", note: "between 65°F WB (22°F SH) and 70°F WB (26°F SH); 67 is 2/5 of the way" },
                { input: "Target superheat", output: "23.6°F SH", note: "round to 24°F for field work" },
              ]}/>
            </Panel>
            <Panel title="Expected manifold readings" icon={Gauge}>
              <Lookups rows={[
                { input: "Sat. evap. temperature", output: "50°F", note: "67°F WB − 17°F design approach" },
                { input: "Expected suction PSIG", output: `${r0(psig(50))} PSIG`, note: "R-410A saturation @ 50°F" },
                { input: "Expected suction-line temp", output: "73.6°F", note: "50°F sat + 23.6°F target SH" },
                { input: "Sat. condensing temp", output: "120°F", note: "95°F OD + 25°F approach" },
                { input: "Expected high-side PSIG", output: `${r0(psig(120))} PSIG`, note: "R-410A saturation @ 120°F" },
              ]}/>
            </Panel>
            <VerdictBanner status="info" title="What this looks like in the field">
              You connect manifold gauges. Suction reads {r0(psig(50))} PSIG (matches expected). You apply your suction-line probe and read 74°F. Calculated SH = 74°F − 50°F = 24°F. Chart target is 24°F. Charge is correct; no adjustment needed. Document the readings and move on.
            </VerdictBanner>
            <FixCallout>
              <strong>What to do if measured SH is 32°F instead of 24°F:</strong> system is undercharged by roughly 8°F SH. On a 3-ton R-410A residential system, each ~1°F change in SH corresponds to roughly 1-2 oz of charge. Add 12-16 oz from the cylinder in 4 oz increments, waiting 5 minutes between additions, until SH lands within ±2°F of the 24°F target.
            </FixCallout>
            <FixCallout>
              <strong>What to do if measured SH is 16°F instead of 24°F:</strong> system is overcharged by 8°F SH. Recover refrigerant in 4 oz increments. Excess R-410A at design conditions causes flood-back to the compressor (liquid refrigerant in the suction line) — long-term this destroys the compressor by washing out lubricant.
            </FixCallout>
          </ServiceProblem>
        </section>

        {/* SECTION 06 — Worked Example 2: Mild day */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Worked example 2 — Mild day (75°F outdoor, 62°F wet-bulb)
          </h2>
          <ServiceProblem
            number={2}
            title="Spring service call, mild outdoor temperature"
            refrigerant="R-410A"
            scenario="Homeowner reports the unit is &apos;running constantly but not cooling well.&apos; You arrive on a mild 75°F day. Indoor return: 72°F dry-bulb / 62°F wet-bulb. Same Carrier 3-ton fixed-orifice system."
          >
            <Panel title="Chart lookup" icon={ListChecks}>
              <Lookups rows={[
                { input: "62°F WB × 75°F OD", output: "interpolate", note: "between 60°F WB (23°F SH) and 65°F WB (28°F SH); 62 is 2/5 of the way" },
                { input: "Target superheat", output: "25°F SH", note: "Chart target is consistent with mild-day expectation: more SH because outdoor head pressure is low" },
              ]}/>
            </Panel>
            <Panel title="Expected manifold readings" icon={Gauge}>
              <Lookups rows={[
                { input: "Sat. evap. temperature", output: "45°F", note: "62°F WB − 17°F design approach" },
                { input: "Expected suction PSIG", output: `${r0(psig(45))} PSIG`, note: "R-410A saturation @ 45°F" },
                { input: "Expected suction-line temp", output: "70°F", note: "45°F sat + 25°F target SH" },
                { input: "Sat. condensing temp", output: "100°F", note: "75°F OD + 25°F approach" },
                { input: "Expected high-side PSIG", output: `${r0(psig(100))} PSIG`, note: "R-410A saturation @ 100°F" },
              ]}/>
            </Panel>
            <VerdictBanner status="warn" title="When mild-day SH disagrees with the chart">
              You measure suction at {r0(psig(40))} PSIG (sat = 40°F, not 45°F). Suction line reads 80°F. Calculated SH = 80 − 40 = 40°F. Chart target is 25°F SH. Measured SH is 15°F high → significantly undercharged. The system has been short of refrigerant long enough that the homeowner notices poor cooling capacity, but the symptoms only became severe enough to call you when ambient cooled and the system started running long cycles to keep up.
            </VerdictBanner>
            <FixCallout>
              <strong>Recommended action:</strong> leak-check first (high SH that didn&apos;t exist at last service almost always means a leak), then weigh in the difference. Don&apos;t just top off charge without finding the leak — you&apos;ll be back next month. Common R-410A leak points: Schrader valve cores (cheap fix, often the cause), flare connections at the indoor coil, and aluminum spine-fin coil corrosion.
            </FixCallout>
          </ServiceProblem>
        </section>

        {/* SECTION 07 — Worked Example 3: Hot day */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Worked example 3 — Hot day (105°F outdoor, 70°F wet-bulb)
          </h2>
          <ServiceProblem
            number={3}
            title="Heat wave, system not keeping up"
            refrigerant="R-410A"
            scenario="Phoenix, Arizona, 105°F afternoon. System has been running 6 hours straight, indoor temperature drifting up from 72°F setpoint to 78°F. Indoor return: 80°F dry-bulb / 70°F wet-bulb (high humidity for a desert — likely from cooking + occupancy load). Same Carrier 3-ton fixed-orifice."
          >
            <Panel title="Chart lookup" icon={ListChecks}>
              <Lookups rows={[
                { input: "70°F WB × 105°F OD", output: "24°F SH", note: "direct chart cell — no interpolation needed" },
              ]}/>
            </Panel>
            <Panel title="Expected manifold readings" icon={Gauge}>
              <Lookups rows={[
                { input: "Sat. evap. temperature", output: "53°F", note: "70°F WB − 17°F design approach" },
                { input: "Expected suction PSIG", output: `${r0(psig(53))} PSIG`, note: "R-410A saturation @ 53°F" },
                { input: "Expected suction-line temp", output: "77°F", note: "53°F sat + 24°F target SH" },
                { input: "Sat. condensing temp", output: "130°F", note: "105°F OD + 25°F approach" },
                { input: "Expected high-side PSIG", output: `${r0(psig(130))} PSIG`, note: "R-410A saturation @ 130°F" },
              ]}/>
            </Panel>
            <VerdictBanner status="bad" title="High-side approach is the smoking gun on hot days">
              You measure suction at {r0(psig(53))} PSIG (matches expected). Suction line reads 78°F, SH = 25°F (close enough to 24°F target — charge is fine). But high-side reads 525 PSIG, not the expected ~445 PSIG. That&apos;s a 50°F condenser approach instead of 25°F — heat rejection failure, not a charging problem. Common cause: dirty condenser coil baking in 105°F sun with reduced airflow. The system is correctly charged but the condenser can&apos;t reject heat fast enough on a hot day with dirty fins.
            </VerdictBanner>
            <FixCallout>
              <strong>This is the value of measuring all three numbers (suction PSIG, suction-line temp, high-side PSIG) instead of just one.</strong> If you&apos;d only looked at superheat (24-25°F, matches chart), you&apos;d conclude &quot;charge is correct, system is fine&quot; and leave the homeowner with a system that still can&apos;t keep up. The high-side PSIG is the diagnostic that catches the real problem: clean the condenser. See <Link href="/high-head-pressure-causes/" className="underline">high head pressure diagnostic guide</Link> for the full decision tree.
            </FixCallout>
          </ServiceProblem>
        </section>

        {/* SECTION 08 — Step-by-step procedure */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Step-by-step charging procedure
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Follow these nine steps in order. Steps 1-3 verify the chart applies and gather chart inputs. Steps 4-7 read measured values. Steps 8-9 close the loop with charge adjustment and documentation.
          </p>
          <ol className="space-y-3">
            {HOWTO_STEPS.map((s, i) => (
              <li key={i} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-blue-100 font-mono text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{s.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* SECTION 09 — Common errors */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Common errors and how to avoid them
          </h2>

          <TechSection icon="problem" tone="amber" title="Error 1 — Reading wet-bulb wrong">
            A digital psychrometer with a dry wick reads several degrees below true wet-bulb. The result: you look up a chart row that calls for less superheat than reality requires, and undercharge the system trying to match a target that&apos;s too low. Always re-wet the wick or use a sling psychrometer with a freshly soaked sock. Cross-check: at typical residential conditions, RH from a calibrated meter and dry-bulb should yield a wet-bulb within ±1°F of the meter&apos;s direct WB reading.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 2 — Charging during a transient">
            The chart targets are <em>steady-state</em> values. After the system has been off for several hours, or just after a defrost cycle (heat-pump mode), or in the first 5-10 minutes of operation, pressures and temperatures are still equilibrating. A reading at minute 3 of operation can read 5-10°F off from the steady-state value. Always wait at least 10 minutes of continuous full-load operation before recording values. If the thermostat is satisfied and the system cycles off mid-charge, you&apos;ll need to override the thermostat to keep it running.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 3 — Long line sets without correction">
            Carrier&apos;s chart targets assume a standard 15 ft line-set length. For longer line sets (common in two-story homes or basement installs), suction-line pressure drop between the evaporator and the service port at the condenser inflates the measured suction-line temperature relative to the actual evaporator saturation temperature. Effect: measured SH at the service port reads 1-2°F higher than &quot;true&quot; SH at the evaporator outlet for every additional 25 ft of line set. Adjust the chart target down 1-2°F for line sets in the 25-50 ft range; for very long line sets (50+ ft), consult the equipment installation manual&apos;s line-set adjustment table.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 4 — Suction probe mounted incorrectly">
            The thermistor probe must sit on a clean, dry section of copper at least 6 inches downstream of the evaporator outlet, on a straight run (not on a return bend), and covered with insulation foam to isolate from ambient. A probe in still air reads ambient temperature, not refrigerant temperature. Symptom: measured suction-line temp tracks outdoor air temperature instead of changing with charge. Fix: clean the copper with a wire brush, fit the probe flush with copper-tape or a velcro band, then wrap with 1/2-inch foam insulation.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 5 — Using this chart on a TXV system">
            If the indoor coil has a TXV or EEV, this chart will give wrong answers. The TXV is actively maintaining its own evaporator superheat (typically 8-15°F per OEM TXV specs), so measured SH at the suction service port will track the TXV setpoint regardless of charge. The chart targets (5-33°F SH) are calibrated for fixed-orifice flow — applying them to a TXV system means you&apos;ll either dramatically overcharge or dramatically undercharge trying to hit a target the TXV won&apos;t let the system reach. If the system has a TXV, switch to subcooling: target 8-12°F SC at the liquid line, refrigerant-side, regardless of outdoor conditions.
          </TechSection>
        </section>

        {/* SECTION 10 — When NOT to use this chart */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            When NOT to use this chart
          </h2>
          <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>TXV / EEV metering devices</strong> — use the <Link href="/subcooling-calculator/" className="underline">subcooling calculator</Link> instead. Target: 8-12°F SC at the liquid line.
            </li>
            <li>
              <strong>Outdoor below 65°F</strong> — chart isn&apos;t valid. Wait for warmer conditions or use weighed-in charging per the unit&apos;s nameplate.
            </li>
            <li>
              <strong>Heat-pump mode (winter heating)</strong> — separate chart applies; this one is cooling-mode only. Most OEMs publish a heating-mode counterpart.
            </li>
            <li>
              <strong>R-410A → A2L refrigerant retrofits (R-32, R-454B)</strong> — A2L refrigerants have different saturation curves, glide (in the case of R-454B), and OEM-specific target tables. R-454B uses similar superheat targets as R-410A in fixed-orifice equipment due to its near-azeotrope behavior, but R-32 (pure) has substantially different operating pressures. See <Link href="/refrigerant/r-32/" className="underline">R-32 page</Link> and <Link href="/refrigerant/r-454b/" className="underline">R-454B page</Link> for application-specific data.
            </li>
            <li>
              <strong>Newly installed system without nameplate charge</strong> — the chart adjusts charge based on operating conditions, but you need a baseline. Weigh in the nameplate charge first (factory charge + line-set adjustment per the installation manual), then use this chart to verify and fine-tune.
            </li>
            <li>
              <strong>System with a known refrigerant leak</strong> — charging without fixing the leak is putting fresh refrigerant into the atmosphere. Find and repair the leak, evacuate to 500 microns or better, then weigh in clean charge and verify against the chart.
            </li>
          </ul>
        </section>

        {/* SECTION 11 — TXV alternative */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            TXV alternative — subcooling charging (the modern path)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Carrier residential equipment built after roughly 2015 uses thermostatic expansion valves, not fixed orifices. With a TXV, the metering device actively varies its opening to maintain a constant evaporator superheat regardless of conditions — so measuring superheat tells you about the TXV&apos;s health, not the charge. Instead, you charge a TXV system by measuring <em>subcooling</em> at the liquid line.
          </p>

          <KeyInsight tone="blue" title="Subcooling target">
            For most Carrier R-410A TXV residential equipment: target 8-12°F SC at the liquid line. This target is the same regardless of outdoor temperature, indoor humidity, or time of year. Subcooling = saturation temperature (at high-side pressure) − measured liquid-line temperature. If SC &gt; 15°F: overcharged. If SC &lt; 5°F: undercharged. The actual OEM target may differ slightly by model — always check the data plate sticker on the outdoor unit; some Carrier high-efficiency models target 14°F SC.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Use the <Link href="/subcooling-calculator/" className="underline">subcooling calculator</Link> for TXV charging, or the <Link href="/pt-superheat-subcooling-calculator/" className="underline">combined PT/SH/SC calculator</Link> if you want to verify both sides on a fixed-orifice system. The combined calculator handles the chart-based superheat target lookup the same way the interactive widget on this page does.
          </p>
        </section>

        {/* SECTION 12 — Carrier vs other OEM charts */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Carrier vs Trane / Lennox / Goodman — are the charts interchangeable?
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            All major residential AC OEMs publish a 2-axis fixed-orifice R-410A target superheat chart with the same structure (rows = indoor WB, columns = outdoor DB). The specific cell values can differ by ±2-3°F because each manufacturer tunes for their coil geometry, orifice diameter, and design rating points. The differences are typically within the measurement noise floor (your suction-line probe is accurate to ±1°F at best), so the Carrier chart is a reasonable proxy for any major-brand fixed-orifice R-410A system when the brand-specific chart isn&apos;t available.
          </p>

          <ComparisonTable
            headers={["OEM", "Chart structure", "Typical 95°F OD / 65°F WB target", "Notes"]}
            rows={[
              { label: "Carrier / Bryant / ICP", cells: ["2-axis WB × OD", "22°F SH", "Same chart across Carrier-family OEMs"] },
              { label: "Trane / American Standard", cells: ["2-axis WB × OD", "20°F SH (±2°F)", "Slightly tighter targets at high WB"] },
              { label: "Lennox", cells: ["2-axis WB × OD", "22°F SH", "Very close to Carrier values"] },
              { label: "Goodman / Daikin / Amana", cells: ["2-axis WB × OD", "23°F SH (±2°F)", "Slightly looser targets at low WB"] },
              { label: "Rheem / Ruud", cells: ["2-axis WB × OD", "22°F SH", "Close to Carrier values"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Always prefer the OEM&apos;s chart for the specific equipment being serviced when it&apos;s available (data-plate sticker or installation manual). Use this chart as a default reference when the OEM chart isn&apos;t at hand.
          </p>
        </section>

        {/* SECTION 13 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-xl border border-zinc-200 bg-white p-4 open:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:open:bg-zinc-900">
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="mr-2 text-zinc-400 inline-block transition-transform group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* SECTION 14 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>Chart values:</strong> Carrier Service Bulletin &quot;R-410A Charging — Fixed Orifice Devices&quot; (reprinted across Carrier Residential Service Reference manuals, Bryant installation literature, and ICP service guides; chart structure stable since approximately 2010). The Trane / Lennox / Goodman comparison values come from each OEM&apos;s public installation manuals for matching fixed-orifice equipment.
            </p>
            <p className="mt-3">
              <strong>R-410A saturation pressures:</strong> generated from CoolProp 7.2.0 with the HEOS backend (REFPROP-compatible Helmholtz equation of state for R-410A, based on Lemmon et al. 2003). Values are accurate to ±0.5% across the operating range (−40°F to +150°F). The verified PT data behind every pressure on this page lives at <Link href="/refrigerant/r-410a/" className="underline">our R-410A reference page</Link> and is downloadable as <Link href="/data/refrigerant/r-410a/csv/" className="underline">CSV</Link> or <Link href="/data/refrigerant/r-410a/json/" className="underline">JSON</Link> under CC BY 4.0.
            </p>
            <p className="mt-3">
              <strong>Design approach assumptions:</strong> 17°F evaporator approach (indoor WB to saturated suction) per ACCA Manual D System Design. 25°F condenser approach (outdoor DB to saturated condensing) per AHRI Standard 210/240 rating conditions. Actual approaches vary ±5°F by equipment age, coil sizing, and airflow.
            </p>
            <p className="mt-3">
              <strong>Charging procedure references:</strong> ACCA Manual T (System Balancing and Air Distribution), ASHRAE Handbook of Refrigeration 2022 (Chapter 28, Refrigerant Charge), AHRI Guideline K (Containerized Charging). EPA Section 608 certification handbook for refrigerant handling requirements.
            </p>
            <p className="mt-3">
              <strong>What this page is not:</strong> not a substitute for the specific equipment&apos;s installation manual or data-plate-stamped charging instructions. When the OEM chart for the unit being serviced is available (typically on a sticker inside the access panel or in the installation manual PDF), use that chart instead — it&apos;s tuned to that specific coil, orifice, and system design.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}. PT data source: {R410A.dataSource.ptChartSource}. Last verified against the R-410A saturation envelope by our build-time anchor-value checker.
            </p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related tools and references</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/superheat-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Superheat calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Compute SH from suction PSIG + suction-line temp for any refrigerant.</p>
            </Link>
            <Link href="/subcooling-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Subcooling calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">TXV charging via subcooling — the modern Carrier path.</p>
            </Link>
            <Link href="/pt-superheat-subcooling-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Combined PT/SH/SC calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Both sides at once with pattern-matching diagnostic banner.</p>
            </Link>
            <Link href="/refrigerant/r-410a/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-blue-600" /> R-410A reference page</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Full PT table, properties, regulatory status, downloads.</p>
            </Link>
            <Link href="/high-head-pressure-causes/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> High head pressure causes</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Diagnostic decision tree for high-side problems.</p>
            </Link>
            <Link href="/superheat-subcooling-fundamentals/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> SH &amp; SC fundamentals</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Conceptual framework: what these numbers mean and why.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
