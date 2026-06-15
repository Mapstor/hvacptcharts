import Link from "next/link";
import { NavMenu } from "./NavMenu";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight"
          aria-label="HVAC PT Charts — home"
        >
          <Logo size={32} />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-bold tracking-tight">HVAC PT Charts</span>
            <span className="mt-0.5 hidden truncate text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:inline dark:text-zinc-400">
              Verified saturation data &middot; 61 refrigerants
            </span>
          </span>
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
