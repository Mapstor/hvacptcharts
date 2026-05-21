import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { CombinedCalculator } from "@/components/calculators/CombinedCalculator";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "Why measure both superheat and subcooling together?",
    a: "Each one alone tells you part of the story; together they pin down the system's charge state and isolate root causes. The classic patterns: high superheat + low subcooling = undercharge; low superheat + high subcooling = overcharge; both abnormal in the same direction = airflow or metering device issue.",
  },
  {
    q: "Which one should I trust more for charging?",
    a: "Depends on the metering device. Fixed-orifice systems are charged by superheat (per ACCA Manual T charging chart). TXV systems are charged by subcooling (typically 8–12°F per manufacturer). On a TXV system the superheat will hover near the TXV's setpoint regardless of charge — superheat reads as in-range even at overcharge — so subcooling is the primary charging metric.",
  },
  {
    q: "What if both superheat and subcooling are off in the same direction?",
    a: "Look at the system, not the refrigerant. Both high typically means low indoor airflow (inflating superheat by raising evaporator temperature) or low condenser airflow (inflating subcooling). Both low typically means restricted refrigerant flow somewhere — TXV stuck open, oversized orifice, line set issue.",
  },
  {
    q: "Does this work for zeotropic blends?",
    a: "Yes. The calculator uses the dew curve for superheat (correct for vapor side) and the bubble curve for subcooling (correct for liquid side). For high-glide blends like R-407C (~7 K glide) this avoids the common ~10–15°F error introduced by using a single saturation curve.",
  },
  {
    q: "Can I use this for refrigeration systems too?",
    a: "Yes, but the target ranges differ. Refrigeration systems typically target 10–20°F superheat and 5–15°F subcooling. The diagnostic banner uses HVAC ranges — interpret refrigeration readings against the manufacturer spec rather than the banner.",
  },
];

export const metadata: Metadata = {
  title: "Combined PT, Superheat & Subcooling Calculator",
  description:
    "Read all three diagnostic values for an HVAC system in one place: superheat, subcooling, and saturation pressures. Built on verified CoolProp data with correct dew/bubble curve handling for zeotropic blends.",
  alternates: { canonical: `${SITE_URL}/pt-superheat-subcooling-calculator/` },
};

export default function CombinedCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "pt-superheat-subcooling-calculator",
        name: "PT / Superheat / Subcooling Calculator",
        description:
          "One form for all three diagnostic measurements: suction-line superheat and liquid-line subcooling, with combined-pattern interpretation.",
        featureList: [
          "Superheat (dew curve), subcooling (bubble curve), in one workflow",
          "Combined diagnostic: undercharge / overcharge / airflow / metering",
          "Supports 50+ refrigerants",
          "Imperial and metric units",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Combined Calculator",
      }}
      introOneLiner="One form for both the low side (suction line, superheat) and the high side (liquid line, subcooling). Combined diagnostic banner flags the classic overcharge / undercharge / airflow patterns."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant.",
          "On the low-side panel: enter the suction-line pressure and temperature.",
          "On the high-side panel: enter the liquid-line pressure and temperature.",
          "Read superheat, subcooling, and the combined diagnostic together.",
        ],
        commonErrors: [
          "Measuring at the wrong service port — suction is the low-side port at the larger insulated line; liquid is the high-side port at the smaller uninsulated line.",
          "Reading before the system has stabilized — let it run for 10-15 minutes under load before recording values.",
        ],
      }}
      math={{
        formula: "Superheat = T_suction_line − T_sat(P_suction, dew)\nSubcooling = T_sat(P_liquid, bubble) − T_liquid_line",
        sourceCitation:
          "Saturation values from CoolProp 7.2.0. Target ranges per ACCA Manual T, ASHRAE Refrigeration Handbook 2022, and equipment manufacturer charging procedures.",
        workedExample:
          "R-410A on a 95°F day, properly charged TXV system:\n  Suction: 130 PSIG, 60°F line  →  superheat 15.2°F (typical TXV range)\n  Liquid: 380 PSIG, 100°F line  →  subcooling 10.7°F (typical TXV range)\n  Diagnostic: Charge appears correct.",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat alone", blurb: "Focused single-result view of just the suction side." },
        { href: "/subcooling-calculator/", label: "Subcooling alone", blurb: "Just the liquid side." },
        { href: "/pt-calculator/", label: "Raw PT lookup", blurb: "Pressure / temperature conversion without superheat or subcooling." },
      ]}
      faqs={FAQS}
    >
      <CombinedCalculator />
    </CalculatorShell>
  );
}
