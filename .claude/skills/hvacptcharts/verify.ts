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

  return { ok: errors.length === 0, errors };
}
