"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useArenaAuth } from "@/features/auth/hooks/useArenaAuth";
import { createCoin, verifyMint } from "@/features/launch/api/coins";
import { createDuel } from "@/features/duel/api/duels";
import type { EligiblePin } from "@/features/market/api/stocks";
import {
  launchPinFormSchema,
  type LaunchPinFormOutput,
  type LaunchPinFormValues,
} from "@/features/launch/validation/coins";

export const LAUNCH_STEPS = ["Connect", "Mint", "Pin stock", "Open"] as const;

export function useLaunchWizard() {
  const { address, connecting, connect, authError, ready } = useArenaAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [justConnected, setJustConnected] = useState(false);
  const [mintVerified, setMintVerified] = useState(false);
  const [mintBypassed, setMintBypassed] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const form = useForm<LaunchPinFormValues, unknown, LaunchPinFormOutput>({
    resolver: zodResolver(launchPinFormSchema),
    defaultValues: {
      mint: "",
      symbol: "",
      name: "",
      stockTicker: "",
      sector: "",
    },
    mode: "onSubmit",
  });

  const activeStep = useMemo(() => {
    if (!address) return 0;
    if (step < 1) return 1;
    return step;
  }, [address, step]);

  useEffect(() => {
    if (address && step === 0) {
      setStep(1);
      setJustConnected(true);
      const t = window.setTimeout(() => setJustConnected(false), 2200);
      return () => window.clearTimeout(t);
    }
  }, [address, step]);

  const verifyMutation = useMutation({
    mutationFn: (value: string) => verifyMint(value),
    onSuccess: (result) => {
      setMintVerified(true);
      setMintBypassed(Boolean(result.bypassed));
      setMintError(null);
      setStep(2);
    },
    onError: (err) => {
      setMintVerified(false);
      setMintBypassed(false);
      setMintError(err instanceof Error ? err.message : "Mint verification failed");
    },
  });

  const launchMutation = useMutation({
    mutationFn: async (values: LaunchPinFormOutput) => {
      const coin = await createCoin({
        mint: values.mint,
        symbol: values.symbol,
        name: values.name,
        stockTicker: values.stockTicker,
        sector: values.sector,
        autoMarket: true,
      });
      return createDuel(coin.id);
    },
    onSuccess: (duel) => router.push(`/duel/${duel.id}`),
  });

  function goToStep(i: number) {
    if (i === 0) {
      setStep(0);
      return;
    }
    if (!address) return;
    if (i > activeStep) return;
    setStep(i);
  }

  async function continueFromMint() {
    if (!address) {
      void connect();
      return;
    }
    const mint = form.getValues("mint").trim();
    const parsed = launchPinFormSchema.shape.mint.safeParse(mint);
    if (!parsed.success) {
      setMintError(parsed.error.issues[0]?.message ?? "Invalid mint");
      return;
    }
    setMintError(null);
    form.setValue("mint", parsed.data);
    verifyMutation.mutate(parsed.data);
  }

  async function continueFromPin() {
    const ok = await form.trigger(["symbol", "name", "stockTicker", "sector"]);
    if (!ok) return;
    setStep(3);
  }

  function onPickStock(pin: EligiblePin) {
    form.setValue("stockTicker", pin.ticker, { shouldValidate: true });
    form.setValue("symbol", pin.suggestedSymbol, { shouldValidate: true });
    form.setValue("name", pin.suggestedName, { shouldValidate: true });
  }

  function onOpenSubmit(values: LaunchPinFormOutput) {
    if (!address) {
      void connect();
      return;
    }
    launchMutation.mutate(values);
  }

  const watched = form.watch();

  const error =
    (launchMutation.error instanceof Error ? launchMutation.error.message : null) ||
    (activeStep !== 1 ? mintError : null) ||
    authError;

  return {
    steps: LAUNCH_STEPS,
    activeStep,
    progress: `${activeStep + 1}/4`,
    address,
    connecting,
    connect,
    ready,
    justConnected,
    mintVerified,
    mintBypassed,
    mintError,
    form,
    watched,
    verifyPending: verifyMutation.isPending,
    launchPending: launchMutation.isPending,
    error,
    goToStep,
    continueFromMint,
    continueFromPin,
    onPickStock,
    onOpenSubmit: form.handleSubmit(onOpenSubmit),
    resetMintFlags: () => {
      setMintVerified(false);
      setMintBypassed(false);
      setMintError(null);
    },
    setStep,
  };
}

export type LaunchWizardApi = ReturnType<typeof useLaunchWizard>;
