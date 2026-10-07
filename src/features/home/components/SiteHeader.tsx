"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { useSiteHeader } from "@/features/home/hooks/useSiteHeader";

export function SiteHeader() {
  const { address, connecting, connect, disconnect, authError, ready, shortAddress } =
    useSiteHeader();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[rgba(11,13,16,0.72)] px-6 py-4 backdrop-blur-[10px]">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-[1.75rem] tracking-[0.06em] hover:text-primary"
        >
          <Image
            src="/brand-mark.png"
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0"
            priority
          />
          <span>EARNINGS ARENA</span>
        </Link>
        <nav className="flex items-center gap-5 text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Bouts
          </Link>
          <Link href="/launch" className="hover:text-foreground">
            Enter
          </Link>
          <Link href="/feed" className="hover:text-foreground">
            KOs
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground">
            Rules
          </Link>
          <Link href="/legal/risk" className="hover:text-foreground">
            Risk
          </Link>
          {address ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void disconnect()}
              title={address}
              className="font-mono"
            >
              {shortAddress}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void connect()}
              disabled={!ready || connecting}
              className="font-mono"
            >
              {!ready ? "Loading…" : "Connect"}
            </Button>
          )}
        </nav>
      </div>
      {authError && !address && (
        <p className="mt-2 text-right font-mono text-xs text-danger">{authError}</p>
      )}
    </header>
  );
}
