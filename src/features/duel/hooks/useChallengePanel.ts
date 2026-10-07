"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useArenaAuth } from "@/features/auth/hooks/useArenaAuth";
import {
  acceptDuel,
  challengeDuel,
  duelKeys,
  getSuggestions,
} from "@/features/duel/api/duels";

export function useChallengePanel({
  duelId,
  sideACoinId,
  canChallenge,
  canAccept,
}: {
  duelId: string;
  sideACoinId: string;
  canChallenge: boolean;
  canAccept: boolean;
}) {
  const router = useRouter();
  const { address, ready, connect } = useArenaAuth();
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);

  const suggestionsQuery = useQuery({
    queryKey: duelKeys.suggestions(sideACoinId, address, duelId),
    queryFn: () => getSuggestions(sideACoinId, duelId),
    enabled: suggestionsEnabled && Boolean(address),
  });

  const challengeMutation = useMutation({
    mutationFn: (sideBCoinId: string) => challengeDuel(duelId, sideBCoinId),
    onSuccess: () => router.refresh(),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptDuel(duelId),
    onSuccess: () => router.refresh(),
  });

  const busy =
    suggestionsQuery.isFetching ||
    challengeMutation.isPending ||
    acceptMutation.isPending;

  const error =
    (suggestionsQuery.error instanceof Error && suggestionsQuery.error.message) ||
    (challengeMutation.error instanceof Error && challengeMutation.error.message) ||
    (acceptMutation.error instanceof Error && acceptMutation.error.message) ||
    null;

  return {
    visible: canChallenge || canAccept,
    canChallenge,
    canAccept,
    address,
    ready,
    connect,
    busy,
    error,
    suggestionsEnabled,
    enableSuggestions: () => setSuggestionsEnabled(true),
    suggestionsFetching: suggestionsQuery.isFetching,
    suggestions: suggestionsQuery.data ?? [],
    challenge: (coinId: string) => challengeMutation.mutate(coinId),
    accept: () => acceptMutation.mutate(),
  };
}
