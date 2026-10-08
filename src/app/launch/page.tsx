"use client";

import { cn } from "@/shared/lib/utils";
import { useLaunchWizard } from "@/features/launch/hooks/useLaunchWizard";
import { LaunchStepper } from "@/features/launch/components/LaunchStepper";
import { LaunchConnectStep } from "@/features/launch/components/LaunchConnectStep";
import { LaunchMintStep } from "@/features/launch/components/LaunchMintStep";
import { LaunchPinStep } from "@/features/launch/components/LaunchPinStep";
import { LaunchOpenStep } from "@/features/launch/components/LaunchOpenStep";
import { BoutPreviewAside } from "@/features/launch/components/BoutPreviewAside";

export default function LaunchPage() {
  const w = useLaunchWizard();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,32rem)_1fr] lg:items-start">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl tracking-[0.05em] sm:text-5xl">PIN &amp; FIGHT</h1>
          <span className="font-mono text-xs text-muted-foreground">{w.progress}</span>
        </div>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect, paste a Pump mint, pin a sub-$5 ticker with earnings in 14 days, open the duel.
        </p>

        <div className="mt-5 h-0.5 w-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((w.activeStep + 1) / w.steps.length) * 100}%` }}
          />
        </div>

        <LaunchStepper
          steps={w.steps}
          activeStep={w.activeStep}
          address={w.address}
          goToStep={w.goToStep}
        />

        {w.activeStep === 0 && (
          <LaunchConnectStep
            ready={w.ready}
            connecting={w.connecting}
            connect={w.connect}
          />
        )}

        {w.activeStep > 0 && (
          <div className="mt-8">
            {w.address && (
              <p
                className={cn(
                  "mb-4 font-mono text-xs",
                  w.justConnected ? "text-primary" : "text-muted-foreground",
                )}
              >
                Connected {w.address.slice(0, 4)}…{w.address.slice(-4)}
              </p>
            )}

            {w.activeStep === 1 && (
              <LaunchMintStep
                form={w.form}
                mintError={w.mintError}
                verifyPending={w.verifyPending}
                continueFromMint={w.continueFromMint}
                resetMintFlags={w.resetMintFlags}
              />
            )}

            {w.activeStep === 2 && (
              <LaunchPinStep
                form={w.form}
                mintVerified={w.mintVerified}
                mintBypassed={w.mintBypassed}
                onPickStock={w.onPickStock}
                continueFromPin={w.continueFromPin}
              />
            )}

            {w.activeStep === 3 && (
              <LaunchOpenStep
                watched={w.watched}
                launchPending={w.launchPending}
                onOpenSubmit={w.onOpenSubmit}
                setStep={w.setStep}
              />
            )}
          </div>
        )}

        {w.error && <p className="mt-3 text-danger">{w.error}</p>}
      </div>

      <BoutPreviewAside
        symbol={w.watched.symbol}
        stockTicker={w.watched.stockTicker}
      />
    </div>
  );
}
