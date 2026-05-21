import type { RefrigerantType } from "@/data/refrigerants";

const TYPE_LABEL: Record<RefrigerantType, string> = {
  cfc: "CFC",
  hcfc: "HCFC",
  "hfc-pure": "HFC (pure)",
  "hfc-blend": "HFC blend",
  "hfo-pure": "HFO (pure)",
  "hfo-blend": "HFO blend",
  hc: "Hydrocarbon",
  natural: "Natural",
};

const TYPE_TONE: Record<RefrigerantType, string> = {
  cfc: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  hcfc: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  "hfc-pure": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "hfc-blend": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "hfo-pure": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  "hfo-blend": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  hc: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  natural: "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200",
};

export function TypeChip({ type, className = "" }: { type: RefrigerantType; className?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${TYPE_TONE[type]} ${className}`}>
      {TYPE_LABEL[type]}
    </span>
  );
}
