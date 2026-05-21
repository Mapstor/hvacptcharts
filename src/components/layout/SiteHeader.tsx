import Link from "next/link";

const NAV = [
  { href: "/pt-charts-tools-hub/", label: "PT Charts" },
  { href: "/calculators-hub/", label: "Calculators" },
  { href: "/guides-hub/", label: "Guides" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight" aria-label="HVAC PT Charts home">
          <span className="inline-block h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100" aria-hidden="true" />
          <span>HVAC PT Charts</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
