import { StockPinChooser } from "@/features/market/components/StockPinChooser";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { LaunchWizardApi } from "@/features/launch/hooks/useLaunchWizard";

export function LaunchPinStep({
  form,
  mintVerified,
  mintBypassed,
  onPickStock,
  continueFromPin,
}: Pick<
  LaunchWizardApi,
  "form" | "mintVerified" | "mintBypassed" | "onPickStock" | "continueFromPin"
>) {
  const {
    register,
    formState: { errors },
    watch,
  } = form;
  const stockTicker = watch("stockTicker") ?? "";

  return (
    <div className="grid gap-3">
      <h2 className="font-display text-3xl tracking-[0.06em]">PIN STOCK</h2>
      {mintVerified && (
        <p className="font-mono text-xs text-ok">
          {mintBypassed
            ? "Dev bypass · unverified mint allowed locally"
            : "Verified · Pump creator matches wallet"}
        </p>
      )}
      <StockPinChooser selectedTicker={stockTicker} onPick={onPickStock} />
      <Label>
        Coin ticker
        <Input {...register("symbol")} placeholder="TLRYMEME" />
        {errors.symbol && (
          <span className="mt-1 block font-mono text-[10px] text-danger">
            {errors.symbol.message}
          </span>
        )}
      </Label>
      <Label>
        Coin name
        <Input {...register("name")} placeholder="TLRY Arena" />
        {errors.name && (
          <span className="mt-1 block font-mono text-[10px] text-danger">
            {errors.name.message}
          </span>
        )}
      </Label>
      <Label>
        Stock ticker
        <Input
          {...register("stockTicker", {
            setValueAs: (v: string) => String(v ?? "").toUpperCase(),
          })}
          placeholder="TLRY"
        />
        {errors.stockTicker && (
          <span className="mt-1 block font-mono text-[10px] text-danger">
            {errors.stockTicker.message}
          </span>
        )}
      </Label>
      <Label>
        Sector (optional)
        <Input {...register("sector")} placeholder="Cannabis" />
      </Label>
      <p className="font-mono text-xs text-muted-foreground">
        Open re-checks quote + earnings (under $5, within 14 days).
      </p>
      <Button type="button" variant="arena" size="xl" onClick={() => void continueFromPin()}>
        Review &amp; open
      </Button>
    </div>
  );
}
