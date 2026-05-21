import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SubcoolingCalculator } from "@/components/calculators/SubcoolingCalculator";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What is subcooling?",
    a: "Subcooling is the temperature of liquid refrigerant below its saturation temperature at the same pressure. It's measured at the liquid line leaving the condenser. The condenser saturation temperature minus the measured liquid line temperature equals subcooling. Positive subcooling confirms fully-liquid refrigerant entering the metering device; zero or negative subcooling means vapor bubbles are present, starving the metering device.",
  },
  {
    q: "What is the target subcooling for an HVAC system?",
    a: "TXV residential AC: 8–12°F at the condenser outlet (always check the equipment label). Heat pumps in cooling mode: 8–15°F. Commercial refrigeration: 5–15°F. Fixed-orifice systems are charged by superheat rather than subcooling, so subcooling is informational only. Equipment manufacturer literature is the authoritative reference.",
  },
  {
    q: "What does low subcooling indicate?",
    a: "Low subcooling (under 3°F) usually means undercharge. The compressor can't condense enough vapor to fill the condenser with liquid, so the refrigerant leaves the condenser still partly vapor. Cross-check superheat: high superheat + low subcooling is the classic undercharge fingerprint. Check for leaks before adding refrigerant.",
  },
  {
    q: "What does high subcooling indicate?",
    a: "High subcooling (over 15°F) usually means overcharge — too much refrigerant is sitting in the condenser, taking up space normally occupied by condensing vapor. Less commonly: a dirty condenser coil, restricted condenser airflow, or non-condensables. Cross-check superheat: low superheat + high subcooling is the overcharge fingerprint. Verify condenser airflow and coil cleanliness first.",
  },
  {
    q: "Why does subcooling math differ for zeotropic blends?",
    a: "Zeotropic blends condense across a range of temperatures at constant pressure. On the liquid line, the refrigerant has fully condensed — the relevant saturation boundary is the bubble temperature (below which everything is liquid), not the dew temperature. This calculator uses the bubble curve automatically when the refrigerant is zeotropic. Using the dew curve for R-407C would overestimate subcooling by the temperature glide.",
  },
  {
    q: "Where should I measure liquid line temperature?",
    a: "On a residential split system, measure the liquid line at the outdoor unit's service valve, on the small (non-insulated) line. Use a contact or clamp-on probe with solid metal-to-metal contact, insulated from ambient air. Let the system run for 10-15 minutes for pressures to stabilize before reading. On commercial equipment, follow the manufacturer's specified measurement point.",
  },
];

export const metadata: Metadata = {
  title: "Subcooling Calculator — HVAC Liquid-Line Subcooling",
  description:
    "Free subcooling calculator for HVAC refrigerants. Enter liquid-line PSIG and temperature; get subcooling with diagnostic context. Correct bubble-curve math for zeotropic blends.",
  alternates: { canonical: `${SITE_URL}/subcooling-calculator/` },
};

export default function SubcoolingCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "subcooling-calculator",
        name: "Subcooling Calculator",
        description:
          "Compute HVAC subcooling from liquid-line pressure and temperature for 50+ refrigerants. Bubble-curve math handles zeotropic blends correctly.",
        featureList: [
          "Supports all CoolProp-modeled refrigerants in the dataset",
          "Correct bubble-curve math for zeotropic blends",
          "Imperial and metric units",
          "Inline diagnostic context: undercharge / normal / overcharge interpretation",
          "Target reference table with manufacturer-spec citations",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Subcooling Calculator",
      }}
      introOneLiner="Enter the liquid-line pressure and temperature for any refrigerant; get subcooling plus a diagnostic interpretation. Bubble-curve math so zeotropic blends compute correctly."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant. Defaults to R-410A.",
          "Read the discharge (high-side) pressure from the manifold gauge. This is the same as the liquid-line pressure on a single-stage system.",
          "Measure the liquid-line temperature with a contact or clamp-on probe at the outdoor unit service valve. Insulate from ambient air.",
          "Enter both values. Read off subcooling plus the diagnostic banner.",
          "Compare against your equipment's target (typically 8–12°F for TXV residential AC).",
        ],
        commonErrors: [
          "Confusing high-side and low-side: high-side is liquid line; low-side is suction line.",
          "Probing the wrong line — the LIQUID line is the smaller, uninsulated line. The suction line is larger and insulated.",
          "Mistaking high subcooling for 'extra capacity' — it usually means overcharge and reduces capacity.",
        ],
      }}
      math={{
        formula: "Subcooling (°F) = T_sat(P_liquid) − T_liquid_line\n\nwhere T_sat is read off the BUBBLE curve at the measured liquid pressure (for pure refrigerants and azeotropes, bubble ≡ dew).",
        sourceCitation:
          "Saturation temperatures from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS). Target subcooling ranges per equipment manufacturer literature, ACCA Manual T, and ASHRAE Refrigeration Handbook 2022.",
        workedExample:
          "R-410A residential AC, 95°F outdoor day:\n  Liquid pressure: 380 PSIG\n  Liquid-line temperature: 95°F\n  Saturation temperature at 380 PSIG: 110.7°F\n  Subcooling = 110.7 − 95 = 15.7°F\n\nThis is at the upper edge of typical operation — check condenser airflow and coil cleanliness before adjusting charge.",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line companion. Together with subcooling pins down system charge state." },
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / Superheat / Subcooling", blurb: "All three measurements on one form." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "High subcooling often indicates a high-side condition. Diagnostic decision tree." },
      ]}
      faqs={FAQS}
    >
      <SubcoolingCalculator />
    </CalculatorShell>
  );
}
