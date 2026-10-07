export const DUEL_STATUSES = [
  "open",
  "locked",
  "awaiting_print",
  "settling",
  "resolved",
  "voided",
] as const;

export type DuelStatus = (typeof DUEL_STATUSES)[number];

export const TIE_EPSILON_PCT = 0.1;
export const MAX_STOCK_PRICE = 5;
export const EARNINGS_WINDOW_DAYS = 14;
export const SETTLE_HOURS = 4;

export type SettleResult =
  | { outcome: "winner"; winnerSide: "A" | "B"; moveAPct: number; moveBPct: number }
  | { outcome: "tie"; moveAPct: number; moveBPct: number }
  | { outcome: "void"; reason: string };

export type MatchCandidate = {
  coinId: string;
  score: number;
  reasons: string[];
};
