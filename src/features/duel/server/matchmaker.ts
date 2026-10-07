import type { MatchCandidate } from "@/shared/lib/types";

export type MatchCoin = {
  id: string;
  stockTicker: string;
  earningsAt: Date;
  sector: string | null;
};

function startOfWeek(d: Date): number {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay();
  const diff = (day + 6) % 7;
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x.getTime();
}

export function scoreRival(anchor: MatchCoin, candidate: MatchCoin): MatchCandidate {
  const reasons: string[] = [];
  let score = 0;

  if (candidate.id === anchor.id) {
    return { coinId: candidate.id, score: -Infinity, reasons: ["same coin"] };
  }

  if (candidate.stockTicker.toUpperCase() === anchor.stockTicker.toUpperCase()) {
    return { coinId: candidate.id, score: -Infinity, reasons: ["same ticker"] };
  }

  if (startOfWeek(anchor.earningsAt) === startOfWeek(candidate.earningsAt)) {
    score += 50;
    reasons.push("same earnings week");
  }

  const hoursApart =
    Math.abs(anchor.earningsAt.getTime() - candidate.earningsAt.getTime()) /
    (1000 * 60 * 60);
  if (hoursApart <= 48) {
    score += 20;
    reasons.push("earnings within 48h");
  }

  if (
    anchor.sector &&
    candidate.sector &&
    anchor.sector.toLowerCase() === candidate.sector.toLowerCase()
  ) {
    score += 30;
    reasons.push("same sector");
  }

  return { coinId: candidate.id, score, reasons };
}

export function suggestRivals(
  anchor: MatchCoin,
  pool: MatchCoin[],
  limit = 5,
): MatchCandidate[] {
  return pool
    .map((c) => scoreRival(anchor, c))
    .filter((c) => Number.isFinite(c.score) && c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
