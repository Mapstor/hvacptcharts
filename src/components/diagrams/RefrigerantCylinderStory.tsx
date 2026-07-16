import { ArrowRight } from "lucide-react";
import { getRefrigerant } from "@/data/refrigerants";
import { Cite } from "@/components/refrigerant/Cite";
import {
  LEGACY_CYLINDER_COLORS,
  RefrigerantCylinderDiagram,
} from "./RefrigerantCylinderDiagram";

export interface RefrigerantCylinderStoryProps {
  slug: string;
}

/**
 * Refrigerant-page cylinder placement. Renders one of three variants,
 * chosen from the dataset — the caller (refrigerant/[slug]/page.tsx) is
 * ignorant of which slugs are legacy-colored or phased out.
 *
 *   • R-12 (phased-out CFC, banned since 1996): legacy-only rendering. No
 *     current AHRI-gray R-12 cylinder exists to sell, so showing one would
 *     be a factual error.
 *
 *   • Slugs in LEGACY_CYLINDER_COLORS other than R-12: pair rendering —
 *     legacy paint on the left, current AHRI gray on the right, transition
 *     arrow between, joint figcaption anchored on AHRI Guideline N-2017.
 *
 *   • All other 55 slugs: solo current AHRI-gray cylinder. Figcaption
 *     states the AHRI Guideline N standard and, for A2/A3 slugs, the
 *     mandatory red shoulder band.
 *
 * Sources: AHRI Guideline N-2017 is cited via <Cite/> inside the figcaption,
 * which registers the source with the page's ProvenanceFooter collector by
 * side effect of the existing Cite implementation.
 */
export function RefrigerantCylinderStory({ slug }: RefrigerantCylinderStoryProps) {
  const r = getRefrigerant(slug);
  if (!r) return null;

  const legacy = LEGACY_CYLINDER_COLORS[slug];
  const isPhasedOutCfc = slug === "r-12";
  const isPairRender = !!legacy && !isPhasedOutCfc;
  const hasFlammabilityBand =
    r.safetyClass.startsWith("A2") || r.safetyClass.startsWith("A3");

  if (isPhasedOutCfc && legacy) {
    return (
      <figure className="my-6 max-w-[180px]">
        <div className="mx-auto">
          <RefrigerantCylinderDiagram slug={slug} variant="legacy" />
        </div>
        <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {r.displayName} historically shipped in {legacy.name} cylinders; new
          production of {r.displayName} has been banned in the United States
          since 1996 under the Clean Air Act Section 604 CFC phaseout. ASHRAE
          34 class {r.safetyClass} — no flammability band required
          <Cite id="ahri-guideline-n-2017" />.
        </figcaption>
      </figure>
    );
  }

  if (isPairRender && legacy) {
    return (
      <figure className="my-6 max-w-md">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <RefrigerantCylinderDiagram slug={slug} variant="legacy" />
          <div className="flex flex-col items-center text-zinc-500 dark:text-zinc-400">
            <ArrowRight className="h-6 w-6" aria-hidden />
            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">
              since 2020
            </span>
          </div>
          <RefrigerantCylinderDiagram slug={slug} variant="current" />
        </div>
        <figcaption className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {r.displayName} shipped in {legacy.name} cylinders before 2020; AHRI
          Guideline N-2017 standardized service-cylinder color to light
          gray-green (RAL 7044) industry-wide from 2020 forward. ASHRAE 34
          class {r.safetyClass}
          {hasFlammabilityBand
            ? " — red flammability band per AHRI Guideline N"
            : " — no flammability band required"}
          <Cite id="ahri-guideline-n-2017" />.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="my-6 max-w-[200px]">
      <div className="mx-auto">
        <RefrigerantCylinderDiagram slug={slug} variant="current" />
      </div>
      <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {r.displayName} ships in the uniform AHRI Guideline N cylinder color
        (light gray-green, RAL 7044) required industry-wide since 2020.
        ASHRAE 34 class {r.safetyClass}
        {hasFlammabilityBand
          ? " — red flammability band per AHRI Guideline N"
          : " — no flammability band required"}
        <Cite id="ahri-guideline-n-2017" />.
      </figcaption>
    </figure>
  );
}
