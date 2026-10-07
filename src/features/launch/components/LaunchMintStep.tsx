import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { LaunchWizardApi } from "@/features/launch/hooks/useLaunchWizard";

export function LaunchMintStep({
  form,
  mintError,
  verifyPending,
  continueFromMint,
  resetMintFlags,
}: Pick<
  LaunchWizardApi,
  "form" | "mintError" | "verifyPending" | "continueFromMint" | "resetMintFlags"
>) {
  const mint = form.register("mint");

  return (
    <div className="grid gap-3">
      <h2 className="font-display text-3xl tracking-[0.06em]">PASTE MINT</h2>
      <Label>
        Pump mint
        <Input
          {...mint}
          onChange={(e) => {
            void mint.onChange(e);
            resetMintFlags();
          }}
          placeholder="Token mint address"
          required
          disabled={verifyPending}
        />
      </Label>
      <p className="font-mono text-xs text-muted-foreground">
        We check on-chain that this is a Pump.fun coin and you are its creator.
        Buying or holding a coin is not enough — launch it with this wallet, then
        paste the mint. Locally only seed/demo mints can skip that check.
      </p>
      {mintError && <p className="font-mono text-xs text-danger">{mintError}</p>}
      <Button
        type="button"
        variant="arena"
        size="xl"
        onClick={() => void continueFromMint()}
        disabled={verifyPending}
      >
        {verifyPending ? "Verifying…" : "Continue"}
      </Button>
    </div>
  );
}
