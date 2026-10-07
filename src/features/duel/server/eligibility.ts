import { EARNINGS_WINDOW_DAYS, MAX_STOCK_PRICE } from "@/shared/lib/types";

export type EligibilityInput = {
  stockPrice: number;
  earningsAt: Date;
  now?: Date;
};

export type EligibilityResult =
  | { ok: true }
  | { ok: false; reason: string };

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const now = input.now ?? new Date();

  if (!Number.isFinite(input.stockPrice) || input.stockPrice <= 0) {
    return { ok: false, reason: "Stock price must be a positive number" };
  }

  if (input.stockPrice >= MAX_STOCK_PRICE) {
    return { ok: false, reason: `Stock must be under $${MAX_STOCK_PRICE}` };
  }

  const msWindow = EARNINGS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const delta = input.earningsAt.getTime() - now.getTime();

  if (delta <= 0) {
    return { ok: false, reason: "Earnings date must be in the future" };
  }

  if (delta > msWindow) {
    return {
      ok: false,
      reason: `Earnings must be within ${EARNINGS_WINDOW_DAYS} days`,
    };
  }

  return { ok: true };
}
