import { RefrigerantGWPComparison } from "@/components/refrigerant/RefrigerantGWPComparison";

export default function GalleryGWPComparisonBar() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold">Residential AC — current = R-410A</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Linear scale. R-410A highlighted with outline. EU F-Gas 150 and EPA AIM Act 700 thresholds shown as
          dashed verticals. R-22 (HCFC, A1, GWP 1810) and R-410A (A1, GWP 2088) sit well above the AIM Act
          threshold; R-454B (A2L, GWP 466) and R-32 (A2L, GWP 675) sit below it. Color encodes ASHRAE class:
          green = A1, yellow = A2L.
        </p>
        <div className="mt-4">
          <RefrigerantGWPComparison currentSlug="r-410a" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Commercial refrigeration — medium temp, current = R-404A</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Shows the active phase-down landscape: R-404A (GWP 3922) being replaced by R-448A (1387), R-449A (1397),
          R-450A (605), R-454C (148), R-455A (148), R-516A (142), and R-744 (1). The 150 reference line is the EU
          F-Gas Regulation threshold; refrigerants below it are the long-term path.
        </p>
        <div className="mt-4">
          <RefrigerantGWPComparison currentSlug="r-404a" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">R-22 retrofits</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          For existing-equipment service. R-22 is the baseline (GWP 1810); each retrofit blend has its own
          trade-off between GWP, oil compatibility, and pressure rating. All bars here are A1.
        </p>
        <div className="mt-4">
          <RefrigerantGWPComparison currentSlug="r-22" groupId="r-22-retrofits" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Industrial refrigeration — current = R-717 (ammonia)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Natural refrigerants dominate this group. R-717 (B2L), R-744 (A1, GWP 1), R-290 (A3), R-1270 (A3), and
          R-1150 (A3) sit at or near GWP 0. R-13 (CFC, GWP 14400) is shown for historical context — banned for
          production since 1996.
        </p>
        <div className="mt-4">
          <RefrigerantGWPComparison currentSlug="r-717" />
        </div>
      </section>
    </div>
  );
}
