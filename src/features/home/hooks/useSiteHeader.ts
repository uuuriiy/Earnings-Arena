"use client";

import { useArenaAuth } from "@/features/auth/hooks/useArenaAuth";

export function useSiteHeader() {
  const { address, connecting, connect, disconnect, authError, ready } = useArenaAuth();

  return {
    address,
    connecting,
    connect,
    disconnect,
    authError,
    ready,
    shortAddress: address ? `${address.slice(0, 4)}…${address.slice(-4)}` : null,
  };
}
