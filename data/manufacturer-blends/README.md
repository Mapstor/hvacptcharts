# Manufacturer blend PT data

CoolProp 7.2.0 does not model these refrigerants directly. Each one needs its PT chart **transcribed digit-by-digit from the named manufacturer datasheet** — no interpolation, no estimation, no LLM inference.

Per `docs/spec/01-DATA_SCHEMA.md` §Manual Entry: spot-check the transcribed values at -40°F, 0°F, 70°F, 100°F, 130°F against a second source before committing.

## Current state

Each file in this directory is a skeleton: `ptChart: []` plus physical properties from the named datasheet's summary table. The generator (`scripts/generate-refrigerant-data.mjs` or `.py`) reads these skeletons during a run; an empty `ptChart` array is valid per the Zod schema but the refrigerant's `/refrigerant/{slug}/` page will render without saturation data until the table is filled in.

| Slug | Source datasheet (TODO: transcribe) |
|---|---|
| `r-1150` | NIST WebBook (Ethylene), subcritical region only (Tcrit ≈ 9.2°C / 48.6°F) |
| `r-1224yd-z` | AGC AMOLEA 1224yd technical data sheet |
| `r-1233zd-z` | Honeywell datasheet (Z-isomer, specialty applications) |
| `r-1336mzz-z` | Chemours Opteon 1100 technical data sheet |
| `r-438a` | Honeywell Genetron MO99 technical data sheet |
| `r-448a` | Honeywell Solstice N40 (R-448A) technical data sheet |
| `r-450a` | Chemours Opteon XP10 (R-450A) technical data sheet |
| `r-503` | ASHRAE Handbook of Refrigeration 2022 (historical tables) |
| `r-514a` | Chemours Opteon XP30 (R-514A) technical data sheet |
| `r-515a` | Honeywell Solstice 515A technical data sheet |
| `r-515b` | Honeywell Solstice N15 (R-515B) technical data sheet |

> **Note:** `r-427a` was reclassified from "manual" to "coolprop" (uses `R427A.mix` predefined). CoolProp 7.2.0 added the predefined `.mix` for this blend after the spec was written.

## Per-file format

```jsonc
{
  "slug": "r-XYZA",
  "ptSource": "<<Verbatim citation: title, year, page>>",
  "ptSourceUrl": "https://...",
  "verifiedBy": "Cross-checked against <<second source>>",
  "physical": { ... summary from datasheet ... },
  "ptChart": [
    { "tempF": -40, "tempC": -40, "bubblePsig": ..., "dewPsig": ..., ... },
    { "tempF": -35, "tempC": -37.2, ... },
    ...
    { "tempF": 150, "tempC": 65.6, ... }
  ]
}
```
