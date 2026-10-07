import { revalidateTag } from "next/cache";

/** Bust home board + per-duel page caches after a duel mutation. */
export function revalidateDuelCaches(duelId?: string) {
  revalidateTag("duels");
  if (duelId) revalidateTag(`duel:${duelId}`);
}
