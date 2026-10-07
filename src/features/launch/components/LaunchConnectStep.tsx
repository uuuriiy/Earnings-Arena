import { LedgerBadge } from "@/shared/ui/LedgerBadge";
import { Button } from "@/shared/ui/button";
import type { LaunchWizardApi } from "@/features/launch/hooks/useLaunchWizard";

export function LaunchConnectStep({
  ready,
  connecting,
  connect,
}: Pick<LaunchWizardApi, "ready" | "connecting" | "connect">) {
  return (
    <div className="relative mt-10 overflow-hidden border border-border/60 pb-10 pt-8">
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-2 select-none text-center font-display text-[clamp(3rem,12vw,5rem)] leading-none tracking-[0.06em] text-foreground/[0.05]"
      >
        CONNECT
      </p>
      <div className="relative px-5">
        <LedgerBadge className="mb-4" />
        <h2 className="font-display text-[clamp(2.5rem,8vw,3.75rem)] leading-[0.92] tracking-[0.05em]">
          ENTER THE
          <br />
          ARENA
        </h2>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Wallet or email — one sign-in to pin a coin to your treasury.
        </p>
        <Button
          type="button"
          variant="arena"
          size="xl"
          className="mt-6"
          disabled={!ready || connecting}
          onClick={() => void connect()}
        >
          {!ready ? "Loading…" : connecting ? "Connecting…" : "Connect"}
        </Button>
        <ul className="mt-8 space-y-2 border-t border-border pt-5 font-mono text-xs text-muted-foreground">
          <li>Pin mint → treasury</li>
          <li>Open bout → vault</li>
          <li>Win → pot</li>
        </ul>
      </div>
    </div>
  );
}
