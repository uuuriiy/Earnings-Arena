"use client";

import { use } from "react";
import { ArenaAuthContext } from "@/context/ArenaAuthProvider";

export function useArenaAuth() {
  const ctx = use(ArenaAuthContext);
  if (!ctx) throw new Error("useArenaAuth must be used within ArenaAuthProvider");
  return ctx;
}

/** @deprecated Prefer useArenaAuth */
export const useWallet = useArenaAuth;
