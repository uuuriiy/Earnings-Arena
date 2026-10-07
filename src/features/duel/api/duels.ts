import { apiGet, apiPost } from "@/shared/lib/api/http";

export type Suggestion = {
  coinId: string;
  score: number;
  reasons: string[];
  coin: { symbol: string; stockTicker: string; name: string };
};

export type Duel = { id: string };

export const duelKeys = {
  suggestions: (sideACoinId: string, wallet?: string | null, duelId?: string) =>
    ["duels", "suggestions", sideACoinId, wallet ?? "anon", duelId ?? ""] as const,
};

export function getSuggestions(sideACoinId: string, duelId?: string) {
  return apiGet<Suggestion[]>("/api/duels", {
    params: { suggestFor: sideACoinId, ...(duelId ? { duelId } : {}) },
  });
}

export function createDuel(sideACoinId: string) {
  return apiPost<Duel>("/api/duels", { sideACoinId });
}

export function challengeDuel(duelId: string, sideBCoinId: string) {
  return apiPost<Duel>(`/api/duels/${duelId}/challenge`, { sideBCoinId });
}

export function acceptDuel(duelId: string) {
  return apiPost<Duel>(`/api/duels/${duelId}/accept`);
}
