import Link from "next/link";
import { refrigerants } from "@/data/refrigerants";

const FOOTER_NAV: Array<{ heading: string; items: Array<{ href: string; label: string }> }> = [
  {
    heading: "PT Charts & references",
    items: [
      { href: "/pt-charts-tools-hub/", label: "All PT chart tools" },
      { href: "/pt-chart-guide/", label: "How to read a PT chart" },
      { href: "/refrigerant-safety-classifications/", label: "Safety classifications" },
      { href: "/refrigerant-gwp-rankings/", label: "GWP rankings" },
    ],
  },
  {
    heading: "Calculators",
    items: [
      { href: "/calculators-hub/", label: "All calculators" },
      { href: "/pt-calculator/", label: "PT calculator" },
      { href: "/superheat-calculator/", label: "Superheat calculator" },
      { href: "/subcooling-calculator/", label: "Subcooling calculator" },
    ],
  },
  {
    heading: "Guides",
    items: [
      { href: "/guides-hub/", label: "All guides" },
      { href: "/superheat-subcooling-fundamentals/", label: "Superheat & subcooling fundamentals" },
      { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A" },
    ],
  },
  {
    heading: "Site",
    items: [
      { href: "/about-us/", label: "About" },
      { href: "/contact-us/", label: "Contact" },
      { href: "/privacy-policy/", label: "Privacy" },
      { href: "/terms-of-service/", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  const generated = refrigerants[0]?.dataSource.ptChartGeneratedAt.slice(0, 10) ?? "";
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{col.heading}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800">
          <p>
            Pressure-temperature data and saturation calculations on this site are derived from{" "}
            <a href="http://www.coolprop.org/" className="underline" rel="nofollow">CoolProp 7.2.0</a> (REFPROP-compatible
            Helmholtz EOS) and named manufacturer datasheets. Last regenerated {generated}. Released under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" rel="nofollow">CC BY 4.0</a>.
          </p>
          <p className="mt-3">
            © {year} HVAC PT Charts. Reference material; always verify against equipment data plate and manufacturer
            service literature before charging or troubleshooting a specific system.
          </p>
        </div>
      </div>
    </footer>
  );
}
