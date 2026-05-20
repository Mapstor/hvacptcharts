/**
 * Shared types and helpers for the SVG components in src/components/svg/.
 *
 * Color tokens are CSS variables — defined in src/app/globals.css and consumed
 * via `var(--c-*)` in SVG `stroke` / `fill` attributes. No color literals in
 * components; this is the contract that makes dark mode and theme swaps work.
 *
 * Per docs/spec/05-SVG_INVENTORY.md.
 */

import type { SafetyClass } from "@/data/refrigerants";

export type Theme = "light" | "dark" | "auto";

export interface CommonSVGProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  /** REQUIRED — every data-bearing SVG must have an aria-label. */
  ariaLabel: string;
  /** "auto" follows `prefers-color-scheme`. */
  theme?: Theme;
}

/**
 * Safety-class → CSS var mapping. The components use these to pick a `fill`
 * color from the dark-mode-aware palette in globals.css.
 */
export const SAFETY_CLASS_VAR: Record<SafetyClass, string> = {
  A1: "--c-safe-a1",
  A2: "--c-safe-a2",
  A2L: "--c-safe-a2l",
  A3: "--c-safe-a3",
  B1: "--c-safe-b1",
  B2: "--c-safe-b2",
  B2L: "--c-safe-b2l",
  B3: "--c-safe-b3",
};

export function safetyClassColor(c: SafetyClass): string {
  return `var(${SAFETY_CLASS_VAR[c]})`;
}

/**
 * Round a numeric scale value to a stable SVG coordinate. Three decimal places
 * is enough for sub-pixel anti-aliasing without bloating the output path.
 */
export function svgRound(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Build an SVG `<path d="...">` string from a series of (x, y) coordinate
 * functions. The first point is M (moveto); the rest are L (lineto).
 */
export function svgPath<T>(
  points: T[],
  xOf: (p: T) => number,
  yOf: (p: T) => number
): string {
  if (points.length === 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const x = svgRound(xOf(points[i]));
    const y = svgRound(yOf(points[i]));
    parts.push(`${i === 0 ? "M" : "L"}${x},${y}`);
  }
  return parts.join(" ");
}

/**
 * Build a closed polygon path connecting an "upper" series and a "lower" series.
 * Used by PTCurve to shade the glide region between bubble and dew curves.
 */
export function svgClosedRegion<T>(
  upper: T[],
  lower: T[],
  xOf: (p: T) => number,
  yUpperOf: (p: T) => number,
  yLowerOf: (p: T) => number
): string {
  if (upper.length === 0 || lower.length === 0) return "";
  const upperPath = svgPath(upper, xOf, yUpperOf);
  const lowerReversed = [...lower].reverse();
  const back = lowerReversed
    .map((p) => `L${svgRound(xOf(p))},${svgRound(yLowerOf(p))}`)
    .join(" ");
  return `${upperPath} ${back} Z`;
}

/**
 * Nice round tick values for an axis with given range and approximate count.
 * Picks 1/2/5 × 10^k step sizes so labels stay readable.
 */
export function niceTicks(min: number, max: number, approxCount = 6): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min];
  const range = max - min;
  const raw = range / approxCount;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step =
    norm < 1.5 ? 1 * mag : norm < 3 ? 2 * mag : norm < 7 ? 5 * mag : 10 * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.0001; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}
