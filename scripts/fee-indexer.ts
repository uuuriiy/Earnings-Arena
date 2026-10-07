/**
 * Fee indexer CLI — credits duel pots for active arenas.
 * Prefer Vercel cron GET /api/cron/fees in staging/production.
 *
 * Env: DATABASE_URL, PUMP_API optional, FEE_INDEXER_STUB optional
 */
import { indexActiveDuelFees } from "../src/shared/lib/fees/indexer";
import { prisma } from "../src/shared/lib/db";

async function main() {
  const result = await indexActiveDuelFees();
  console.log(
    `Done. Credited ${result.credited} fee event(s) across ${result.duels} duel(s).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
