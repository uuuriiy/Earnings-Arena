"use client";

import { useState } from "react";

export function useCopyDuelLink(duelId: string) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/duel/${duelId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return { copied, copy };
}
