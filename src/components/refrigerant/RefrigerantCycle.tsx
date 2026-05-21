import { getRefrigerant, getPressureAtTempF } from "@/data/refrigerants";
import { CycleDiagram } from "@/components/svg/CycleDiagram";

export interface RefrigerantCycleProps {
  slug: string;
  className?: string;
}

/**
 * Renders the 4-stage cycle for a refrigerant under typical residential cooling
 * conditions: 40°F evaporator saturation, 110°F condenser saturation, 10°F
 * superheat at suction, 10°F subcooling at liquid line, and a representative
 * compressor discharge temperature of 180°F.
 *
 * If the refrigerant has no PT data (manual blends pending datasheet), or the
 * lookup falls outside its chart range, the diagram is omitted rather than
 * showing fabricated numbers.
 */
export function RefrigerantCycle({ slug, className }: RefrigerantCycleProps) {
  const r = getRefrigerant(slug);
  if (!r || r.ptChart.length === 0) return null;

  const suctionSat = getPressureAtTempF(slug, 40);
  const dischargeSat = getPressureAtTempF(slug, 110);
  if (!suctionSat || !dischargeSat) return null;

  return (
    <CycleDiagram
      refrigerantName={r.displayName}
      conditions={{
        suctionPsig: suctionSat.bubble,
        suctionTempF: 50, // 40 + 10°F superheat
        dischargePsig: dischargeSat.bubble,
        dischargeTempF: 180,
        liquidPsig: dischargeSat.bubble,
        liquidTempF: 100, // 110 − 10°F subcooling
        evapInletPsig: suctionSat.bubble,
        evapInletTempF: 40,
      }}
      ariaLabel={`Refrigeration cycle diagram for ${r.displayName} with typical residential operating conditions`}
      className={className}
    />
  );
}
