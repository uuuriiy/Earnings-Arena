import { unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/db";
import { serialize } from "@/shared/lib/serialize";
import { isDemoMint } from "@/shared/lib/solana/mint";

export type DuelSideView = {
  mint: string;
  symbol: string;
  stockTicker: string;
  earningsAt: string;
  pumpCreator?: string | null;
  pumpVerifiedAt?: string | null;
};

export type DuelView = {
  id: string;
  status: string;
  potLamports: string;
  vaultPubkey?: string | null;
  settleTxSig?: string | null;
  reportAt?: string | null;
  settleAt?: string | null;
  moveAPct?: number | null;
  moveBPct?: number | null;
  sideACoinId: string;
  sideA: DuelSideView;
  sideB?: DuelSideView | null;
  winner?: { symbol: string } | null;
  feeEvents: { lamports: string }[];
};

/** Derived presentation fields for the duel page. */
export type DuelPageModel = {
  duel: DuelView;
  potSol: number;
  feeSol: number;
  feeEventCount: number;
  timerTarget: string | null | undefined;
  escrow: boolean;
  demoBout: boolean;
  bothVerified: boolean;
  reportLabel: string;
  settleLabel: string;
};

async function loadDuelPageModel(id: string): Promise<DuelPageModel | null> {
  const row = await prisma.duel.findUnique({
    where: { id },
    include: { sideA: true, sideB: true, winner: true, feeEvents: true },
  });
  if (!row) return null;

  const duel = serialize<DuelView>(row);
  const potSol = Number(duel.potLamports) / 1e9;
  const feeSol =
    duel.feeEvents.reduce((sum, e) => sum + Number(e.lamports), 0) / 1e9;
  const timerTarget =
    duel.status === "settling" ? duel.settleAt : duel.sideA.earningsAt;
  const escrow = Boolean(
    duel.vaultPubkey && process.env.NEXT_PUBLIC_ARENA_PROGRAM_ID,
  );
  const demoBout =
    (!duel.sideA.pumpVerifiedAt && isDemoMint(duel.sideA.mint)) ||
    (duel.sideB
      ? !duel.sideB.pumpVerifiedAt && isDemoMint(duel.sideB.mint)
      : false);
  const bothVerified =
    Boolean(duel.sideA.pumpVerifiedAt) &&
    (!duel.sideB || Boolean(duel.sideB.pumpVerifiedAt));

  return {
    duel,
    potSol,
    feeSol,
    feeEventCount: duel.feeEvents.length,
    timerTarget,
    escrow,
    demoBout,
    bothVerified,
    reportLabel: new Date(duel.sideA.earningsAt).toUTCString(),
    settleLabel: duel.settleAt
      ? new Date(duel.settleAt).toUTCString()
      : "T+4h after print",
  };
}

/**
 * Load + shape a duel for the fight-card page.
 * Returns null when the id does not exist (caller should `notFound()`).
 */
export function getDuelPageModel(id: string): Promise<DuelPageModel | null> {
  return unstable_cache(() => loadDuelPageModel(id), ["duel-page", id], {
    revalidate: 10,
    tags: ["duels", `duel:${id}`],
  })();
}
