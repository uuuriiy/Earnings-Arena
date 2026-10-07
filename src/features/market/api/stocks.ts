import { apiGet } from "@/shared/lib/api/http";

export type EligiblePin = {
  ticker: string;
  price: number;
  earningsDate: string;
  earningsHour: string;
  suggestedSymbol: string;
  suggestedName: string;
};

export const stockKeys = {
  eligible: ["stocks", "eligible"] as const,
};

export function getEligiblePins() {
  return apiGet<{ pins: EligiblePin[]; asOf: string }>("/api/stocks/eligible");
}
