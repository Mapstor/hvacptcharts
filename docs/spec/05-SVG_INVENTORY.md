# SVG_INVENTORY.md

The visual differentiator. Competitors render PT data as plain HTML tables and stock illustrations; we render data-driven SVGs that update with the refrigerant being viewed. Every diagram is a React component with typed props, consuming data from `getRefrigerant(slug)`. No stock images. No raster.

## Why SVG, why custom

- **Crisp at every zoom.** Mobile field techs zoom in on diagrams; raster pixelates, SVG stays sharp.
- **Themable.** Dark mode = swap CSS variables. No re-exporting from Figma.
- **Indexable.** Text inside SVG is text, not pixels. Search engines and screen readers read it.
- **Data-driven.** Every value in the diagram comes from the refrigerant record. R-410A's PT curve and R-32's PT curve are the same component with different data. No 61 hand-drawn diagrams.
- **Light.** A 4KB inline SVG beats a 60KB PNG.

## Conventions across all SVG components

```typescript
// All components share these prop conventions
type CommonSVGProps = {
  className?: string;          // For Tailwind overrides
  width?: number;              // Defaults to responsive
  height?: number;
  ariaLabel: string;           // Required — accessibility
  theme?: 'light' | 'dark' | 'auto';  // 'auto' = follow system
};

// Color tokens (CSS variables defined in globals.css)
// --c-bubble:  hsl(220 60% 50%)   — bubble point line (blue)
// --c-dew:     hsl(280 60% 50%)   — dew point line (purple)
// --c-axis:    hsl(0 0% 30%)      — axis lines
// --c-grid:    hsl(0 0% 88%)      — grid lines
// --c-text:    hsl(0 0% 15%)      — labels
// --c-accent:  hsl(15 80% 50%)    — hover/active states
// --c-safe-a1: hsl(140 60% 45%)   — A1 safety class
// --c-safe-a2l: hsl(50 90% 50%)   — A2L
// --c-safe-a3: hsl(0 80% 50%)     — A3
// --c-safe-b2l: hsl(0 80% 30%)    — B2L (toxic + flammable)

// All numbers in SVG come from props. No literals.
```

## File layout

```
src/components/svg/
  PTCurve.tsx               — single-refrigerant PT chart
  PTCurveOverlay.tsx        — comparison page: two PT curves
  CycleDiagram.tsx          — 4-stage refrigeration cycle, refrigerant-specific
  PhDiagram.tsx             — pressure-enthalpy diagram with saturation dome
  SystemLayout.tsx          — residential split system layout (generic)
  GlideVisualization.tsx    — bubble/dew temperature spread across evaporator
  GWPComparisonBar.tsx      — bar chart of refrigerant vs alternatives
  PhaseDownTimeline.tsx     — AIM Act / Kigali / Montreal Protocol timeline
  PressureGauge.tsx         — analog-style gauge showing normal/high/low side
  SafetyClassChip.tsx       — A1/A2L/A3/B2L chip with hover detail
  SaturationDome.tsx        — generic dome diagram for explainer pages

src/components/refrigerant/   — wrappers that consume getRefrigerant() and pass to SVG
  RefrigerantPTCurve.tsx
  RefrigerantCycle.tsx
  RefrigerantPhaseDown.tsx
  ...
```

Pattern: pure SVG components in `svg/` take typed primitive props. Wrappers in `refrigerant/` take a slug, fetch the refrigerant, and pass the relevant slice. This makes the SVGs reusable (e.g. PTCurve takes `points: PTPoint[]` so the comparison overlay can pass different data).

---

## 1. `<PTCurve>` — single-refrigerant PT chart

The flagship visual. Replaces the plain HTML table as the primary above-the-fold element on each refrigerant page (table moves below for those who want it).

### Props

```typescript
type PTCurveProps = CommonSVGProps & {
  points: PTPoint[];           // typically 191 points (-40 to 150°F)
  hasGlide: boolean;            // if true, render two curves; if false, one
  unit: 'psig' | 'kpag';        // y-axis unit
  tempUnit: 'F' | 'C';          // x-axis unit
  highlightTempF?: number;      // optional: vertical line at this temp
  ambientF?: number;            // optional: shaded "operating range" band
};
```

### Visual spec

- **Canvas:** `viewBox="0 0 800 480"`, scales fluidly.
- **Margins:** 60px left (y-axis labels), 50px bottom (x-axis labels), 20px right and top.
- **X-axis:** temperature. Linear scale. Major ticks every 25°F (or 10°C), minor every 5°F.
- **Y-axis:** pressure. Linear scale by default, log scale toggleable for refrigerants with very wide pressure ranges (R-744 goes from -257 PSIG at -40°F to 1042 PSIG at 87°F — log helps).
- **Grid:** light grey lines at every major tick. `stroke-dasharray="2 2"`.
- **Curves:**
  - If `!hasGlide`: single bubble-equals-dew line in `--c-bubble`.
  - If `hasGlide`: two lines, bubble in `--c-bubble`, dew in `--c-dew`. Shaded region between them at `fill-opacity: 0.1` so the glide is visually obvious.
- **Hover/touch:** crosshair tracking. Tooltip shows temp + bubble + dew + glide.
- **Highlight:** if `highlightTempF` is provided, draw a dashed vertical line at that temp with the value labeled. Used to show "at 70°F" on the refrigerant card.
- **Legend:** top-right. "Bubble point" / "Dew point" / "Operating range" (if shown).
- **Critical point marker:** if the point falls within the visible range, mark with a small × and label "Critical point — no saturation above this temperature."

### Mobile considerations

At narrow widths (<480px), the chart switches to portrait orientation: temperature on Y (top to bottom), pressure on X. This matches how a field tech naturally reads "find your temperature, read across." Toggleable.

### Implementation sketch

```tsx
import { useMemo } from 'react';

export function PTCurve({
  points, hasGlide, unit, tempUnit,
  highlightTempF, ambientF,
  ariaLabel, className,
}: PTCurveProps) {
  const scaled = useMemo(() => {
    // Compute scaled x,y pairs in SVG coordinates.
    const xField = tempUnit === 'F' ? 'tempF' : 'tempC';
    const yFieldBubble = unit === 'psig' ? 'bubblePsig' : 'bubbleKpag';
    const yFieldDew = unit === 'psig' ? 'dewPsig' : 'dewKpag';

    const xs = points.map(p => p[xField]);
    const ysBubble = points.map(p => p[yFieldBubble]);
    const ysDew = points.map(p => p[yFieldDew]);

    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ysBubble, ...ysDew);
    const yMax = Math.max(...ysBubble, ...ysDew);

    const PAD_L = 60, PAD_R = 20, PAD_T = 20, PAD_B = 50;
    const W = 800, H = 480;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * plotW;
    const yScale = (v: number) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    const bubblePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p[xField])},${yScale(p[yFieldBubble])}`)
      .join(' ');

    const dewPath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p[xField])},${yScale(p[yFieldDew])}`)
      .join(' ');

    return { bubblePath, dewPath, xScale, yScale, xMin, xMax, yMin, yMax };
  }, [points, unit, tempUnit]);

  // ... axis ticks, hover handler, etc.

  return (
    <svg viewBox="0 0 800 480" role="img" aria-label={ariaLabel} className={className}>
      {/* Grid */}
      {/* Axes */}
      {/* Curves */}
      <path d={scaled.bubblePath} stroke="var(--c-bubble)" strokeWidth="2" fill="none" />
      {hasGlide && (
        <path d={scaled.dewPath} stroke="var(--c-dew)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
      )}
      {/* Optional highlight + ambient band */}
      {/* Hover overlay */}
    </svg>
  );
}
```

---

## 2. `<PTCurveOverlay>` — comparison page

Same shape as `<PTCurve>` but takes two refrigerants. Used on `/r-32-vs-r-410a/` and similar.

### Props

```typescript
type PTCurveOverlayProps = CommonSVGProps & {
  refrigerantA: { name: string; points: PTPoint[]; hasGlide: boolean; color?: string };
  refrigerantB: { name: string; points: PTPoint[]; hasGlide: boolean; color?: string };
  unit: 'psig' | 'kpag';
  tempUnit: 'F' | 'C';
};
```

### Visual differences from `<PTCurve>`

- Two curves on the same plot, distinct colors (default: A=blue, B=red).
- If either has glide, shows both bubble and dew for that one (up to 4 lines total).
- Legend has 4 entries when both have glide.
- Hover tooltip shows both refrigerants at the hovered temperature, plus the delta.

---

## 3. `<CycleDiagram>` — refrigeration cycle

A 4-stage cycle diagram with the working refrigerant's actual values at each stage. Used on Tier 1 refrigerant pages and explainer guides.

### Props

```typescript
type CycleDiagramProps = CommonSVGProps & {
  refrigerantName: string;
  /** Operating conditions to overlay on the diagram. */
  conditions: {
    /** Suction (evaporator outlet) — low pressure side. */
    suctionPsig: number;
    suctionTempF: number;
    /** Discharge (compressor outlet) — high pressure side. */
    dischargePsig: number;
    dischargeTempF: number;
    /** Liquid line (condenser outlet). */
    liquidPsig: number;
    liquidTempF: number;
    /** Evaporator inlet (post-expansion). */
    evapInletPsig: number;
    evapInletTempF: number;
  };
};
```

### Visual spec

- **Layout:** 4 boxes connected in a loop, clockwise from top-left:
  - Compressor (top-left, with motor icon)
  - Condenser (top-right, with fan/airflow indication)
  - Expansion device (bottom-right, TXV symbol)
  - Evaporator (bottom-left, with fan/airflow indication)
- **Pipe connections:** Color-coded:
  - Hot vapor (compressor → condenser): red
  - Warm liquid (condenser → expansion): amber
  - Cold mix (expansion → evaporator): light blue
  - Cool vapor (evaporator → compressor): cyan
- **Labels at each pipe:** State (vapor / liquid / mix), PSIG, °F. Numbers from props.
- **Pressure indicators:** Small gauge icons at suction and discharge ports.
- **Direction arrows:** Animated SVG `<animateMotion>` on the pipes — subtle, optional based on `prefers-reduced-motion`.

### Data flow

Wrapper component computes typical operating conditions for the refrigerant:

```typescript
// src/components/refrigerant/RefrigerantCycle.tsx
import { getRefrigerant, getPressureAtTempF } from '@/data/refrigerants';
import { CycleDiagram } from '@/components/svg/CycleDiagram';

export function RefrigerantCycle({ slug }: { slug: string }) {
  const r = getRefrigerant(slug);
  if (!r) return null;

  // Standard residential cooling conditions: 95°F outdoor, 75°F indoor return.
  // Evap temp typically 40°F, condenser temp typically 110°F.
  const suctionSat = getPressureAtTempF(slug, 40);
  const dischargeSat = getPressureAtTempF(slug, 110);

  // Apply typical superheat (10°F) and subcooling (10°F)
  return (
    <CycleDiagram
      refrigerantName={r.displayName}
      conditions={{
        suctionPsig: suctionSat?.bubble ?? 0,
        suctionTempF: 50, // 40 + 10°F superheat
        dischargePsig: dischargeSat?.bubble ?? 0,
        dischargeTempF: 180, // typical
        liquidPsig: dischargeSat?.bubble ?? 0,
        liquidTempF: 100, // 110 - 10°F subcooling
        evapInletPsig: suctionSat?.bubble ?? 0,
        evapInletTempF: 40,
      }}
      ariaLabel={`Refrigeration cycle diagram for ${r.displayName}`}
    />
  );
}
```

Every number on the diagram traces back to the data layer. R-410A's diagram and R-22's diagram are visually identical except for the numbers — and the numbers are correct because they're computed.

---

## 4. `<PhDiagram>` — pressure-enthalpy diagram

The classic textbook P-h diagram with the saturation dome and the refrigeration cycle traced on it. Tier 1 refrigerants only (it's complex and needs enthalpy data, which CoolProp gives us for pures but not always for blends).

### Props

```typescript
type PhDiagramProps = CommonSVGProps & {
  /** Saturation dome boundary points: bubble curve + dew curve in enthalpy-pressure space. */
  domePoints: Array<{ enthalpyKjPerKg: number; pressurePsia: number; isBubble: boolean }>;
  /** Optional: cycle points to overlay (compressor in/out, condenser out, evap in). */
  cyclePoints?: Array<{ enthalpyKjPerKg: number; pressurePsia: number; label: string }>;
  /** Critical point marker. */
  criticalPoint?: { enthalpyKjPerKg: number; pressurePsia: number };
};
```

### Generation

P-h dome data computed at build time via CoolProp:

```python
# In scripts/generate-refrigerant-data.py, additional pass for Tier 1
def generate_ph_dome(cp_identifier: str) -> list[dict]:
    points = []
    # Walk from triple point to critical point in temperature
    T_triple = CP.PropsSI('Ttriple', cp_identifier)
    T_crit = CP.PropsSI('Tcrit', cp_identifier)
    for T in np.linspace(T_triple + 5, T_crit - 0.5, 80):
        # Bubble curve (Q=0)
        P_b = CP.PropsSI('P', 'T', T, 'Q', 0, cp_identifier)
        H_b = CP.PropsSI('H', 'T', T, 'Q', 0, cp_identifier) / 1000  # J/kg → kJ/kg
        # Dew curve (Q=1)
        P_d = CP.PropsSI('P', 'T', T, 'Q', 1, cp_identifier)
        H_d = CP.PropsSI('H', 'T', T, 'Q', 1, cp_identifier) / 1000
        points.append({'enthalpyKjPerKg': H_b, 'pressurePsia': P_b * PSI_PER_PA, 'isBubble': True})
        points.append({'enthalpyKjPerKg': H_d, 'pressurePsia': P_d * PSI_PER_PA, 'isBubble': False})
    return sorted(points, key=lambda p: (p['isBubble'], p['enthalpyKjPerKg']))
```

Stored in `refrigerant.phDome` field (optional — only Tier 1 refrigerants have it).

### Visual spec

- Log scale on pressure (Y-axis).
- Linear on enthalpy (X-axis).
- Saturation dome drawn as a closed path: bubble curve up the left side, dew curve down the right side, meeting at critical point.
- Subcritical region shaded lightly.
- Isotherms (optional, 5 lines at common temps) as light grey curves.
- Cycle overlay: 4 connected line segments showing compression, condensation, expansion, evaporation, with arrows.

---

## 5. `<SystemLayout>` — residential split system

Static educational diagram. Used on homepage, PT chart guide, what-pressure pages.

### Props

```typescript
type SystemLayoutProps = CommonSVGProps & {
  showLabels?: boolean;
  highlightComponent?: 'outdoor-unit' | 'indoor-unit' | 'liquid-line' | 'suction-line';
  /** Optional pressure overlay (if the page is talking about pressures). */
  pressures?: {
    liquidPsig: number;
    suctionPsig: number;
  };
};
```

### Visual spec

- House cutaway (left side): walls, roof, indoor unit (evaporator coil) shown, ductwork hinted.
- Outdoor unit on right: condenser coil, compressor, fan.
- Connecting lines: liquid (small) and suction (insulated, larger) crossing the wall.
- Optional pressure tags overlay on each line.
- All shapes are simple geometric primitives — no photorealism, no stock illustration. Looks like a technical drawing.

---

## 6. `<GlideVisualization>` — bubble/dew across evaporator

Shows why temperature glide matters. Used on refrigerant pages where `hasSignificantGlide === true` (R-407C, R-448A, R-449A, R-454C, R-455A, R-457A, etc.).

### Props

```typescript
type GlideVisualizationProps = CommonSVGProps & {
  refrigerantName: string;
  /** Constant pressure (suction side typical operating pressure). */
  pressurePsig: number;
  /** Temperature at bubble point (start of evaporation). */
  bubbleTempF: number;
  /** Temperature at dew point (end of evaporation). */
  dewTempF: number;
};
```

### Visual spec

- Horizontal evaporator coil drawn as a rectangle, refrigerant flow indicated left-to-right.
- Refrigerant enters at left as a two-phase mix at the bubble temp.
- Color gradient along the coil: cold/blue at entry, warming toward dew temp at exit.
- Temperature labels at entry, midpoint, exit.
- A small chart below shows the temperature profile across the coil (line graph), with the glide marked as a vertical bracket.
- Caption: "At constant pressure, R-407C boils from {bubble}°F to {dew}°F across the evaporator. This {glide}°F glide affects EXV sizing and superheat measurement."

---

## 7. `<GWPComparisonBar>` — refrigerant GWP vs alternatives

Horizontal bar chart. Used on every refrigerant page and on the GWP rankings page.

### Props

```typescript
type GWPComparisonBarProps = CommonSVGProps & {
  bars: Array<{
    name: string;
    gwp: number;
    safetyClass: SafetyClass;
    isCurrent?: boolean;     // highlight the refrigerant being viewed
  }>;
  /** Reference lines for regulatory thresholds. */
  referenceLines?: Array<{ value: number; label: string }>; // e.g. EU F-Gas 150, AIM Act 700
};
```

### Visual spec

- Horizontal bars sorted by GWP, lowest at top.
- Each bar:
  - Length proportional to GWP (linear scale up to 4000; log toggle for outliers).
  - Color by safety class (A1 green, A2L yellow, A3 red, B2L dark red).
  - Bar for "current" refrigerant has a stroke outline highlighting it.
- Reference lines: vertical dashed lines with labels, e.g.:
  - "150" → "EU F-Gas threshold for stationary refrigeration"
  - "700" → "AIM Act new equipment threshold"
- Labels at the right end of each bar showing the GWP value.

### Default bars per page

For the R-410A page, the bars are: R-32, R-454B, R-452B, R-454C, R-454A, R-410A (current), R-407C. Roughly 6-8 alternatives in the same use case category.

The data source: a `comparisonGroup` field on each refrigerant — `"residential-ac"`, `"commercial-refrigeration-medium-temp"`, `"low-temp-refrigeration"`, `"automotive-ac"`, `"chillers"`, `"heat-pumps-residential"`, etc. The bar component pulls all refrigerants in the same group from the dataset.

---

## 8. `<PhaseDownTimeline>` — regulatory timeline

For refrigerants under active phase-out or phase-down. Shows when production stops, when service-only begins, when total bans take effect.

### Props

```typescript
type PhaseDownTimelineProps = CommonSVGProps & {
  refrigerantName: string;
  milestones: Array<{
    date: string;             // ISO date
    label: string;            // "Production phase-down begins"
    severity: 'info' | 'warning' | 'critical';
    citation: string;         // source ID, e.g. "epa-aim-act"
  }>;
  showCurrentDate?: boolean;
};
```

### Visual spec

- Horizontal timeline with year markers.
- Milestones as labeled markers above/below the line, alternating to avoid label overlap.
- Severity colors: info=blue, warning=amber, critical=red.
- Current date marker as a dashed vertical line.
- Citations rendered as superscript footnote markers linking to the sources registry.

### Example data for R-22

```typescript
milestones: [
  { date: '2010-01-01', label: 'New equipment production banned in US (HCFC phase-out)', severity: 'warning', citation: 'epa-section-608' },
  { date: '2020-01-01', label: 'Virgin R-22 production banned in US', severity: 'critical', citation: 'epa-section-608' },
  { date: '2030-01-01', label: 'Service supply limited to reclaimed R-22 only', severity: 'critical', citation: 'epa-section-608' },
]
```

### Example data for R-410A

```typescript
milestones: [
  { date: '2025-01-01', label: 'New residential AC equipment production transitions to A2L refrigerants', severity: 'warning', citation: 'epa-aim-act' },
  { date: '2029-01-01', label: 'AIM Act phase-down: 70% reduction baseline', severity: 'warning', citation: 'epa-aim-act' },
  { date: '2036-01-01', label: 'AIM Act phase-down: 85% reduction baseline', severity: 'critical', citation: 'epa-aim-act' },
]
```

---

## 9. `<PressureGauge>` — analog-style gauge

For the what-pressure-should pages and diagnostic calculator. Shows where the current reading falls on a normal/low/high spectrum.

### Props

```typescript
type PressureGaugeProps = CommonSVGProps & {
  /** Current measured reading. */
  valuePsig: number;
  /** Normal operating range. */
  normalMin: number;
  normalMax: number;
  /** Full gauge range. */
  rangeMin: number;
  rangeMax: number;
  label: string;          // "Suction (Low Side)" or "Discharge (High Side)"
  unit?: 'psig' | 'kpag';
};
```

### Visual spec

- Semi-circular gauge (180° arc), 200×120 viewBox.
- Color zones:
  - Below `normalMin`: blue zone (too low)
  - `normalMin` to `normalMax`: green zone (normal)
  - Above `normalMax`: red zone (too high)
- Needle pointing to current value, animated transition on prop change (`<animate>` with `prefers-reduced-motion` respect).
- Value displayed numerically below the gauge.
- Label above.

Used in pairs (low side + high side) on diagnostic pages.

---

## 10. `<SafetyClassChip>` — flammability/toxicity classification

Small inline component that goes in every refrigerant page hero. Replaces the buried "Lower Flammability Limit: None" text on the current site with a prominent, color-coded chip.

### Props

```typescript
type SafetyClassChipProps = CommonSVGProps & {
  safetyClass: SafetyClass;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'chip' | 'card';  // chip = inline, card = standalone with explanation
};
```

### Visual spec

- **A1** (non-toxic, non-flammable): green background, "A1" label, "Non-flammable" subtext.
- **A2L** (non-toxic, mildly flammable): yellow/amber background, "A2L" label, "Mildly flammable — special handling" subtext.
- **A2** (non-toxic, flammable): orange background, "A2" label.
- **A3** (non-toxic, highly flammable): red background, "A3" label, "Highly flammable — propane/isobutane class" subtext.
- **B1** (toxic, non-flammable): dark blue, "B1" label, "Toxic — see PEL" subtext.
- **B2L** (toxic, mildly flammable): dark red, "B2L" label, "Toxic and mildly flammable — ammonia class" subtext.

### Tooltip / expanded card

Clicking/hovering reveals:
- Full ASHRAE 34 description.
- Workplace exposure limit (PEL/TLV) if toxic.
- Lower flammability limit (LFL) if flammable.
- Special handling requirements summary.
- Link to `/refrigerant-safety-classifications/` for full reference.

### Why this matters

The current site says every refrigerant is "A1 non-flammable" because of the template-swap bug. Installers reading the page for R-32 (A2L) and acting on it could spark explosions. The chip is structural: it reads from `refrigerant.safetyClass` (a Zod-validated enum). It is **impossible** to render an R-32 page that says A1.

---

## 11. `<SaturationDome>` — generic explainer dome

Educational, used on the PT chart guide page and refrigerant fundamentals pages.

### Props

```typescript
type SaturationDomeProps = CommonSVGProps & {
  showLabels?: boolean;
  showRegions?: boolean;        // shade subcooled / two-phase / superheated regions
  highlightState?: 'subcooled' | 'two-phase' | 'superheated' | 'critical';
};
```

### Visual spec

- Generic (non-refrigerant-specific) saturation dome.
- Subcooled region (left of bubble curve) shaded blue.
- Two-phase region (under the dome) shaded purple.
- Superheated region (right of dew curve) shaded red.
- Critical point marked at the top.
- Triple point optional.

Pedagogical, not data-driven. Used to teach the concepts on the explainer pages.

---

## Implementation order in the CC build sequence

The SVGs are built bottom-up in this order:

1. **`SafetyClassChip`** — small, simple, used everywhere. Build first, ship to every refrigerant hero.
2. **`PTCurve`** — flagship. Highest impact. Build second.
3. **`GWPComparisonBar`** — high SEO value (used on rankings page) and on every refrigerant page.
4. **`CycleDiagram`** — the "wow" component. Tier 1 refrigerants and explainer pages.
5. **`PhaseDownTimeline`** — for regulated refrigerants.
6. **`PressureGauge`** — for what-pressure pages.
7. **`GlideVisualization`** — for blends with significant glide.
8. **`SystemLayout`** — homepage, explainer pages.
9. **`PTCurveOverlay`** — comparison pages.
10. **`SaturationDome`** — explainer guides.
11. **`PhDiagram`** — Tier 1 refrigerants, advanced explainer pages. Most complex; last.

Each component is built standalone in Storybook (or a `/dev/svg-gallery/` route) with mock data. Once it passes visual review, it gets wired into the refrigerant template via the wrapper components in `src/components/refrigerant/`.

## What we are NOT building

To keep scope sane:

- **No 3D visualizations.** Pure 2D SVG. Three.js stays out.
- **No animated chart transitions** beyond simple opacity/position interpolations.
- **No drag-to-pan or zoom on charts.** Static viewport, mobile-pinch is enough.
- **No Recharts.** Lighter to hand-roll SVG for the use cases above; Recharts dependency would be ~80KB for what's solvable in ~3KB per component.
- **No D3 dependency** in the runtime. We use D3's scale functions if needed via `d3-scale` as an isolated dependency, but the rendering is pure SVG — no d3-selection, no DOM manipulation outside React.

The total weight of all 11 SVG components: well under 50KB minified. Compare to the current Chart.js setup (~85KB just for the library) used to render wrong data.
