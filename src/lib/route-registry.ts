import { listComparisons } from "@/lib/mdx-comparison";

/**
 * Single source of truth for the site-section counts that appear in prose
 * (homepage blurbs, hub intros). Kept in one place so a hand-typed "9
 * calculators" can never drift from what actually ships again — the numbers the
 * copy quotes are computed from these route lists / the comparison corpus at
 * build time. The route lists mirror the sections in `src/app/sitemap.ts`.
 */

/** Interactive calculators (the "Calculators" section of the sitemap). */
export const CALCULATOR_ROUTES = [
  "/pt-calculator/",
  "/superheat-calculator/",
  "/subcooling-calculator/",
  "/pt-superheat-subcooling-calculator/",
  "/saturation-properties-calculator/",
  "/refrigerant-pt-comparison-tool/",
  "/refrigerant-charge-calculator/",
  "/refrigerant-retrofit-compatibility-calculator/",
  "/system-pressure-diagnostic-calculator/",
  "/psychrometric-calculator/",
  "/duct-size-calculator/",
  "/hvac-load-calculator/",
] as const;

/** Long-form conceptual + troubleshooting guides (the guide routes in the sitemap). */
export const LONG_FORM_GUIDE_ROUTES = [
  "/superheat-subcooling-fundamentals/",
  "/pt-chart-guide/",
  "/refrigerant-comparison-guide/",
  "/high-head-pressure-causes/",
  "/high-suction-low-head-pressure/",
  "/ac-low-side-pressure-too-high/",
  "/low-suction-pressure/",
  "/ac-compressor-short-cycling/",
  "/overcharged-ac-symptoms/",
  "/refrigerant-prices-guide/",
  "/hvac-troubleshooting-guide/",
  "/hvac-refrigerant-recovery-guide/",
  "/hvac-ductless-mini-split-guide/",
] as const;

export const CALCULATOR_COUNT = CALCULATOR_ROUTES.length;

/** Pair-comparison pages, counted from the comparison MDX corpus (the same
 *  source `listComparisons()` drives every comparison route). */
export const COMPARISON_COUNT = listComparisons().length;

export const LONG_FORM_GUIDE_COUNT = LONG_FORM_GUIDE_ROUTES.length;
