export default function GalleryIndex() {
  return (
    <div className="space-y-6 text-sm">
      <p>
        Each component here is built per <code>docs/spec/05-SVG_INVENTORY.md</code>. The gallery is a
        visual cross-check, not a feature surface — pages under this route are excluded from the
        sitemap and noindex&apos;d.
      </p>
      <h2 className="text-base font-semibold">What&apos;s built so far</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <code>SafetyClassChip</code> — every refrigerant&apos;s ASHRAE 34 safety classification
          rendered structurally from the data layer enum.
        </li>
        <li>
          <code>PTCurve</code> — saturation pressure-temperature plot. Bubble + dew, shaded glide,
          optional highlight at a specific temperature.
        </li>
        <li>
          <code>GWPComparisonBar</code> — horizontal bar chart of refrigerants by GWP, colored by
          safety class, with EU F-Gas 150 / AIM Act 700 reference lines.
        </li>
      </ul>
    </div>
  );
}
