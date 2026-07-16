import { useId } from "react";
import { getRefrigerant } from "@/data/refrigerants";
import { seoName } from "@/lib/schema/shared";

/**
 * Legacy per-slug cylinder paints, sourced from the pre-2020 AHRI service-
 * cylinder color convention. These are the historical shipped colors, not
 * approximations — cylinders in the field still carry them on old stock.
 * Do NOT extend this map without a source: every color in it comes from
 * observed field practice or manufacturer publication, and adding one
 * without provenance re-introduces the fabrication failure mode this
 * codebase was rebuilt to structurally prevent.
 */
export const LEGACY_CYLINDER_COLORS: Record<
  string,
  { hex: string; name: string }
> = {
  "r-12": { hex: "#f2efe8", name: "white" },
  "r-22": { hex: "#9dc9a2", name: "light green" },
  "r-134a": { hex: "#a9cbe3", name: "light sky blue" },
  "r-404a": { hex: "#e8933d", name: "orange" },
  "r-410a": { hex: "#d96b7f", name: "rose" },
};

/**
 * AHRI Guideline N-2017 mandated cylinder color: RAL 7044 light gray-green,
 * approximated here in sRGB. All refrigerant service cylinders manufactured
 * from 2020 forward use this uniform color regardless of contents; safety
 * class differentiation is carried by the shoulder band, not the paint.
 */
export const AHRI_GRAY_HEX = "#b9bcab";

/**
 * AHRI Guideline N shoulder-band color for A2/A3 (flammable) refrigerants.
 * Explicit hardcoded red — safety-critical, does NOT invert in dark mode.
 */
export const AHRI_FLAMMABLE_BAND_HEX = "#dc2626";

export interface RefrigerantCylinderDiagramProps {
  slug: string;
  /** Paint color source. "current" (default) = AHRI Guideline N gray. "legacy" = pre-2020 color from LEGACY_CYLINDER_COLORS, or gray fallback if slug isn't in the map. */
  variant?: "current" | "legacy";
  /** Optional accessible-name override — used by the CylinderComparisonRow/Story wrappers so the two cylinders in a pair get distinct <title>s. */
  titleOverride?: string;
}

/**
 * Static SVG of a 25-lb DOT-approved refrigerant service cylinder. Dataset-
 * driven paint color + label; conditionally renders a red flammability band
 * on the shoulder when ASHRAE 34 class is A2/A2L/A3. No animation — physical
 * illustration only. Meets the pattern requirements from B4: inline SVG,
 * <title> + <desc>, role="img", aria-labelledby, viewBox-based scaling, no
 * absolute positioning.
 *
 * Colors: cylinder paint + red band are hardcoded hex (physical colors,
 * do not invert in dark mode). Metallic parts (valve, foot ring) adapt
 * to the ambient theme via currentColor. Label panel + text follow theme
 * tokens per the site convention.
 */
export function RefrigerantCylinderDiagram({
  slug,
  variant = "current",
  titleOverride,
}: RefrigerantCylinderDiagramProps) {
  const titleId = useId();
  const descId = useId();
  const r = getRefrigerant(slug);
  if (!r) return null;

  const legacy = LEGACY_CYLINDER_COLORS[slug];
  const paintHex =
    variant === "legacy" && legacy ? legacy.hex : AHRI_GRAY_HEX;
  const paintName =
    variant === "legacy" && legacy ? legacy.name : "AHRI Guideline N light gray-green (RAL 7044)";

  const hasFlammabilityBand =
    r.safetyClass.startsWith("A2") || r.safetyClass.startsWith("A3");

  const designation = seoName(r.displayName);
  const gwpText =
    r.environmental.gwp100Ar5 !== null
      ? `GWP ${r.environmental.gwp100Ar5}`
      : "GWP —";

  const titleText =
    titleOverride ??
    (variant === "legacy" && legacy
      ? `${r.displayName} pre-2020 ${legacy.name} service cylinder`
      : `${r.displayName} AHRI Guideline N service cylinder`);

  const descText =
    variant === "legacy" && legacy
      ? `Illustrated 25-pound DOT service cylinder for ${r.displayName} in the pre-2020 ${legacy.name} paint historically used for this refrigerant. ASHRAE 34 safety class ${r.safetyClass}${hasFlammabilityBand ? " — red flammability band on the shoulder per AHRI Guideline N" : " — no flammability band required"}. Label panel shows designation ${designation}, safety class ${r.safetyClass}, and 100-year GWP ${r.environmental.gwp100Ar5 ?? "unavailable"}.`
      : `Illustrated 25-pound DOT service cylinder for ${r.displayName} in the current AHRI Guideline N standard paint (RAL 7044 light gray-green, industry-uniform since 2020). ASHRAE 34 safety class ${r.safetyClass}${hasFlammabilityBand ? " — red flammability band on the shoulder per AHRI Guideline N" : " — no flammability band required"}. Label panel shows designation ${designation}, safety class ${r.safetyClass}, and 100-year GWP ${r.environmental.gwp100Ar5 ?? "unavailable"}.`;

  return (
    <svg
      viewBox="0 0 160 320"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className="h-auto w-full text-zinc-500 dark:text-zinc-400"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>{titleText}</title>
      <desc id={descId}>{descText}</desc>

      {/* Valve stem (metallic — currentColor adapts to light/dark theme) */}
      <rect x="72" y="10" width="16" height="18" rx="1.5" fill="currentColor" opacity="0.55" />
      {/* Handwheel */}
      <ellipse cx="80" cy="10" rx="14" ry="4" fill="currentColor" opacity="0.7" />
      <ellipse cx="80" cy="10" rx="10" ry="2.5" fill="currentColor" opacity="0.4" />

      {/* Shoulder curve — painted */}
      <path
        d="M 30 60 Q 30 32 80 32 Q 130 32 130 60 Z"
        fill={paintHex}
      />
      {/* Shoulder highlight (subtle spec) */}
      <ellipse cx="80" cy="42" rx="42" ry="4" fill="#ffffff" opacity="0.12" />

      {/* Cylindrical body — painted */}
      <rect x="30" y="60" width="100" height="222" fill={paintHex} />

      {/* Red flammability band (A2/A3 only) — sits just below the shoulder curve, hardcoded red */}
      {hasFlammabilityBand ? (
        <rect x="30" y="60" width="100" height="20" fill={AHRI_FLAMMABLE_BAND_HEX} />
      ) : null}

      {/* Collar handle — thin metallic ring around the shoulder */}
      <path
        d="M 30 60 L 22 60 L 22 66 L 30 66 M 130 60 L 138 60 L 138 66 L 130 66"
        fill="currentColor"
        opacity="0.45"
      />

      {/* Body edge shadow (right side, subtle) */}
      <rect x="118" y="80" width="12" height="200" fill="#000000" opacity="0.08" />

      {/* Foot ring */}
      <rect x="28" y="282" width="104" height="12" fill={paintHex} />
      <rect x="24" y="290" width="112" height="10" fill="currentColor" opacity="0.4" />
      <rect x="34" y="295" width="92" height="8" fill="currentColor" opacity="0.2" />

      {/* Label panel — theme-adapting per site convention */}
      <g className="text-zinc-900 dark:text-zinc-100">
        <rect
          x="40"
          y="155"
          width="80"
          height="88"
          rx="2"
          className="fill-white dark:fill-zinc-800"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        <text
          x="80"
          y="180"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="currentColor"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {designation}
        </text>
        <line x1="50" y1="188" x2="110" y2="188" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
        <text
          x="80"
          y="203"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="currentColor"
          opacity="0.85"
        >
          {r.safetyClass}
        </text>
        <text
          x="80"
          y="220"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
          opacity="0.7"
        >
          {gwpText}
        </text>
        <text
          x="80"
          y="236"
          textAnchor="middle"
          fontSize="7"
          fill="currentColor"
          opacity="0.55"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          25 LB · NET WT
        </text>
      </g>

      {/* Bottom foot shadow */}
      <ellipse cx="80" cy="308" rx="52" ry="3" fill="#000000" opacity="0.12" />
    </svg>
  );
}

/**
 * Utility used by the Story + ComparisonRow wrappers to describe the paint
 * they render, without duplicating the LEGACY_CYLINDER_COLORS map lookup.
 */
export function describeCylinderPaint(
  slug: string,
  variant: "current" | "legacy",
): { hex: string; name: string; isLegacy: boolean } {
  const legacy = LEGACY_CYLINDER_COLORS[slug];
  if (variant === "legacy" && legacy) {
    return { hex: legacy.hex, name: legacy.name, isLegacy: true };
  }
  return { hex: AHRI_GRAY_HEX, name: "light gray-green (RAL 7044)", isLegacy: false };
}
