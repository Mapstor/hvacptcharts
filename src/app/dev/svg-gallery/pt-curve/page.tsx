import { RefrigerantPTCurve } from "@/components/refrigerant/RefrigerantPTCurve";

export default function GalleryPTCurve() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold">R-22 — pure HCFC (no glide)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Single bubble curve only; bubble = dew at every temperature. Highlight at 70°F should read ~121 PSIG.
        </p>
        <div className="mt-4">
          <RefrigerantPTCurve slug="r-22" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">R-410A — HFC blend, near-azeotrope (~0.7 PSI glide)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Glide too small to render as a visible region. Highlight at 70°F should read ~201 PSIG bubble / 201 PSIG dew.
        </p>
        <div className="mt-4">
          <RefrigerantPTCurve slug="r-410a" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">R-407C — HFC blend with significant glide (~23 PSI)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Both bubble (solid) and dew (dashed) curves rendered, with shaded glide region. Highlight at 70°F should read
          ~140 PSIG bubble / 117 PSIG dew.
        </p>
        <div className="mt-4">
          <RefrigerantPTCurve slug="r-407c" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">R-744 (CO2) — transcritical above 88°F</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Chart truncates at 87°F (one degree below critical at 87.8°F). Saturation pressure does not exist above the
          critical temperature; the generator correctly skips those points rather than fabricating values.
        </p>
        <div className="mt-4">
          <RefrigerantPTCurve slug="r-744" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">R-448A — manual blend, empty PT data</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Honeywell Solstice N40 is not modeled by CoolProp; <code>ptChart:[]</code> until the datasheet is transcribed.
          The component renders an honest placeholder, not fabricated data.
        </p>
        <div className="mt-4">
          <RefrigerantPTCurve slug="r-448a" />
        </div>
      </section>
    </div>
  );
}
