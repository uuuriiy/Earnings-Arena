"use client";

import { useEffect, useState } from "react";
import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import {
  ArenaAuthProvider,
  StubArenaAuthProvider,
} from "@/context/ArenaAuthProvider";

const rpc =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const wsRpc = rpc.replace(/^https:/, "wss:").replace(/^http:/, "ws:");

function isValidPrivyAppId(appId: string | undefined): appId is string {
  if (!appId) return false;
  if (appId.includes("xxxx") || appId.includes("your-privy")) return false;
  // Privy app IDs are typically cuid-like / alphanumeric
  return appId.length >= 20;
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!mounted) {
    return <StubArenaAuthProvider>{children}</StubArenaAuthProvider>;
  }

  if (!isValidPrivyAppId(appId)) {
    return (
      <StubArenaAuthProvider message="Set NEXT_PUBLIC_PRIVY_APP_ID from https://dashboard.privy.io/">
        <div>
          <div className="border-b border-danger/40 bg-[var(--bg-2)] px-6 py-2 font-mono text-xs text-danger">
            Missing or invalid Privy app ID. Create an app at{" "}
            <a
              className="underline"
              href="https://dashboard.privy.io/"
              target="_blank"
              rel="noreferrer"
            >
              dashboard.privy.io
            </a>{" "}
            and set NEXT_PUBLIC_PRIVY_APP_ID / PRIVY_APP_SECRET.
          </div>
          {children}
        </div>
      </StubArenaAuthProvider>
    );
  }

  const solanaConnectors = toSolanaWalletConnectors({
    // Avoid duplicate connector mounts that trigger Privy's key warning
    shouldAutoConnect: false,
  });

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
        loginMethods: ["wallet", "email"],
        appearance: {
          showWalletLoginFirst: true,
          walletChainType: "solana-only",
          theme: "dark",
          accentColor: "#e8ff47",
          // Dashboard may still list EVM wallets; keep the modal Solana-only.
          walletList: [
            "detected_solana_wallets",
            "phantom",
            "solflare",
            "backpack",
            "jupiter",
          ],
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "all-users",
          },
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        solana: {
          rpcs: {
            "solana:mainnet": {
              rpc: createSolanaRpc(rpc),
              rpcSubscriptions: createSolanaRpcSubscriptions(wsRpc),
            },
          },
        },
      }}
    >
      <ArenaAuthProvider>{children}</ArenaAuthProvider>
    </PrivyAuthProvider>
  );
}
