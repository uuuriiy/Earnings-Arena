"use client";

import { cn } from "@/shared/lib/utils";
import { useCountdown } from "@/shared/hooks/useCountdown";

export function Countdown({ target }: { target: string | Date | null }) {
  const state = useCountdown(target);

  if (state.kind === "empty") {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        "countdown-pulse inline-block border border-primary/35 px-2.5 py-1 font-mono text-xl text-primary",
      )}
    >
      {state.label}
    </span>
  );
}
