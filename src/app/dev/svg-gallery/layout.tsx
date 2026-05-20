import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SVG component gallery (dev)",
  robots: { index: false, follow: false },
};

const ROUTES = [
  { href: "/dev/svg-gallery/", label: "Index" },
  { href: "/dev/svg-gallery/safety-class-chip/", label: "SafetyClassChip" },
  { href: "/dev/svg-gallery/pt-curve/", label: "PTCurve" },
  { href: "/dev/svg-gallery/gwp-comparison-bar/", label: "GWPComparisonBar" },
];

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Dev gallery</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">SVG component preview</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Not for production. Mounted to support visual review against the spec in
          <code className="ml-1 text-xs">docs/spec/05-SVG_INVENTORY.md</code>.
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="text-blue-700 hover:underline dark:text-blue-300">
              {r.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
