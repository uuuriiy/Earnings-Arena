"use client";

import { Button } from "@/shared/ui/button";
import { useCopyDuelLink } from "@/features/duel/hooks/useCopyDuelLink";

export function CopyDuelLink({ duelId }: { duelId: string }) {
  const { copied, copy } = useCopyDuelLink(duelId);

  return (
    <Button type="button" variant="secondary" size="sm" onClick={() => void copy()}>
      {copied ? "Copied" : "Copy duel link"}
    </Button>
  );
}
