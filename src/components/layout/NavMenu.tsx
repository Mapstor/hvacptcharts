"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavGroup {
  label: string;
  hubHref: string;
  hubLabel: string;
  sections: NavSection[];
}

const NAV: NavGroup[] = [
  {
    label: "PT Charts",
    hubHref: "/pt-charts-tools-hub/",
    hubLabel: "PT charts hub",
    sections: [
      {
        title: "Popular refrigerants",
        items: [
          { href: "/refrigerant/r-410a/", label: "R-410A" },
          { href: "/refrigerant/r-22/", label: "R-22" },
          { href: "/refrigerant/r-32/", label: "R-32" },
          { href: "/refrigerant/r-454b/", label: "R-454B" },
          { href: "/refrigerant/r-134a/", label: "R-134a" },
          { href: "/refrigerant/r-407c/", label: "R-407C" },
          { href: "/refrigerant/r-404a/", label: "R-404A" },
          { href: "/refrigerant/r-454c/", label: "R-454C" },
          { href: "/refrigerant/r-744/", label: "R-744 (CO₂)" },
          { href: "/refrigerant/r-290/", label: "R-290" },
        ],
      },
      {
        title: "Reference tables",
        items: [
          { href: "/refrigerant-safety-classifications/", label: "Safety classifications" },
          { href: "/refrigerant-gwp-rankings/", label: "GWP rankings" },
          { href: "/#find", label: "Browse all 61 refrigerants →" },
        ],
      },
    ],
  },
  {
    label: "Calculators",
    hubHref: "/calculators-hub/",
    hubLabel: "All calculators",
    sections: [
      {
        title: "Charging & diagnostic",
        items: [
          { href: "/superheat-calculator/", label: "Superheat" },
          { href: "/subcooling-calculator/", label: "Subcooling" },
          { href: "/pt-superheat-subcooling-calculator/", label: "Combined SH / SC / PT" },
          { href: "/system-pressure-diagnostic-calculator/", label: "System diagnostic" },
          { href: "/refrigerant-charge-calculator/", label: "Refrigerant charge" },
        ],
      },
      {
        title: "Lookup & reference",
        items: [
          { href: "/pt-calculator/", label: "PT calculator" },
          { href: "/saturation-properties-calculator/", label: "Saturation properties" },
          { href: "/refrigerant-pt-comparison-tool/", label: "PT comparison tool" },
          { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit compatibility" },
        ],
      },
    ],
  },
  {
    label: "Guides",
    hubHref: "/guides-hub/",
    hubLabel: "All guides",
    sections: [
      {
        title: "Fundamentals",
        items: [
          { href: "/superheat-subcooling-fundamentals/", label: "SH / SC fundamentals" },
          { href: "/pt-chart-guide/", label: "How to read a PT chart" },
          { href: "/high-head-pressure-causes/", label: "High head pressure causes" },
          { href: "/refrigerant-comparison-guide/", label: "Refrigerant comparison guide" },
        ],
      },
      {
        title: "Operating pressures",
        items: [
          { href: "/what-pressure-should-410a/", label: "R-410A pressures" },
          { href: "/what-pressure-should-r22/", label: "R-22 pressures" },
          { href: "/what-pressure-should-r32/", label: "R-32 pressures" },
          { href: "/what-pressure-should-r454b/", label: "R-454B pressures" },
          { href: "/what-pressure-should-r134a/", label: "R-134a pressures" },
          { href: "/what-pressure-should-r404a/", label: "R-404A pressures" },
          { href: "/what-pressure-should-r407c/", label: "R-407C pressures" },
          { href: "/what-pressure-should-r454c/", label: "R-454C pressures" },
          { href: "/what-pressure-should-r744/", label: "R-744 (CO₂) pressures" },
        ],
      },
      {
        title: "Refrigerant comparisons",
        items: [
          { href: "/r-22-vs-r-410a/", label: "R-22 vs R-410A" },
          { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A" },
          { href: "/r-410a-vs-r-454b/", label: "R-410A vs R-454B" },
          { href: "/r-32-vs-r-454b/", label: "R-32 vs R-454B" },
          { href: "/r-454c-vs-r-455a/", label: "R-454C vs R-455A" },
          { href: "/r-404a-vs-r-449a/", label: "R-404A vs R-449A" },
          { href: "/r-134a-vs-r-513a/", label: "R-134a vs R-513A" },
          { href: "/r-1234yf-vs-r-134a/", label: "R-1234yf vs R-134a" },
          { href: "/guides-hub/#comparisons", label: "All 13 comparisons →" },
        ],
      },
    ],
  },
];

export function NavMenu() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setDrawerOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Close any open dropdown / drawer when the route changes. Calling setState
  // in this effect is intentional — ESLint's set-state-in-effect heuristic
  // doesn't model "react to external state (pathname) by resetting UI."
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenDropdown(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const isActiveGroup = (group: NavGroup) =>
    group.sections.some((s) => s.items.some((i) => pathname === i.href)) ||
    pathname === group.hubHref;

  return (
    <>
      {/* Desktop nav */}
      <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
        {NAV.map((group, i) => {
          const isOpen = openDropdown === i;
          const isActive = isActiveGroup(group);
          return (
            <div key={group.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 rounded-md px-3 py-2 transition-colors ${
                  isOpen || isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {group.label}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? <DesktopDropdown group={group} pathname={pathname} /> : null}
            </div>
          );
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={drawerOpen}
        className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {drawerOpen ? <MobileDrawer pathname={pathname} onClose={() => setDrawerOpen(false)} /> : null}
    </>
  );
}

function DesktopDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isWide = group.sections.length >= 3;
  return (
    <div
      role="menu"
      className={`absolute right-0 top-full mt-1 ${
        isWide ? "w-[640px]" : "w-[420px]"
      } overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950`}
    >
      <div className={`grid gap-x-6 gap-y-4 p-5 ${isWide ? "grid-cols-3" : "grid-cols-2"}`}>
        {group.sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      className={`block rounded px-2 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200 bg-zinc-50/50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <Link
          href={group.hubHref}
          role="menuitem"
          className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
        >
          {group.hubLabel} →
        </Link>
      </div>
    </div>
  );
}

function MobileDrawer({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-950 md:hidden"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="text-sm font-semibold tracking-tight">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Link
            href="/"
            className={`mb-4 block rounded-md px-3 py-2 text-sm font-semibold ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Home
          </Link>
          <div className="space-y-5">
            {NAV.map((group) => (
              <div key={group.label}>
                <Link
                  href={group.hubHref}
                  className={`mb-1 block rounded-md px-3 py-2 text-base font-semibold ${
                    pathname === group.hubHref
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {group.label}
                </Link>
                {group.sections.map((section) => (
                  <div key={section.title} className="mb-3 ml-2">
                    <h3 className="mb-1 mt-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {section.title}
                    </h3>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                                isActive
                                  ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
