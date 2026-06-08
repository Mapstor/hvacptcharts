import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { RetrofitCompatibilityCalculator } from "@/components/calculators/RetrofitCompatibilityCalculator";
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
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "How is the compatibility verdict computed?",
    a: "The calculator evaluates five criteria from the data layer: (1) lubricant compatibility — does the intersection of existing and target lubricants include anything? (2) safety class transition — A1 to A2L requires equipment changes; A to B is essentially impossible. (3) Pressure envelope — pressures within 10% are OK; 10-25% requires verification; over 25% requires equipment-level changes. (4) Temperature glide — pure to high-glide blend may require TXV adjustment. (5) Application family — refrigerants in different application groups rarely swap successfully. The overall verdict synthesizes these into one of six categories from 'drop-in' to 'not feasible'.",
  },
  {
    q: "What does 'drop-in retrofit possible' mean?",
    a: "Same lubricant family, same safety class, pressures within 10%, similar glide character, and shared application family. Drop-in still means following standard retrofit procedure (recover, replace filter-drier, pull vacuum, charge by weight) but doesn't require oil change, equipment modifications, or component upgrades. The R-22 retrofit family (R-417A, R-422D, R-427A, R-438A) achieves this designation by having mineral-oil compatibility plus pressures similar to R-22.",
  },
  {
    q: "Why does R-22 to R-410A return 'not recommended' instead of 'equipment modifications required'?",
    a: "Because R-410A's pressures are roughly 60% higher than R-22's — exceeding the pressure ratings of R-22 system components by a margin that makes component replacement (essentially the whole system) more expensive than a new R-410A system. The verdict reflects field reality: R-22 to R-410A is full equipment replacement, not retrofit, in nearly every case.",
  },
  {
    q: "Can I use this for residential AC retrofit planning?",
    a: "Yes for the structural decision (whether retrofit is feasible) but consult equipment OEM service literature for the specific equipment's approved refrigerant list. The calculator's analysis is generic to the refrigerant pair; equipment-specific compatibility depends on the specific compressor, expansion device, and electrical components that the OEM has certified for each refrigerant.",
  },
  {
    q: "Why is ammonia retrofit always 'not feasible'?",
    a: "B-class refrigerants (B1, B2L) use purpose-built equipment systems incompatible with A-class HVAC. Ammonia uses steel piping (it attacks copper), specific lubricants (mineral oil or PAO, never POE), specialized safety equipment (IIAR-rated machine rooms, ammonia-specific leak detection, full-face SCBA for service), and refrigerant-specific compressor designs. No refrigerant-swap retrofit between ammonia and any other refrigerant is realistic; new installations are designed from scratch as ammonia or non-ammonia systems.",
  },
  {
    q: "What about CO2 (R-744) retrofit?",
    a: "Also generally not feasible as a refrigerant swap. R-744 systems operate at very high pressures (transcritical above ~1300 PSIG high-side), use specific CO2-rated POE lubricants, and have purpose-built component pressure ratings (typically 130 bar / ~1900 PSIG). There is no meaningful refrigerant-swap path from HFC systems to R-744; the realistic transition is full equipment replacement with CO2 transcritical equipment at end of equipment life.",
  },
  {
    q: "Why use this calculator instead of just reading the per-refrigerant pages?",
    a: "Per-refrigerant pages document each refrigerant in isolation; this calculator evaluates the specific pair-wise decision. The structural questions (same lubricant? same safety class? compatible pressures? acceptable glide change? matching application?) require comparing two records simultaneously — which is what the calculator does automatically. For one-off retrofit questions, the calculator is faster than cross-referencing two refrigerant pages.",
  },
];

export const metadata: Metadata = {
  title: "Refrigerant Retrofit Compatibility Calculator",
  description:
    "Evaluate refrigerant retrofit feasibility from any existing refrigerant to any target. Five-criterion analysis: lubricant, safety class, pressure, glide, application. Verdict from 'drop-in' to 'not feasible' with specific recommendations.",
  alternates: { canonical: `${SITE_URL}/refrigerant-retrofit-compatibility-calculator/` },
};

export default function RetrofitCompatibilityCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "refrigerant-retrofit-compatibility-calculator",
        name: "Refrigerant Retrofit Compatibility Calculator",
        description:
          "Pair-comparison decision tool for refrigerant retrofit feasibility. Evaluates lubricant compatibility, safety class transition, pressure envelope, temperature glide, and application family.",
        featureList: [
          "Pair-wise compatibility analysis for any two of 61 refrigerants",
          "Five-criterion evaluation: lubricant, safety class, pressure, glide, application",
          "Six-category verdict: drop-in, retrofit with oil change, equipment mods required, not recommended, not feasible",
          "Specific recommendations per pair based on the failure modes detected",
          "Built on the verified data layer; no fabricated decision rules",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Retrofit Compatibility Calculator",
      }}
      introOneLiner="Enter the existing refrigerant and the target replacement; the calculator evaluates compatibility across five criteria (lubricant, safety class, pressure, glide, application) and returns a verdict plus specific recommendations."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the existing refrigerant in the system from the first dropdown. Defaults to R-22 (the most common retrofit-source refrigerant in current US practice).",
          "Pick the target replacement refrigerant from the second dropdown. Defaults to R-407C (a common R-22 retrofit option).",
          "Read the verdict at the top — color-coded from green (drop-in) to red (not feasible).",
          "Review the per-criterion table for the specific issues detected (lubricant mismatch, pressure exceeds rating, etc.).",
          "Follow the numbered recommendations for the actual service procedure.",
        ],
        commonErrors: [
          "Treating the calculator as authoritative for a specific piece of equipment — it's pair-wise refrigerant analysis, not equipment-specific compatibility. Always verify the OEM service literature for the specific equipment.",
          "Assuming 'drop-in retrofit possible' means no work required. Even drop-in retrofits require recovery, filter-drier replacement, vacuum, and recharge per EPA Section 608 — they just don't require oil change or equipment modifications.",
          "Ignoring the verdict's specific reasoning in favor of the headline. 'Not recommended (pressure)' tells you a different story than 'Not feasible (lubricant incompatible)'.",
        ],
      }}
      math={{
        formula:
          "verdict = synthesize(lubricantCheck, safetyClassCheck, pressureCheck, glideCheck, applicationCheck)\n\nEach check has severity ∈ {ok, warn, fail}. The synthesis prioritizes fails (application > safety > pressure > lubricant) and then collapses warns into 'retrofit with modifications' verdicts.",
        sourceCitation:
          "Lubricant compatibility: refrigerant.lubricants.compatible arrays from manufacturer datasheets and ASHRAE Handbook of Refrigeration 2022. Safety class transitions: UL 60335-2-40 (A2L charge limits), ASHRAE Standard 15 (machine room ventilation), ASHRAE 34-2022 (classification definitions). Pressure thresholds (10%, 25%) reflect typical equipment pressure-rating margins per manufacturer service literature. Application family memberships: editorial groupings in src/data/comparison-groups.ts.",
        workedExample:
          "R-22 → R-407C:\n  Lubricant: MO/AB vs POE — different families, oil change required (warn)\n  Safety: A1 → A1 unchanged (ok)\n  Pressure: 121.4 PSIG vs 140.5 / 117.3 PSIG at 70°F — within 10% (ok)\n  Glide: pure → 23 PSI glide blend — TXV concern (warn)\n  Application: both in residential-ac group (ok)\n  Verdict: 'Retrofit with oil change' — proceed with standard HFC retrofit procedure.\n\nR-22 → R-410A:\n  Lubricant: MO/AB vs POE — oil change required (warn)\n  Safety: A1 → A1 unchanged (ok)\n  Pressure: 121.4 PSIG vs 201.5 PSIG at 70°F — +66% (fail)\n  Glide: pure → near-azeotrope (ok)\n  Application: both residential-ac (ok)\n  Verdict: 'Not recommended (pressure)' — equipment not rated for R-410A pressures; full system replacement.",
      }}
      relatedTools={[
        { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison Tool", blurb: "Visualize the pressure envelope comparison between two refrigerants." },
        { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A", blurb: "Detailed narrative on the residential AC phase-down decision." },
        { href: "/r-410a-vs-r-454b/", label: "R-410A vs R-454B", blurb: "The actual A1-to-A2L phase-down decision with retrofit-reality context." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <RetrofitCompatibilityCalculator />
    </CalculatorShell>
  );
}

function RichContent() {
  return (
    <>
      <TechSection icon="composition" tone="blue" title="The retrofit decision — five questions, one verdict">
        <p>
          A successful refrigerant retrofit requires the candidate refrigerant to satisfy
          five independent constraints simultaneously. Failing any one of them turns a
          drop-in into a partial retrofit, a partial retrofit into an equipment replacement,
          or an equipment replacement into a project that doesn&apos;t pay back.
        </p>
        <Panel title="The five-criterion compatibility check" icon={TableIcon}>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>
              <strong>Lubricant compatibility.</strong> Does the existing oil family
              (mineral oil, AB, POE, PVE, PAG) work with the target refrigerant? Mineral
              oil works with R-22, hydrocarbons, and a few R-22 retrofit blends with
              hydrocarbon components. POE is required by most HFCs (R-410A, R-32, R-454B,
              R-454C, R-1234yf, R-134a). Mixing mineral oil with an HFC produces oil-return
              failures within hours of operation.
            </li>
            <li>
              <strong>Safety classification transition.</strong> A1 → A1 (R-22 → R-407C):
              no equipment changes for safety. A1 → A2L (R-410A → R-454B): A2L equipment
              (sealed motors, IEC 60335-2-40 charge limits, leak detection in some
              jurisdictions). A → B (any HFC → R-717): not a retrofit, complete equipment
              replacement with ammonia-specific design.
            </li>
            <li>
              <strong>Pressure envelope.</strong> Within ±10% across operating range:
              drop-in capable. ±10-25%: standard retrofit (no component changes).
              ±25-40%: equipment-level review required (component pressure ratings,
              compressor capacity). &gt;40%: not feasible without equipment redesign.
            </li>
            <li>
              <strong>Temperature glide.</strong> Pure → pure or pure → near-azeotrope:
              no service measurement change. Pure → wide-glide blend (R-22 → R-407C):
              TXV / EEV sensing-bulb tuning and PT chart curve selection awareness.
              Wide-glide → narrow-glide: less concerning but still a service procedure
              change.
            </li>
            <li>
              <strong>Application family.</strong> Residential AC, commercial MT
              refrigeration, commercial LT refrigeration, chiller, mobile AC — each
              category has its own design assumptions. Refrigerants engineered for one
              category rarely fit another (R-1234yf is for mobile AC; R-410A is for
              residential AC — no crossover).
            </li>
          </ol>
        </Panel>
        <KeyInsight tone="emerald" icon="insight" title="Verdict synthesis weights worst-case">
          The verdict reflects the worst of the five criteria. A pair with four
          &quot;OK&quot; but one &quot;fail&quot; produces a fail verdict — the failed
          dimension makes the retrofit infeasible no matter how well other dimensions
          align.
        </KeyInsight>
      </TechSection>

      <TechSection icon="data" tone="purple" title="The six verdict tiers — what each means">
        <Panel title="Verdict tier reference" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Verdict</th>
                  <th className="py-1.5 text-left">Criteria</th>
                  <th className="py-1.5 text-left">Service procedure</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">Drop-in retrofit possible</td><td className="py-1.5 text-xs">All five OK</td><td className="py-1.5 text-xs">Recover, replace filter-drier, evacuate, recharge</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300 font-semibold">Retrofit with oil change</td><td className="py-1.5 text-xs">Lubricant warn, others OK</td><td className="py-1.5 text-xs">+ drain and replace lubricant</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300 font-semibold">Retrofit with TXV / valve changes</td><td className="py-1.5 text-xs">Glide warn (pure → blend)</td><td className="py-1.5 text-xs">+ retune TXV sensing bulb, verify metering compatibility</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300 font-semibold">Equipment modifications required</td><td className="py-1.5 text-xs">Pressure warn 10-25%, safety class shift</td><td className="py-1.5 text-xs">Component pressure rating review, A2L compliance if applicable</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300 font-semibold">Not recommended</td><td className="py-1.5 text-xs">Pressure fail 25-40%, ROI questionable</td><td className="py-1.5 text-xs">Evaluate full replacement instead</td></tr>
                <tr><td className="py-1.5 text-red-700 dark:text-red-300 font-semibold">Not feasible</td><td className="py-1.5 text-xs">Application mismatch, pressure &gt;40%, A→B class</td><td className="py-1.5 text-xs">Full equipment replacement only path</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </TechSection>

      <TechSection icon="climate" tone="amber" title="AIM Act phase-down — the regulatory driver">
        <p>
          The EPA AIM Act (40 CFR Part 84) caps HFC production and import in the US on a
          declining schedule: 90% allocation in 2022, 60% in 2024, 30% in 2029, 15% in
          2036. The phase-down forces transitions from high-GWP HFCs (R-410A, R-404A,
          R-134a) to lower-GWP A2L alternatives (R-32, R-454B, R-454C, R-1234yf). The
          retrofit compatibility analysis becomes increasingly important as the phase-down
          tightens supply and raises prices on the higher-GWP refrigerants.
        </p>
        <Panel title="AIM Act sector compliance dates" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Sector</th>
                  <th className="py-1.5 text-left">GWP cap</th>
                  <th className="py-1.5 text-left">Compliance date</th>
                  <th className="py-1.5 text-left">Affected refrigerants</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Residential / light commercial AC</td><td className="py-1.5 font-mono">700</td><td className="py-1.5">2025-01-01 (new equipment)</td><td className="py-1.5 text-xs">R-410A out; R-32 / R-454B in</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Commercial refrigeration (most subsectors)</td><td className="py-1.5 font-mono">300-700</td><td className="py-1.5">2025-01-01 (new equipment)</td><td className="py-1.5 text-xs">R-404A out; R-454C / R-455A / R-448A / R-449A in</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Centrifugal chillers</td><td className="py-1.5 font-mono">700</td><td className="py-1.5">2025-01-01</td><td className="py-1.5 text-xs">R-134a → R-513A / R-1233zd / R-1234ze</td></tr>
                <tr><td className="py-1.5">Mobile AC (passenger vehicles)</td><td className="py-1.5 font-mono">150</td><td className="py-1.5">SNAP delisted 2021</td><td className="py-1.5 text-xs">R-134a → R-1234yf (in production 2017+)</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real retrofit decision scenarios">
        <p>
          Six pairs covering the most common retrofit decisions in 2025-2026: R-22 →
          various HFCs, R-410A → A2L, R-404A → low-GWP commercial, and the not-feasible
          cases (cross-sector and cross-class transitions).
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-22 → R-407C"
        title="R-22 to R-407C — the classic HFC retrofit"
        scenario="Legacy R-22 residential AC, customer wants to extend equipment life rather than replace. R-407C is the most common HFC retrofit option for R-22 residential."
      >
        <Panel title="Five-criterion analysis" icon={TableIcon}>
          <ComparisonTable
            headers={["Criterion", "R-22", "R-407C", "Verdict"]}
            rows={[
              { label: "Lubricant", cells: ["MO / AB", "POE", "warn — oil change"] },
              { label: "Safety class", cells: ["A1", "A1", "ok"] },
              { label: "Pressure @ 95°F", cells: ["181 PSIG", "215 / 180 bubble/dew", "ok (within 20%)"] },
              { label: "Glide", cells: ["0°F", "11°F", "warn — TXV awareness"] },
              { label: "Application", cells: ["residential AC", "residential AC", "ok"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Retrofit with oil change and TXV awareness">
          Standard HFC retrofit procedure. Drain mineral oil, replace with POE; flush
          system multiple times to clear residual mineral oil; replace filter-drier;
          evacuate; charge R-407C by weight. TXV must use R-407C dew temperature for
          sensing — most TXVs are bulb-charged with a similar refrigerant and work fine,
          but verify.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-22 → R-422D"
        title="R-22 to R-422D — mineral-oil-compatible HFC blend"
        scenario="Same R-22 system, but customer wants to avoid the oil change (older equipment with retro oil pickup, complex piping). R-422D is one of several HFC blends with hydrocarbon components specifically engineered for mineral-oil retention."
      >
        <Panel title="Five-criterion analysis" icon={TableIcon}>
          <ComparisonTable
            headers={["Criterion", "R-22", "R-422D", "Verdict"]}
            rows={[
              { label: "Lubricant", cells: ["MO / AB", "MO / POE", "ok"] },
              { label: "Safety class", cells: ["A1", "A1", "ok"] },
              { label: "Pressure @ 95°F", cells: ["181 PSIG", "190 / 175", "ok (within 5%)"] },
              { label: "Glide", cells: ["0°F", "7°F", "warn — minor TXV"] },
              { label: "Application", cells: ["residential AC", "residential AC retrofit", "ok"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Drop-in retrofit possible (with oil retention)">
          R-422D contains R-600 (isobutane) hydrocarbon component that allows mineral oil
          retention. Standard HFC procedure but no oil change required — recover R-22,
          replace filter-drier, evacuate, recharge R-422D. Capacity is typically ~5-10%
          lower than R-22, which may matter on already marginally-sized systems.
        </VerdictBanner>
        <FixCallout>
          For older equipment where oil change is impractical (sealed compressors, complex
          oil-return piping), R-422D and similar mineral-oil-compatible R-22 retrofits
          (R-417A, R-427A, R-438A) are pragmatic choices. Higher GWP than POE-required
          options (R-407C, R-454C) so plan for AIM Act-driven phase-out within the next
          decade.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-22 → R-410A"
        title="R-22 to R-410A — DON'T (the pressure delta makes this infeasible)"
        scenario="Customer asks about retrofitting R-22 to R-410A directly. The pressure delta makes this a full equipment replacement, not a retrofit."
      >
        <Panel title="Five-criterion analysis" icon={TableIcon}>
          <ComparisonTable
            headers={["Criterion", "R-22", "R-410A", "Verdict"]}
            rows={[
              { label: "Lubricant", cells: ["MO / AB", "POE", "warn — oil change"] },
              { label: "Safety class", cells: ["A1", "A1", "ok"] },
              { label: "Pressure @ 95°F", cells: ["181 PSIG", "278 PSIG", "FAIL — +54%"] },
              { label: "Glide", cells: ["0°F", "~0°F (near-az)", "ok"] },
              { label: "Application", cells: ["residential AC", "residential AC", "ok"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Not feasible — pressure exceeds R-22 component ratings">
          R-410A pressures run 54-60% higher than R-22 across the operating range. R-22
          equipment is rated for 500 PSI service; R-410A requires 800 PSI service
          equipment. The compressor, condenser tubing, line set, valves, and accumulator
          all need replacement — at which point you have a new R-410A system, not a
          retrofit.
        </VerdictBanner>
        <FixCallout>
          Recommend full equipment replacement with R-410A (or better: R-32 / R-454B for
          AIM Act-aligned A2L equipment with sub-700 GWP). The R-22 system has reached
          end-of-life; retrofit-to-R-410A economics never work out.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-410A → R-454B"
        title="R-410A to R-454B — A2L drop-in pressure-wise but A2L compliance required"
        scenario="Existing R-410A residential AC. Customer asking about switching to R-454B for lower GWP. The pressure envelope matches almost perfectly, but A2L safety class shift requires equipment-level review."
      >
        <Panel title="Five-criterion analysis" icon={TableIcon}>
          <ComparisonTable
            headers={["Criterion", "R-410A", "R-454B", "Verdict"]}
            rows={[
              { label: "Lubricant", cells: ["POE", "POE", "ok"] },
              { label: "Safety class", cells: ["A1", "A2L", "warn — mildly flammable"] },
              { label: "Pressure @ 95°F", cells: ["278 PSIG", "262 / 256", "ok (within 6%)"] },
              { label: "Glide", cells: ["~0°F", "3°F", "ok — minor"] },
              { label: "Application", cells: ["residential AC", "residential AC", "ok"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Equipment modifications required — A2L compliance">
          Pressure / lubricant / glide are all compatible. The blocker is safety
          classification: R-454B is A2L (mildly flammable). Existing R-410A equipment is
          not A2L-certified — sealed motor, leak detection, IEC 60335-2-40 charge limit
          compliance are required for A2L equipment certification.
        </VerdictBanner>
        <FixCallout>
          R-410A to R-454B is not a field retrofit — it&apos;s an equipment-level
          re-certification. For new equipment, A2L-certified R-454B units are widely
          available and are the AIM Act-aligned replacement for R-410A. For existing
          R-410A equipment at end-of-life, replace with A2L-certified R-454B or R-32
          equipment.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-404A → R-448A"
        title="R-404A to R-448A — commercial low-GWP retrofit"
        scenario="Supermarket R-404A commercial refrigeration system. AIM Act prohibits R-404A in new equipment; for existing equipment, low-GWP retrofit options include R-448A (Solstice N40) and R-449A (Opteon XP40)."
      >
        <Panel title="Five-criterion analysis" icon={TableIcon}>
          <ComparisonTable
            headers={["Criterion", "R-404A", "R-448A", "Verdict"]}
            rows={[
              { label: "Lubricant", cells: ["POE", "POE", "ok"] },
              { label: "Safety class", cells: ["A1", "A1", "ok"] },
              { label: "Pressure @ 0°F evap", cells: ["28 PSIG", "27 / 21", "ok (within 5%)"] },
              { label: "Pressure @ 95°F cond", cells: ["232 PSIG", "245 / 222", "ok (within 5%)"] },
              { label: "Glide", cells: ["~1°F (near-az)", "6°F", "warn — TXV awareness"] },
              { label: "Application", cells: ["commercial refrigeration", "commercial refrigeration", "ok"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Retrofit with TXV awareness">
          R-448A is engineered as a low-GWP drop-in replacement for R-404A in commercial
          refrigeration. Pressure / lubricant / safety match. The 6°F glide vs R-404A&apos;s
          near-azeotropic behavior requires TXV awareness and PT chart bubble / dew curve
          selection. GWP drops from R-404A&apos;s 3922 to R-448A&apos;s 1387 — substantial
          AIM Act compliance benefit.
        </VerdictBanner>
        <FixCallout>
          Standard procedure: recover R-404A, replace filter-drier, evacuate to 500
          microns, charge R-448A by weight to OEM retrofit specification (typically
          ~95% of R-404A nameplate). Verify SH using dew curve, SC using bubble curve.
          R-449A (Opteon XP40) is the very close alternative with nearly identical
          performance.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-22 → R-717 (ammonia)"
        title="R-22 to R-717 — NOT FEASIBLE (cross-class, cross-application)"
        scenario="Question that sometimes comes up: can we retrofit an R-22 system to ammonia? The answer is no — this is a fundamental class incompatibility."
      >
        <Panel title="Five-criterion analysis" icon={TableIcon}>
          <ComparisonTable
            headers={["Criterion", "R-22", "R-717", "Verdict"]}
            rows={[
              { label: "Lubricant", cells: ["MO / AB", "MO (steel) / PAO", "warn"] },
              { label: "Safety class", cells: ["A1", "B2L", "FAIL — toxic"] },
              { label: "Pressure @ 95°F", cells: ["181 PSIG", "182 PSIG", "ok by coincidence"] },
              { label: "Glide", cells: ["0°F", "0°F", "ok"] },
              { label: "Material compatibility", cells: ["Cu OK", "Cu attacked", "FAIL"] },
              { label: "Application", cells: ["residential AC", "industrial refrigeration", "FAIL"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Not feasible — cross-class refrigerant swap is impossible">
          Ammonia attacks copper tubing (R-22 systems are all copper), is toxic (B-class
          requires machine room ventilation, full-face SCBA for service, IIAR-rated
          installation), and is used in purpose-built industrial systems with steel
          piping. There is no realistic retrofit path between A-class HFC and ammonia.
        </VerdictBanner>
        <FixCallout>
          A-class to B-class transitions are full equipment replacement with
          ammonia-specific design (IIAR 2 installation standard, IIAR 9 minimum safety
          standard, ammonia-rated machine room, leak detection, emergency shutoff). This
          is industrial-refrigeration territory, not HVAC; pursue with IIAR-certified
          contractors.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="warning" tone="amber" title="What this calculator does NOT evaluate">
        <ol>
          <li>
            <strong>Equipment-specific OEM compatibility.</strong> The calculator is
            pair-wise refrigerant analysis; equipment-specific compatibility depends on
            the specific compressor, expansion device, and control electronics. Always
            verify the OEM service literature for the specific equipment.
          </li>
          <li>
            <strong>Capacity match.</strong> Pressure envelope match does not guarantee
            capacity match. R-32 has ~10% higher volumetric capacity than R-410A even
            though pressures are similar; R-454C delivers slightly lower capacity than
            R-404A. Some retrofits require evaporator or condenser re-sizing.
          </li>
          <li>
            <strong>Local code compliance.</strong> A2L installations have charge limits,
            mechanical room ventilation requirements, and leak detection mandates that
            vary by jurisdiction. Check local code (IRC, IMC, state-specific amendments).
          </li>
          <li>
            <strong>Economic analysis.</strong> The calculator reports feasibility, not
            ROI. A feasible retrofit may not pay back vs replacement; an &quot;equipment
            modifications required&quot; verdict may be cheaper than full replacement for
            specific systems.
          </li>
          <li>
            <strong>Warranty implications.</strong> OEMs often void warranty if a
            non-approved refrigerant is charged into a system. The calculator doesn&apos;t
            check warranty terms — always verify with the OEM before retrofitting.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>Retrofit Compatibility</strong> (this page) — five-criterion pair
            analysis with structured verdict. Best for go/no-go decisions.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-pt-comparison-tool/" className="underline">PT Comparison Tool</a>
            </strong>{" "}
            — visual pressure envelope check. Use before this calculator to screen
            candidates.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-comparison-guide/" className="underline">Refrigerant Comparison Guide</a>
            </strong>{" "}
            — long-form sourced reference for common HVAC refrigerant transitions.
          </li>
          <li>
            <strong>Per-pair pages</strong> — for popular comparisons (R-22 vs R-410A,
            R-32 vs R-410A, R-410A vs R-454B), dedicated pages walk through the
            transition with full sourcing.
          </li>
          <li>
            <strong>Per-refrigerant detail pages</strong> — every refrigerant has its
            own page documenting lubricants, safety class, pressures, and replacement
            options.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources">
        <ul>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Chapter 7
            (lubricants), retrofit procedures, lubricant-refrigerant compatibility tables.
          </li>
          <li>
            <strong>ASHRAE Standard 34-2022</strong> — refrigerant designation and safety
            classification (A1, A2L, A3, B1, B2L, B3).
          </li>
          <li>
            <strong>ASHRAE Standard 15-2022</strong> — Safety Standard for Refrigeration
            Systems; machine room requirements, ventilation, leak detection.
          </li>
          <li>
            <strong>UL / IEC 60335-2-40 (2022)</strong> — A2L refrigerant charge limits,
            installation safety requirements.
          </li>
          <li>
            <strong>EPA AIM Act (40 CFR Part 84)</strong> — HFC phase-down schedule, sector
            compliance dates, allowance allocations.
          </li>
          <li>
            <strong>EPA SNAP (40 CFR Part 82 Subpart G)</strong> — Significant New
            Alternatives Policy — refrigerant acceptability by end-use sector.
          </li>
          <li>
            <strong>IIAR Standards (IIAR 2, IIAR 9)</strong> — ammonia (R-717) installation
            and safety requirements.
          </li>
          <li>
            <strong>Manufacturer retrofit guides</strong> — Honeywell, Chemours, Arkema,
            equipment OEM retrofit bulletins for specific refrigerant transitions.
          </li>
        </ul>
      </TechSection>
    </>
  );
}
