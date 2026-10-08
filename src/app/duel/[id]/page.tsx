import { notFound } from "next/navigation";
import { getDuelPageModel } from "@/features/duel/server/view";
import { DuelStatusBar } from "@/features/duel/components/DuelStatusBar";
import { DuelFightCard } from "@/features/duel/components/DuelFightCard";
import { DuelActionRail } from "@/features/duel/components/DuelActionRail";
import { DuelShareFooter } from "@/features/duel/components/DuelShareFooter";
import { SettlementKO } from "@/features/duel/components/SettlementKO";

export const dynamic = "force-dynamic";


export default async function DuelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getDuelPageModel(id);
  if (!model) notFound();

  const { duel } = model;

  return (
    <div className="pb-8 lg:pb-16">
      <DuelStatusBar
        status={duel.status}
        escrow={model.escrow}
        demoBout={model.demoBout}
        bothVerified={model.bothVerified}
      />

      <DuelFightCard model={model} />

      {(duel.status === "resolved" || duel.status === "voided") && (
        <SettlementKO
          winnerSymbol={duel.winner?.symbol}
          moveA={duel.moveAPct}
          moveB={duel.moveBPct}
        />
      )}

      <DuelActionRail
        duelId={duel.id}
        sideACoinId={duel.sideACoinId}
        status={duel.status}
        hasSideB={Boolean(duel.sideB)}
      />

      <DuelShareFooter duelId={duel.id} />
    </div>
  );
}
