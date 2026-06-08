import type { Metadata } from "next";
import Link from "next/link";
import { Table as TableIcon } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassTable } from "@/components/reference/SafetyClassTable";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/refrigerant-safety-classifications/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Refrigerant Safety Classifications — ASHRAE 34",
  description:
    "Searchable table of every common HVAC refrigerant classified per ANSI/ASHRAE Standard 34-2022. A1, A2L, A2, A3, B1, B2L explained with the full table of 61 refrigerants.",
  alternates: { canonical: PAGE_URL },
};

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: "Refrigerant Safety Classifications — ASHRAE 34",
      description:
        "Reference table of HVAC refrigerant safety classifications per ANSI/ASHRAE Standard 34-2022. Every refrigerant in the dataset, sortable and filterable by class and type.",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "Dataset",
      "@id": `${PAGE_URL}#dataset`,
      name: "HVAC Refrigerant Safety Classifications",
      description:
        "ASHRAE 34-2022 safety classifications for 61 common HVAC refrigerants, with toxicity / flammability descriptors and source citations.",
      url: PAGE_URL,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@id": `${SITE_URL}/#organization` },
      isAccessibleForFree: true,
      citation: [
        "ANSI/ASHRAE Standard 34-2022: Designation and Safety Classification of Refrigerants",
        "UL 60335-2-40 (A2L charge limits and equipment design)",
        "EPA Section 608 program documentation",
        "IIAR standards (for B2L ammonia handling)",
      ],
      variableMeasured: [
        { "@type": "PropertyValue", name: "Refrigerant designation" },
        { "@type": "PropertyValue", name: "ASHRAE 34 safety class" },
        { "@type": "PropertyValue", name: "Refrigerant type" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
        { "@type": "ListItem", position: 3, name: "Safety Classifications" },
      ],
    },
  ];
}

export default function SafetyClassificationsPage() {
  const counts = countByClass();

  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Safety Classifications</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Refrigerant Safety Classifications</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            ANSI/ASHRAE Standard 34-2022 classifies refrigerants by toxicity (Class A or B) and flammability
            (Subclass 1, 2L, 2, or 3). The combination — A1, A2L, A3, B1, B2L, and so on — determines equipment
            requirements, charge limits, leak detection, and machine room ventilation under codes including UL
            60335-2-40 and ASHRAE 15.
          </p>
        </header>

        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(["A1", "A2L", "A2", "A3", "B1", "B2L"] as const).map((c) => (
            <div key={c} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <SafetyClassChip safetyClass={c} size="sm" />
                <span className="text-xs font-mono text-zinc-500">{counts[c] ?? 0}/{refrigerants.length}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{shortGloss(c)}</p>
            </div>
          ))}
        </section>

        <TechSection icon="composition" tone="blue" title="How to read the class code">
          <p>
            <strong>Letter (A or B)</strong> indicates toxicity. A-class refrigerants have
            lower toxicity — the Occupational Exposure Limit (OEL) is 400 ppm or higher.
            B-class refrigerants have higher toxicity, with an OEL below 400 ppm.
          </p>
          <Panel title="Flammability subclass — the number / suffix" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Subclass</th>
                    <th className="py-1.5 text-left">Burning velocity</th>
                    <th className="py-1.5 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">1</td><td className="py-1.5 text-xs">No propagation at 60°C in air</td><td className="py-1.5 text-xs">Non-flammable per ASTM E681</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">2L</td><td className="py-1.5 text-xs">≤ 10 cm/s + LHV &lt; 19,000 kJ/kg</td><td className="py-1.5 text-xs">Mildly flammable (added to ASHRAE 34 in 2010 for HFCs/HFOs)</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">2</td><td className="py-1.5 text-xs">10-100 cm/s</td><td className="py-1.5 text-xs">Flammable (uncommon — A2L is usually preferred)</td></tr>
                  <tr><td className="py-1.5 font-mono font-semibold">3</td><td className="py-1.5 text-xs">&gt; 100 cm/s or LHV &gt; 19,000 kJ/kg</td><td className="py-1.5 text-xs">Highly flammable (hydrocarbons)</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <KeyInsight tone="amber" icon="insight" title="Decoding common classes">
            <strong>A2L</strong> = lower toxicity + mildly flammable → R-32, R-454B, R-454C,
            R-1234yf, R-1234ze.{" "}
            <strong>B2L</strong> = higher toxicity + mildly flammable → R-717 (ammonia).{" "}
            <strong>A3</strong> = lower toxicity + highly flammable → R-290 (propane), R-600a
            (isobutane), R-1150 (ethylene), R-1270 (propylene).{" "}
            <strong>A1</strong> = the safest historical class → R-22, R-410A, R-134a, R-404A.
          </KeyInsight>
        </TechSection>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">All refrigerants in the dataset</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Click a column heading to sort. Use the filters to narrow by type or class. Each refrigerant name links to its
            full reference page with PT chart and properties.
          </p>
          <SafetyClassTable />
        </section>

        <TechSection icon="warning" tone="amber" title="A2L deep dive — the residential AC transition class">
          <p>
            A2L is the most consequential safety class for the 2024-2026 HVAC transition.
            R-32 and R-454B (both A2L) are replacing R-410A (A1) as the dominant residential
            AC refrigerants under the AIM Act. The mildly flammable nature of A2L refrigerants
            requires equipment design and installation accommodations that A1 systems
            don&apos;t need.
          </p>
          <Panel title="A2L equipment requirements (UL / IEC 60335-2-40)" icon={TableIcon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Sealed motor enclosures or ignition-source isolation in any enclosure with potential refrigerant accumulation.</li>
              <li>Leak detection (refrigerant sensor + alarm) on larger systems above a charge threshold.</li>
              <li>Charge limit calculation per room floor area: m_max = LFL × 4 × A^0.5 × h_0 (LFL = lower flammability limit, A = room area, h_0 = installation height).</li>
              <li>Mechanical ventilation requirements in some occupancy categories above threshold charge.</li>
              <li>Labeling and installer training (EPA Section 608 expanded for A2L handling in 2025).</li>
            </ul>
          </Panel>
          <Panel title="A2L charge limits per refrigerant (IEC 60335-2-40 Table CC.1)" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Refrigerant</th>
                    <th className="py-1.5 text-right">m_max (kg)</th>
                    <th className="py-1.5 text-right">m_max (lb)</th>
                    <th className="py-1.5 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">R-32</td><td className="py-1.5 text-right font-mono tabular-nums">1.84</td><td className="py-1.5 text-right font-mono tabular-nums">4.05</td><td className="py-1.5 text-xs">2-3 ton residential AC</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">R-454B</td><td className="py-1.5 text-right font-mono tabular-nums">2.18</td><td className="py-1.5 text-right font-mono tabular-nums">4.81</td><td className="py-1.5 text-xs">Slightly higher than R-32</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">R-1234yf</td><td className="py-1.5 text-right font-mono tabular-nums">1.10</td><td className="py-1.5 text-right font-mono tabular-nums">2.42</td><td className="py-1.5 text-xs">Most stringent</td></tr>
                  <tr><td className="py-1.5">R-1234ze</td><td className="py-1.5 text-right font-mono tabular-nums">1.50</td><td className="py-1.5 text-right font-mono tabular-nums">3.31</td><td className="py-1.5 text-xs">Mid-range</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Values for a typical 25 m² room at 2.2 m installation height. Different room
              geometries produce different limits per the formula.
            </p>
          </Panel>
          <p>
            These charge limits drive equipment design for A2L: residential split systems
            above the threshold need either multiple smaller indoor units (distributing
            charge) or single-zone systems sized to stay below the limit per room. For
            installations in tight spaces (closets, small mechanical rooms), additional
            safety devices may be required.
          </p>
        </TechSection>

        <TechSection icon="composition" tone="purple" title="Sector-by-class compatibility guide">
          <p>
            Each safety class fits specific application sectors based on equipment design
            feasibility, charge size, occupancy, and regulatory acceptance.
          </p>
          <Panel title="Safety class → sector applicability" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Class</th>
                    <th className="py-1.5 text-left">Typical applications</th>
                    <th className="py-1.5 text-left">Key requirement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A1</td><td className="py-1.5 text-xs">Residential AC (R-22, R-410A), commercial refrigeration (R-404A, R-448A, R-449A), mobile AC (R-134a), chillers (R-134a, R-513A, R-1233zd)</td><td className="py-1.5 text-xs">Standard ASHRAE 15 — no special equipment</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A2L</td><td className="py-1.5 text-xs">Residential AC (R-32, R-454B), commercial refrigeration (R-454C, R-455A), mobile AC (R-1234yf)</td><td className="py-1.5 text-xs">A2L-rated equipment, charge limits, leak detection (IEC 60335-2-40)</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A2</td><td className="py-1.5 text-xs">Uncommon in HVAC. R-152a (limited mobile AC use)</td><td className="py-1.5 text-xs">Higher burning velocity than A2L; A2L preferred</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A3</td><td className="py-1.5 text-xs">Hydrocarbons — R-290 (propane), R-600a (isobutane), R-1270 (propylene). Hermetic chest freezers, domestic refrigerators</td><td className="py-1.5 text-xs">Small-charge only per IEC 60335-2-89; spark-controlled service</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">B1</td><td className="py-1.5 text-xs">R-123 (centrifugal chillers in dedicated mechanical rooms)</td><td className="py-1.5 text-xs">Machine-room monitoring per ASHRAE 15; R-123 production ends 2030</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">B2L</td><td className="py-1.5 text-xs">R-717 (ammonia) industrial refrigeration — food processing, cold storage, ice rinks</td><td className="py-1.5 text-xs">IIAR 2/9 installation, machine room, full-face SCBA for service</td></tr>
                  <tr><td className="py-1.5 font-mono font-semibold">B3</td><td className="py-1.5 text-xs">Rare. R-1140 historical, specialty industrial only</td><td className="py-1.5 text-xs">Not used in modern HVAC</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </TechSection>

        <TechSection icon="service" tone="emerald" title="Service-side implications by class">
          <p>
            Beyond equipment design, the safety class affects how a technician handles the
            refrigerant in the field.
          </p>
          <Panel title="Service requirements by class" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Class</th>
                    <th className="py-1.5 text-left">Service-side requirements</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A1</td><td className="py-1.5 text-xs">Standard EPA Section 608 procedures. Recovery, recycling, reclaiming per 40 CFR Part 82. Standard electronic leak detectors.</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A2L</td><td className="py-1.5 text-xs">EPA Section 608 + A2L-specific training (added 2025). A2L-rated recovery cylinders. No ignition sources during service (no torch-brazing near open refrigerant, no electrical sparks). Refrigerant-specific leak detectors.</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">A3</td><td className="py-1.5 text-xs">Hydrocarbon-specific training. Spark-resistant tools or all-tools-removed during service. Ventilated spaces only. Small-charge limit (~150 g hermetic).</td></tr>
                  <tr><td className="py-1.5 font-mono font-semibold">B-class</td><td className="py-1.5 text-xs">Class-specific certification (IIAR for ammonia). PPE includes full-face SCBA for ammonia, vapor-resistant suit for fluorinated B. Machine-room procedures and emergency response plans required.</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </TechSection>

        <TechSection icon="climate" tone="zinc" title="Historical evolution — how we got here">
          <p>
            HVAC refrigerant safety classifications have evolved alongside the chemistry
            transitions of the last century.
          </p>
          <Panel title="Timeline of class shifts" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Era</th>
                    <th className="py-1.5 text-left">Refrigerants</th>
                    <th className="py-1.5 text-left">Driver</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">1930s-1970s</td><td className="py-1.5 text-xs">CFCs (R-12, R-11, R-502) — A1 class</td><td className="py-1.5 text-xs">Safe to handle, but ozone-depleting (discovered 1970s)</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">1987-2010s</td><td className="py-1.5 text-xs">HCFCs (R-22, R-123) — A1/B1</td><td className="py-1.5 text-xs">Montreal Protocol forced CFC phase-out; HCFCs are interim lower-ODP option</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">2000s-2020s</td><td className="py-1.5 text-xs">HFCs (R-410A, R-134a, R-404A) — A1</td><td className="py-1.5 text-xs">HCFC phase-out (R-22 ends 2020); HFCs are zero-ODP but high-GWP</td></tr>
                  <tr><td className="py-1.5">2020s-2030s</td><td className="py-1.5 text-xs">A2L (R-32, R-454B, R-454C) + naturals (R-744, R-290, R-717)</td><td className="py-1.5 text-xs">AIM Act + EU F-Gas climate phase-down. First mainstream shift away from A1</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <p>
            The 2020s-2030s shift is structurally different from prior transitions: this is
            the first time HVAC residential equipment design has shifted from A1 to A2L in
            mainstream applications, requiring industry-wide equipment re-certification,
            installation procedure updates, and service training.
          </p>
        </TechSection>

        <TechSection icon="composition" tone="blue" title="How ASHRAE Standard 34 classification is actually determined">
          <p>
            ASHRAE 34 classification is determined by laboratory testing per standardized
            protocols, not by manufacturer self-declaration. Toxicity (A vs B) comes from
            Occupational Exposure Limit testing: Class A = time-weighted OEL ≥ 400 ppm,
            Class B = OEL &lt; 400 ppm. The OEL typically matches the AIHA Workplace
            Environmental Exposure Limit (WEEL) for the substance.
          </p>
          <Panel title="Flammability test methodology (ASTM E681 + heat-of-combustion)" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Subclass</th>
                    <th className="py-1.5 text-left">Test outcome</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">1</td><td className="py-1.5 text-xs">No flame propagation at 60°C / 101.3 kPa in humid air per ASTM E681</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">2L</td><td className="py-1.5 text-xs">Flame propagates, burning velocity ≤ 10 cm/s, LHV &lt; 19,000 kJ/kg, LFL &gt; 0.10 kg/m³. &quot;L&quot; suffix added to ASHRAE 34 in 2010 to accommodate R-32 / R-1234yf</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono font-semibold">2</td><td className="py-1.5 text-xs">Burning velocity 10-100 cm/s. Uncommon — A2L is preferred for similar applications</td></tr>
                  <tr><td className="py-1.5 font-mono font-semibold">3</td><td className="py-1.5 text-xs">Burning velocity &gt; 100 cm/s OR LHV &gt; 19,000 kJ/kg. Hydrocarbons (R-290, R-600a, R-1270)</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="Why A2L matters so much for the 2024-2026 transition">
          <p>
            The AIM Act phase-down forces residential AC away from R-410A (A1, GWP 2088).
            The only sub-700 GWP refrigerants that satisfy residential AC&apos;s pressure
            envelope and equipment design constraints are A2L: R-32 (GWP 675, A2L) and
            R-454B (GWP 466, A2L). There&apos;s no A1 path forward at sub-700 GWP — the
            chemistry of low-GWP refrigerants intrinsically includes mild flammability.
          </p>
          <KeyInsight tone="amber" icon="insight" title="First mainstream A1 → A2L shift in HVAC history">
            HVAC residential equipment design has remained A1 for decades. The
            AIM-Act-driven move to A2L requires equipment re-certification (sealed motor
            enclosures, charge limits per IEC 60335-2-40), installation procedure updates
            (room volume calculations, A2L-rated leak detectors), service training (EPA
            Section 608 expanded with A2L module in 2025), and supply chain adjustments
            (A2L-rated recovery cylinders, fittings).
          </KeyInsight>
        </TechSection>

        <TechSection icon="data" tone="purple" title="Charge limits — the practical A2L constraint">
          <p>
            UL / IEC 60335-2-40 specifies maximum refrigerant charge per room volume based
            on refrigerant flammability characteristics. The formula:{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
              m_max = LFL × 4 × A^0.5 × h_0
            </code>{" "}
            where LFL is the lower flammability limit (kg/m³), A is room floor area (m²),
            and h_0 is installation height (m).
          </p>
          <p>
            For typical residential rooms (25 m² at 2.2 m height): about 1.8 kg (4 lb) for
            R-32 and 2.2 kg (4.8 lb) for R-454B — sufficient for 2-3 ton residential AC.
            Larger systems (5+ ton, large multi-zone) split charge across multiple indoor
            units or use central-ducted systems where refrigerant charge concentrates in
            outdoor / attic-mounted air handlers with only liquid line at the indoor coil.
          </p>
          <p>
            Commercial refrigeration with A2L (R-454C, R-455A) follows IEC 60335-2-89 with
            its own charge limit framework — higher limits because equipment typically sits
            in dedicated rooms or large commercial spaces.
          </p>
        </TechSection>

        <TechSection icon="shield" tone="red" title="B-class refrigerants and machine room requirements">
          <p>
            Class B refrigerants (R-123, R-717 ammonia) are higher-toxicity and require
            purpose-built installations.
          </p>
          <Panel title="B-class installation standards" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Refrigerant</th>
                    <th className="py-1.5 text-left">Class</th>
                    <th className="py-1.5 text-left">Standard</th>
                    <th className="py-1.5 text-left">Use</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">R-123</td><td className="py-1.5 font-mono">B1</td><td className="py-1.5 text-xs">ASHRAE 15 machine-room monitoring</td><td className="py-1.5 text-xs">Centrifugal chillers (production ends 2030)</td></tr>
                  <tr><td className="py-1.5 font-mono">R-717</td><td className="py-1.5 font-mono">B2L</td><td className="py-1.5 text-xs">IIAR 2 (install) + IIAR 9 (min. safety)</td><td className="py-1.5 text-xs">Industrial refrigeration — food processing, cold storage, ice rinks</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <p>
            Both require purpose-built equipment rooms with refrigerant-specific detection,
            emergency response procedures, technician PPE (SCBA for ammonia), and machine-room
            ventilation rated for the specific refrigerant. This is industrial-refrigeration
            territory, not residential or light commercial HVAC.
          </p>
        </TechSection>

        <TechSection icon="source" tone="emerald" title="How to verify a refrigerant's safety class">
          <p>Three authoritative sources for safety classification:</p>
          <Panel title="Authoritative classification sources" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Source</th>
                    <th className="py-1.5 text-left">Coverage</th>
                    <th className="py-1.5 text-left">Access</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5"><strong>ANSI/ASHRAE Standard 34</strong></td><td className="py-1.5 text-xs">Complete list, updated every 3-4 yrs (current: 2022). Composition, classifications, physical properties.</td><td className="py-1.5 text-xs">Purchase from ASHRAE (~$130)</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5"><strong>Manufacturer SDS</strong></td><td className="py-1.5 text-xs">Required by OSHA HazCom (29 CFR 1910.1200). Classification + toxicity + flammability + first-aid + handling.</td><td className="py-1.5 text-xs">Free from manufacturer</td></tr>
                  <tr><td className="py-1.5"><strong>EPA SNAP listing</strong></td><td className="py-1.5 text-xs">SNAP (40 CFR Part 82 Subpart G) — refrigerants approved by end-use sector with use conditions.</td><td className="py-1.5 text-xs">Free at epa.gov/snap</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <p>
            For ground-truth verification on an unfamiliar refrigerant, the manufacturer SDS
            is the most accessible — every refrigerant cylinder arrives with an SDS in
            shipment paperwork, and the manufacturer&apos;s website hosts the current SDS for
            download. Cross-check with EPA SNAP for approved applications.
          </p>
        </TechSection>

        <TechSection icon="insight" tone="emerald" title="Why classifications matter for everyday work">
          <p>
            Beyond the obvious safety implications, the ASHRAE 34 classification drives a
            cascade of practical decisions:
          </p>
          <Panel title="Downstream consequences of safety class" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Decision area</th>
                    <th className="py-1.5 text-left">Class-driven impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5"><strong>Service equipment selection</strong></td><td className="py-1.5 text-xs">A2L = spark-resistant tools + A2L-rated detection. A3 = stricter ignition-source controls. B-class = class-specific PPE + machine room.</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5"><strong>Installation location &amp; sizing</strong></td><td className="py-1.5 text-xs">A2L charge limits (IEC 60335-2-40) affect closet vs distributed-indoor-unit decision. B-class mandates dedicated equipment rooms.</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5"><strong>Technician certification</strong></td><td className="py-1.5 text-xs">EPA Section 608 has class endorsements; some jurisdictions require additional A2L / A3 training beyond base 608.</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5"><strong>Building code compliance</strong></td><td className="py-1.5 text-xs">ASHRAE 15 sets occupancy-based refrigerant quantity limits by safety class. Some commercial occupancies (assembly, healthcare, detention) have stricter limits.</td></tr>
                  <tr><td className="py-1.5"><strong>Insurance &amp; warranty</strong></td><td className="py-1.5 text-xs">Building insurance + equipment warranty often reference compliance with ASHRAE 15 + UL 60335-2-40 (A2L) + IIAR 2/9 (ammonia). Improper installation voids coverage.</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <KeyInsight tone="emerald" icon="insight" title="Classifications aren't bureaucracy">
            They&apos;re the structural framework that determines how the refrigerant can be
            used safely. The full ASHRAE 34 standard codifies decades of accident analysis
            and safety engineering judgment; the classifications carry weight precisely
            because they reflect what went wrong historically with the wrong refrigerant in
            the wrong application.
          </KeyInsight>
        </TechSection>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ANSI/ASHRAE Standard 34-2022: Designation and Safety Classification of Refrigerants</li>
            <li>UL 60335-2-40 (A2L charge limits, equipment design, leak detection requirements)</li>
            <li>ASHRAE Standard 15 (machine room ventilation, refrigerant detection)</li>
            <li>EPA Section 608 program documentation (technician certification, refrigerant management)</li>
            <li>IIAR standards (industrial ammonia refrigeration — B2L handling)</li>
          </ul>
          <p className="mt-3">
            Classifications are stored as a Zod-validated enum on each refrigerant record (<code>r.safetyClass</code>). The
            rendering on this page and across the site reads that field directly — it is structurally impossible to render
            the wrong class for a refrigerant once the enum value is set correctly.
          </p>
        </footer>
      </article>
    </>
  );
}

function countByClass() {
  const out: Record<string, number> = {};
  for (const r of refrigerants) {
    out[r.safetyClass] = (out[r.safetyClass] ?? 0) + 1;
  }
  return out;
}

function shortGloss(c: string): string {
  switch (c) {
    case "A1": return "Lower toxicity, no flame propagation. The safest category.";
    case "A2L": return "Lower toxicity, low burning velocity. Requires A2L-rated equipment + leak detection.";
    case "A2": return "Lower toxicity, flammable. Uncommon in HVAC.";
    case "A3": return "Lower toxicity, highly flammable. Hydrocarbon class — propane, isobutane, ethylene, propylene.";
    case "B1": return "Higher toxicity, no flame propagation. R-123 and other centrifugal-chiller refrigerants.";
    case "B2L": return "Higher toxicity, low burning velocity. Ammonia class — industrial refrigeration.";
    default: return "";
  }
}
