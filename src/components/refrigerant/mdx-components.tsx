/**
 * Components available inside MDX content under content/refrigerants/*.mdx.
 *
 * Per Rule 1: pressure/temperature values in MDX prose are NEVER hardcoded —
 * the components below render them from the data layer. Only narrative prose
 * (whatItIs, whereItsUsed, phaseDownStatus, serviceNotes, FAQs) is authored
 * in the MDX file.
 */
import { Cite } from "./Cite";
import { RefrigerantCycle } from "./RefrigerantCycle";
import { RefrigerantPhaseDown } from "./RefrigerantPhaseDown";
import { RefrigerantGlide } from "./RefrigerantGlide";
import { RefrigerantGWPComparison } from "./RefrigerantGWPComparison";
import { TechSection, KeyInsight, NumberFact } from "./TechSection";
import { getPressureAtTempF, getRefrigerant } from "@/data/refrigerants";

/** Render the saturation pressure at a specific temperature, from data layer. */
function PressureAtTemp({ slug, tempF }: { slug: string; tempF: number }) {
  const p = getPressureAtTempF(slug, tempF);
  if (!p) return <span>—</span>;
  const r = getRefrigerant(slug);
  if (r?.physical.hasSignificantGlide) {
    return (
      <span className="font-mono">
        {p.bubble.toFixed(1)}/{p.dew.toFixed(1)} PSIG
      </span>
    );
  }
  return <span className="font-mono">{p.bubble.toFixed(1)} PSIG</span>;
}

export const mdxComponents = {
  Cite,
  RefrigerantCycle,
  RefrigerantPhaseDown,
  RefrigerantGlide,
  RefrigerantGWPComparison,
  PressureAtTemp,
  TechSection,
  KeyInsight,
  NumberFact,
};
