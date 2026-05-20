import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import type { SafetyClass } from "@/data/refrigerants";

const CLASSES: SafetyClass[] = ["A1", "A2L", "A2", "A3", "B1", "B2L", "B2", "B3"];

export default function GallerySafetyClassChip() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold">Chip variant — sizes</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Inline rendering for tables, hero metadata strips, etc.</p>
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 text-xs text-zinc-500">sm</span>
            {CLASSES.map((c) => <SafetyClassChip key={c} safetyClass={c} size="sm" />)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 text-xs text-zinc-500">md</span>
            {CLASSES.map((c) => <SafetyClassChip key={c} safetyClass={c} size="md" />)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 text-xs text-zinc-500">lg</span>
            {CLASSES.map((c) => <SafetyClassChip key={c} safetyClass={c} size="lg" />)}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Card variant — refrigerant page hero</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">All 8 ASHRAE 34 classes, full description, cite ASHRAE 34-2022.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CLASSES.map((c) => (
            <SafetyClassChip key={c} safetyClass={c} variant="card" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cross-check</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Per project skill rule 3: safety class is structural. The component reads from <code>r.safetyClass</code>
          (Zod enum) so it is impossible to render the wrong class. The legacy site told installers that R-290
          (propane), R-717 (ammonia), and R-32 were all A1 non-flammable — this rebuild makes that failure mode
          structurally impossible.
        </p>
      </section>
    </div>
  );
}
