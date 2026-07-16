import { getRefrigerant } from "@/data/refrigerants";
import { Cite } from "@/components/refrigerant/Cite";
import { RefrigerantCylinderDiagram } from "./RefrigerantCylinderDiagram";

export interface CylinderComparisonRowProps {
  slugA: string;
  slugB: string;
}

/**
 * Comparison-page cylinder pair. Both cylinders render as the current
 * AHRI Guideline N standard color (RAL 7044 light gray-green) — the visual
 * differentiator is the red flammability band on the A2/A3 fluid, which is
 * exactly the story: post-2020 paint is uniform, safety class carries
 * through the shoulder band.
 *
 * Joint figcaption anchored on AHRI Guideline N-2017 via <Cite/>, which
 * registers the source with the page's ProvenanceFooter collector.
 */
export function CylinderComparisonRow({
  slugA,
  slugB,
}: CylinderComparisonRowProps) {
  const a = getRefrigerant(slugA);
  const b = getRefrigerant(slugB);
  if (!a || !b) return null;

  const aFlammable =
    a.safetyClass.startsWith("A2") || a.safetyClass.startsWith("A3");
  const bFlammable =
    b.safetyClass.startsWith("A2") || b.safetyClass.startsWith("A3");

  return (
    <figure className="my-6 max-w-md">
      <div className="grid grid-cols-2 items-end gap-6">
        <div className="mx-auto max-w-[180px]">
          <RefrigerantCylinderDiagram slug={slugA} variant="current" />
        </div>
        <div className="mx-auto max-w-[180px]">
          <RefrigerantCylinderDiagram slug={slugB} variant="current" />
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        {a.displayName} ({a.safetyClass}
        {aFlammable ? ", red flammability band" : ", no flammability band"})
        versus {b.displayName} ({b.safetyClass}
        {bFlammable ? ", red flammability band" : ", no flammability band"}).
        Both ship in the AHRI Guideline N light gray-green service cylinder
        (RAL 7044) industry-uniform since 2020; ASHRAE 34 safety class alone
        drives the shoulder-band difference
        <Cite id="ahri-guideline-n-2017" />.
      </figcaption>
    </figure>
  );
}
