import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { RetrofitCompatibilityCalculator } from "@/components/calculators/RetrofitCompatibilityCalculator";
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
    >
      <RetrofitCompatibilityCalculator />
    </CalculatorShell>
  );
}
