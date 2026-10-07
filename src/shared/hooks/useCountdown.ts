"use client";

import { useEffect, useState } from "react";

export function useCountdown(target: string | Date | null) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) {
    return { kind: "empty" as const };
  }

  if (now == null) {
    return { kind: "pending" as const, label: "--:--:--" };
  }

  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return { kind: "ready" as const, label };
}
