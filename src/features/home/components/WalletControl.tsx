"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useSiteHeader } from "@/features/home/hooks/useSiteHeader";
import { SignOutConfirm } from "@/features/home/components/SignOutConfirm";

export function WalletControl({ className }: { className?: string }) {
  const { address, connecting, connect, disconnect, ready, shortAddress } =
    useSiteHeader();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      {address ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          title={address}
          className={className ?? "font-mono"}
        >
          {shortAddress}
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void connect()}
          disabled={!ready || connecting}
          className={className ?? "font-mono"}
        >
          {!ready ? "Loading…" : "Connect"}
        </Button>
      )}

      <SignOutConfirm
        open={confirmOpen}
        address={shortAddress}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void disconnect();
        }}
      />
    </>
  );
}
