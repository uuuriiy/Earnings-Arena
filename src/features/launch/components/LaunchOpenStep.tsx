import { Button } from "@/shared/ui/button";
import type { LaunchWizardApi } from "@/features/launch/hooks/useLaunchWizard";

export function LaunchOpenStep({
  watched,
  launchPending,
  onOpenSubmit,
  setStep,
}: Pick<LaunchWizardApi, "watched" | "launchPending" | "onOpenSubmit" | "setStep">) {
  return (
    <form onSubmit={onOpenSubmit} className="grid gap-3">
      <h2 className="font-display text-3xl tracking-[0.06em]">OPEN BOUT</h2>
      <dl className="grid gap-2 font-mono text-sm">
        <div className="flex justify-between gap-4 border-b border-border py-2">
          <dt className="text-muted-foreground">Mint</dt>
          <dd className="truncate">{watched.mint}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border py-2">
          <dt className="text-muted-foreground">Coin</dt>
          <dd>
            ${watched.symbol} · {watched.name}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border py-2">
          <dt className="text-muted-foreground">Stock</dt>
          <dd>{(watched.stockTicker ?? "").toUpperCase()}</dd>
        </div>
      </dl>
      <Button type="submit" variant="arena" size="xl" disabled={launchPending}>
        {launchPending ? "Opening…" : "Pin stock & open duel"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => setStep(2)}>
        Back
      </Button>
    </form>
  );
}
