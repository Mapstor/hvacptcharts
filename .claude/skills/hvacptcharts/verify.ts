// .claude/skills/hvacptcharts/verify.ts
// Companion module used by build. The skill itself is documentation;
// this file enforces a subset of the rules at compile time.

import { z } from "zod";
import type { Refrigerant } from "@/data/refrigerants";
import anchors from "./reference/coolprop-anchors.json";

const Anchor = z.object({
  slug: z.string(),
  tempF: z.number(),
  expectedPsig: z.number(),
  tolerance: z.number(),
});

const AnchorList = z.array(Anchor);

export function verifyAgainstAnchors(refrigerants: Refrigerant[]): { ok: boolean; errors: string[] } {
  const parsedAnchors = AnchorList.parse(anchors);
  const errors: string[] = [];

  for (const anchor of parsedAnchors) {
    const r = refrigerants.find((x) => x.slug === anchor.slug);
    if (!r) {
      errors.push(`Anchor refrigerant ${anchor.slug} not found in dataset.`);
      continue;
    }
    const point = r.ptChart.find((p) => p.tempF === anchor.tempF);
    if (!point) {
      errors.push(`${anchor.slug}: no PT point at ${anchor.tempF}°F.`);
      continue;
    }
    const actual = point.bubblePsig;
    const expected = anchor.expectedPsig;
    const diff = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1);
    if (diff > anchor.tolerance) {
      errors.push(
        `${anchor.slug} at ${anchor.tempF}°F: expected ~${expected} PSIG, got ${actual} PSIG ` +
          `(${(diff * 100).toFixed(1)}% off, tolerance ±${(anchor.tolerance * 100).toFixed(0)}%)`
      );
    }
  }

  // Physical-impossibility check: saturation pressure cannot exceed critical pressure.
  for (const r of refrigerants) {
    const critPsig = r.physical.critical.pressurePsig;
    if (critPsig === null || critPsig === undefined) continue;
    for (const p of r.ptChart) {
      if (p.bubblePsig > critPsig) {
        errors.push(
          `${r.slug}: saturation pressure ${p.bubblePsig} PSIG at ${p.tempF}°F ` +
            `exceeds critical pressure ${critPsig} PSIG (physically impossible).`
        );
      }
    }
  }

  // Contiguity invariant (Task 2, 2026-07): every refrigerant with a PT chart
  // must have entries at every 1°F step between its own [min, max] tempF. Prior
  // versions silently dropped 5-25-row gaps mid-range on zeotropic blends when
  // CoolProp's mixture solver failed to converge; the generator now interpolates
  // across those gaps and marks each filled point. This check makes sure future
  // regressions surface as build failures.
  //
  // Non-verified statuses (published-eos-not-in-build, manufacturer-datasheet-
  // published, historical-retired-refrigerant, no-commercial-data-published)
  // are allowed to have empty ptCharts by design — the page renders a source
  // notice instead. We only enforce contiguity when there's a chart at all.
  for (const r of refrigerants) {
    if (r.ptChart.length === 0) continue;
    const temps = new Set(r.ptChart.map((p) => p.tempF));
    const min = Math.min(...r.ptChart.map((p) => p.tempF));
    const max = Math.max(...r.ptChart.map((p) => p.tempF));
    const missing: number[] = [];
    for (let t = min; t <= max; t++) if (!temps.has(t)) missing.push(t);
    if (missing.length > 0) {
      const preview = missing.length <= 8
        ? missing.join(", ")
        : `${missing.slice(0, 6).join(", ")}, … (+${missing.length - 6} more)`;
      errors.push(
        `${r.slug}: ${missing.length} missing 1°F row(s) inside chart range ${min}–${max}°F: ${preview}. ` +
          `Middle-of-range gaps must be filled by generatePtChart interpolation; empty leading/trailing ranges are fine.`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}
