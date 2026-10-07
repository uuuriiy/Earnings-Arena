import type { DuelStatus } from "@/shared/lib/types";

/** Statuses where a coin is still committed to a bout (fees / narrative). */
export const ACTIVE_DUEL_STATUSES = [
  "open",
  "locked",
  "awaiting_print",
  "settling",
] as const satisfies readonly DuelStatus[];

export type ActiveDuelSide = {
  id?: string;
  sideACoinId: string;
  sideBCoinId: string | null;
  status: string;
};

export function isActiveDuelStatus(status: string): boolean {
  return (ACTIVE_DUEL_STATUSES as readonly string[]).includes(status);
}

/**
 * Keep coin ids that are not side A/B of any active duel.
 * Optionally ignore one duel (e.g. the open lobby being challenged).
 */
export function filterCoinsNotInActiveDuels(
  coinIds: string[],
  duels: ActiveDuelSide[],
  opts?: { excludeDuelId?: string },
): string[] {
  const busy = new Set<string>();
  for (const duel of duels) {
    if (opts?.excludeDuelId && duel.id === opts.excludeDuelId) continue;
    if (!isActiveDuelStatus(duel.status)) continue;
    busy.add(duel.sideACoinId);
    if (duel.sideBCoinId) busy.add(duel.sideBCoinId);
  }
  return coinIds.filter((id) => !busy.has(id));
}

export function coinBusyInActiveDuelMessage(status: string): string {
  return `Coin is already in an active duel (${status})`;
}
