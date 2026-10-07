"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { setAccessTokenGetter } from "@/shared/lib/api/http";

export type ArenaAuthValue = {
  address: string | null;
  connecting: boolean;
  ready: boolean;
  authError: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

export const ArenaAuthContext = createContext<ArenaAuthValue | null>(null);

function solanaAddressFromUser(user: ReturnType<typeof usePrivy>["user"]): string | null {
  if (!user) return null;
  const linked = user.linkedAccounts?.find(
    (account) =>
      account.type === "wallet" &&
      "chainType" in account &&
      account.chainType === "solana" &&
      "address" in account,
  );
  if (linked && "address" in linked) return linked.address;
  return null;
}

export function StubArenaAuthProvider({
  children,
  message = null,
}: {
  children: React.ReactNode;
  message?: string | null;
}) {
  const value = useMemo<ArenaAuthValue>(
    () => ({
      address: null,
      connecting: false,
      ready: false,
      authError: message,
      connect: async () => {},
      disconnect: async () => {},
      getAccessToken: async () => null,
    }),
    [message],
  );
  return (
    <ArenaAuthContext.Provider value={value}>{children}</ArenaAuthContext.Provider>
  );
}

export function ArenaAuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [authError, setAuthError] = useState<string | null>(null);

  const address = wallets[0]?.address ?? solanaAddressFromUser(user) ?? null;

  useEffect(() => {
    setAccessTokenGetter(async () => {
      if (!authenticated) return null;
      try {
        return await getAccessToken();
      } catch {
        return null;
      }
    });
    return () => setAccessTokenGetter(null);
  }, [authenticated, getAccessToken]);

  const connect = useCallback(async () => {
    setAuthError(null);
    try {
      await login();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    }
  }, [login]);

  const disconnect = useCallback(async () => {
    setAuthError(null);
    await logout();
  }, [logout]);

  const value = useMemo(
    () => ({
      address: authenticated ? address : null,
      connecting: !ready,
      ready,
      authError,
      connect,
      disconnect,
      getAccessToken: async () => {
        try {
          return (await getAccessToken()) ?? null;
        } catch {
          return null;
        }
      },
    }),
    [authenticated, address, ready, authError, connect, disconnect, getAccessToken],
  );

  return <ArenaAuthContext value={value}>{children}</ArenaAuthContext>;
}
