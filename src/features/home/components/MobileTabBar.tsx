"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { href: "/", label: "Bouts", match: (p: string) => p === "/" },
  { href: "/launch", label: "Enter", match: (p: string) => p.startsWith("/launch") },
  { href: "/feed", label: "KOs", match: (p: string) => p.startsWith("/feed") },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-[rgba(11,13,16,0.92)] backdrop-blur-[12px] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-[1100px] grid-cols-3">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                  aria-hidden
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
