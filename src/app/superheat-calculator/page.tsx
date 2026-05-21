import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SuperheatCalculator } from "@/components/calculators/SuperheatCalculator";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What is superheat?",
    a: "Superheat is the temperature of refrigerant vapor above its saturation temperature at the same pressure. On a working HVAC system, superheat is measured at the suction line near the compressor: the actual suction line temperature minus the saturation temperature corresponding to the suction line pressure. Positive superheat means the refrigerant has fully boiled; zero or negative superheat means liquid refrigerant is reaching the compressor — a damaging condition known as slugging.",
  },
  {
    q: "What is the target superheat for an HVAC system?",
    a: "It depends on the metering device. Fixed-orifice systems target 8–25°F superheat calculated from a charging chart using the indoor wet-bulb and outdoor dry-bulb temperatures. TXV (thermostatic expansion valve) systems target a fixed 8–15°F superheat (often 10°F setpoint) regardless of ambient. Refrigeration systems target 10–20°F. Always check the equipment label and manufacturer literature for the specific system. See the inline reference table for citations.",
  },
  {
    q: "How do I measure superheat in the field?",
    a: "Connect a manifold gauge to the suction service port and read the pressure in PSIG. Use a contact or clamp-on temperature probe on the suction line within 6 inches of the compressor (or per manufacturer spec) — make solid contact, insulate from ambient air, and let the reading stabilize. Convert the suction pressure to saturation temperature using a PT chart for your refrigerant (or this calculator). Subtract that saturation temperature from your measured line temperature. The difference is superheat.",
  },
  {
    q: "What does low superheat indicate?",
    a: "Low superheat (under 5°F on most systems) usually means the system is overcharged, the metering device is flooding the evaporator (stuck TXV, undersized orifice), or the indoor airflow is too low and not absorbing enough heat to fully boil the refrigerant. Liquid refrigerant entering the compressor — slugging — can cause valve damage and bearing failure. Verify with subcooling and an indoor airflow check before adjusting charge.",
  },
  {
    q: "What does high superheat indicate?",
    a: "High superheat (over 25°F on most residential systems) usually means undercharge, a restriction in the liquid line starving the evaporator, a TXV that is over-controlling, or low indoor load. Check subcooling first — low subcooling alongside high superheat strongly suggests undercharge. Verify indoor airflow and inspect the filter-drier before adding refrigerant.",
  },
  {
    q: "Why does superheat math differ for zeotropic blends?",
    a: "Zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A) condense and evaporate across a range of temperatures at constant pressure. For superheat measurement on the suction line, the refrigerant has fully passed through evaporation — the relevant saturation boundary is the dew temperature, not the bubble temperature. This calculator uses the dew curve automatically when the refrigerant is zeotropic. Using the bubble pressure curve for a high-glide blend like R-407C would underestimate superheat by ~20°F.",
  },
  {
    q: "Is this the same as Total Superheat versus Evaporator Superheat?",
    a: "This calculator computes superheat at the point you measure — typically the suction line near the compressor, which is the 'Total Superheat' value most charging procedures reference. Evaporator superheat (the value at the evaporator outlet, before any pickup along the suction line) is usually 2–5°F higher than total superheat at the compressor. For TXV systems, Evaporator Superheat is what the valve controls to; for fixed-orifice systems, the charging chart gives a Total Superheat target.",
  },
];

export const metadata: Metadata = {
  title: "Superheat Calculator — HVAC Suction-Line Superheat in Seconds",
  description:
    "Free superheat calculator for all common HVAC refrigerants. Enter suction-line PSIG and temperature; get superheat with diagnostic context. Built on verified CoolProp saturation data with correct dew-curve handling for zeotropic blends.",
  alternates: { canonical: `${SITE_URL}/superheat-calculator/` },
};

export default function SuperheatCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "superheat-calculator",
        name: "Superheat Calculator",
        description:
          "Compute HVAC superheat from suction-line pressure and temperature for any of 50+ refrigerants. Bubble vs dew handled correctly for zeotropic blends. Diagnostic context built in.",
        featureList: [
          "Supports all CoolProp-modeled refrigerants (49 of 61 in the dataset)",
          "Correct dew-curve math for zeotropic blends (R-407C, R-454C, R-455A, etc.)",
          "Imperial (°F, PSIG) and metric (°C, kPa) units",
          "Target superheat reference table with ACCA Manual T citations",
          "Inline diagnostic context: slugging risk, normal range, undercharge",
          "Mobile-friendly, no signup",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Superheat Calculator",
      }}
      introOneLiner="Enter your suction-line pressure and temperature for any refrigerant; get superheat plus diagnostic context. Correct dew-curve math for zeotropic blends so high-glide refrigerants (R-407C, R-454C, R-455A) don't read 20°F off."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant in the system. Defaults to R-410A.",
          "Read the suction-line pressure from the low-side manifold gauge. Most service gauges read PSIG by default.",
          "Measure the suction-line temperature with a contact or clamp-on probe within 6 inches of the compressor (or per the manufacturer service literature). Insulate the probe from ambient air and let the reading stabilize.",
          "Enter both values. The calculator returns superheat in °F (or °C if you toggle the unit) plus a diagnostic banner.",
          "Compare the result against your equipment's target superheat (from the manufacturer charging chart, TXV spec, or the reference table on this page).",
        ],
        commonErrors: [
          "Reading the discharge pressure instead of the suction pressure. The suction is the LOW side; discharge is the HIGH side.",
          "Probing the suction line without insulating from ambient — ambient air pulls the reading toward room temperature, inflating apparent superheat.",
          "On zeotropic blends (R-407C, R-454C, etc.), using a pure-refrigerant table and the bubble pressure for saturation temperature — this underestimates superheat by the temperature glide (~20°F for R-407C). This calculator does the dew-curve math automatically.",
          "Forgetting that fixed-orifice and TXV systems have very different target ranges. A fixed-orifice system reading 10°F superheat on a 95°F day may actually be undercharged.",
        ],
      }}
      math={{
        formula: "Superheat (°F) = T_suction_line − T_sat(P_suction)\n\nwhere T_sat is read off the DEW curve at the measured suction pressure (for pure refrigerants and azeotropes, bubble ≡ dew, so the choice is moot).",
        sourceCitation:
          "Saturation temperatures from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS). Target superheat ranges per ACCA Manual T (Air Conditioning Contractors of America 2017), ASHRAE Refrigeration Handbook 2022, and equipment-specific manufacturer charging charts.",
        workedExample:
          "R-410A residential AC, 95°F outdoor day:\n  Suction pressure (gauge): 130 PSIG\n  Suction-line temperature: 60°F\n  Saturation temperature at 130 PSIG: 44.8°F\n  Superheat = 60 − 44.8 = 15.2°F\n\nThis is within the typical TXV range (8–15°F) and comfortably above the slugging threshold. For a fixed-orifice system, cross-check against the equipment's charging chart for the specific indoor wet-bulb / outdoor dry-bulb combination.",
      }}
      relatedTools={[
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Companion to superheat on the liquid line. Together they pin down a system's charge state." },
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / Superheat / Subcooling", blurb: "All three measurements on one form, useful for a complete system check." },
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Raw saturation-pressure lookup for any refrigerant." },
        { href: "/refrigerant/r-410a/", label: "R-410A reference", blurb: "Full PT chart, operating pressures, and lubricant guidance for the dominant residential AC refrigerant." },
      ]}
      faqs={FAQS}
    >
      <SuperheatCalculator />
    </CalculatorShell>
  );
}
