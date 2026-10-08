"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { useSiteHeader } from "@/features/home/hooks/useSiteHeader";
import { WalletControl } from "@/features/home/components/WalletControl";
import { cn } from "@/shared/lib/utils";

const DESKTOP_LINKS = [
  { href: "/", label: "Bouts" },
  { href: "/launch", label: "Enter" },
  { href: "/feed", label: "KOs" },
  { href: "/how-it-works", label: "Rules" },
  { href: "/legal/risk", label: "Risk" },
] as const;

const OVERFLOW_LINKS = [
  { href: "/how-it-works", label: "Rules" },
  { href: "/legal/risk", label: "Risk" },
] as const;

export function SiteHeader() {
  const { address, authError } = useSiteHeader();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[rgba(11,13,16,0.72)] px-4 py-3 backdrop-blur-[10px] lg:px-6 lg:py-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-display text-[1.35rem] tracking-[0.06em] hover:text-primary sm:gap-2.5 sm:text-[1.75rem]"
        >
          <Image
            src="/brand-mark.png"
            alt=""
            width={36}
            height={36}
            className="size-8 shrink-0 sm:size-9"
            priority
          />
          <span className="truncate">EARNINGS ARENA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-muted-foreground lg:flex">
          {DESKTOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <WalletControl />
        </nav>

        {/* Mobile / tablet: wallet + overflow */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <WalletControl className="max-w-[7.5rem] truncate font-mono" />
          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="More"
              onClick={() => setMenuOpen((o) => !o)}
              className="border border-border"
            >
              <span className="font-display text-2xl leading-none tracking-widest" aria-hidden>
                ···
              </span>
            </Button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-2 min-w-[10rem] border border-border bg-[var(--bg-1)] py-1 shadow-lg"
              >
                {OVERFLOW_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground hover:bg-[var(--bg-2)] hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {authError && !address && (
        <p className="mt-2 text-right font-mono text-xs text-danger">{authError}</p>
      )}
    </header>
  );
}
