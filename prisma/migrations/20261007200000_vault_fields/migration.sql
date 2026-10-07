-- AlterTable
ALTER TABLE "Duel" ADD COLUMN IF NOT EXISTS "vaultPubkey" TEXT;
ALTER TABLE "Duel" ADD COLUMN IF NOT EXISTS "createTxSig" TEXT;
ALTER TABLE "Duel" ADD COLUMN IF NOT EXISTS "lockTxSig" TEXT;
ALTER TABLE "Duel" ADD COLUMN IF NOT EXISTS "settleTxSig" TEXT;

-- AlterTable
ALTER TABLE "FeeEvent" ADD COLUMN IF NOT EXISTS "txSignature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FeeEvent_txSignature_key" ON "FeeEvent"("txSignature");
