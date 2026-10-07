import {
  DUEL_STATUSES,
  SETTLE_HOURS,
  TIE_EPSILON_PCT,
  type DuelStatus,
  type SettleResult,
} from "@/shared/lib/types";

export function percentMove(price0: number, price1: number): number | null {
  if (!Number.isFinite(price0) || !Number.isFinite(price1) || price0 <= 0) {
    return null;
  }
  return ((price1 - price0) / price0) * 100;
}

export function settleDuel(params: {
  priceA0: number | null;
  priceB0: number | null;
  priceA1: number | null;
  priceB1: number | null;
  tieEpsilonPct?: number;
}): SettleResult {
  const epsilon = params.tieEpsilonPct ?? TIE_EPSILON_PCT;

  if (
    params.priceA0 == null ||
    params.priceB0 == null ||
    params.priceA1 == null ||
    params.priceB1 == null
  ) {
    return { outcome: "void", reason: "Missing price snapshot" };
  }

  const moveAPct = percentMove(params.priceA0, params.priceA1);
  const moveBPct = percentMove(params.priceB0, params.priceB1);

  if (moveAPct == null || moveBPct == null) {
    return { outcome: "void", reason: "Invalid price snapshot" };
  }

  const absA = Math.abs(moveAPct);
  const absB = Math.abs(moveBPct);

  if (Math.abs(absA - absB) <= epsilon) {
    return { outcome: "tie", moveAPct, moveBPct };
  }

  if (absA > absB) {
    return { outcome: "winner", winnerSide: "A", moveAPct, moveBPct };
  }

  return { outcome: "winner", winnerSide: "B", moveAPct, moveBPct };
}

export function settleAtFromReport(reportAt: Date, hours = SETTLE_HOURS): Date {
  return new Date(reportAt.getTime() + hours * 60 * 60 * 1000);
}

const TRANSITIONS: Record<DuelStatus, readonly DuelStatus[]> = {
  open: ["locked", "voided"],
  locked: ["awaiting_print", "voided"],
  awaiting_print: ["settling", "voided"],
  settling: ["resolved", "voided"],
  resolved: [],
  voided: [],
};

export function canTransition(from: DuelStatus, to: DuelStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: DuelStatus, to: DuelStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid duel transition: ${from} → ${to}`);
  }
}

/** Plan for the accept → awaiting_print flow (idempotent after first success). */
export function acceptAdvancePlan(status: DuelStatus): {
  lock: boolean;
  advance: boolean;
} {
  if (status === "open") return { lock: true, advance: true };
  if (status === "locked") return { lock: false, advance: true };
  if (
    status === "awaiting_print" ||
    status === "settling" ||
    status === "resolved"
  ) {
    return { lock: false, advance: false };
  }
  throw new Error(`Cannot accept duel in status: ${status}`);
}

export function isDuelStatus(value: string): value is DuelStatus {
  return (DUEL_STATUSES as readonly string[]).includes(value);
}

export function routePot(params: {
  potLamports: bigint;
  outcome: SettleResult;
}): { sideA: bigint; sideB: bigint } {
  const pot = params.potLamports;
  if (params.outcome.outcome === "void") {
    const half = pot / 2n;
    return { sideA: half, sideB: pot - half };
  }
  if (params.outcome.outcome === "tie") {
    const half = pot / 2n;
    return { sideA: half, sideB: pot - half };
  }
  if (params.outcome.winnerSide === "A") {
    return { sideA: pot, sideB: 0n };
  }
  return { sideA: 0n, sideB: pot };
}
