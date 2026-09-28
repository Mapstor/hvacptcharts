/**
 * Single source of truth for how temperature glide is defined and where the
 * dataset's stored value is evaluated, so the wording and sign convention can't
 * drift across pages.
 *
 * The dataset's `physical.temperatureGlideF` is computed by the CoolProp
 * generator (scripts/generate-refrigerant-data.mjs) as the dew-point temperature
 * minus the bubble-point temperature at a fixed pressure, evaluated at 0 °C.
 * These constants mirror that reference condition.
 */
export const GLIDE_REFERENCE_C = 0;
export const GLIDE_REFERENCE_F = 32;

/** Canonical one-line definition of temperature glide. Glide is a non-negative
 *  magnitude — zero for pure refrigerants and azeotropes. */
export const GLIDE_DEFINITION =
  "Temperature glide is the dew-point temperature minus the bubble-point temperature at the same pressure — zero for pure refrigerants and azeotropes, larger for wide-boiling zeotropic blends.";

/** The definition with the dataset's reference condition appended, for pages
 *  that render the stored glide value. */
export const GLIDE_DEFINITION_WITH_REFERENCE = `${GLIDE_DEFINITION} The dataset value is evaluated at ${GLIDE_REFERENCE_C} °C (${GLIDE_REFERENCE_F} °F).`;
