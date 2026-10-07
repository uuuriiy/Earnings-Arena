import { z } from "zod";

export const verifySignInSchema = z.object({
  walletAddress: z.string().min(32).max(64),
  signature: z.string().min(64),
  message: z.string().min(20).max(2000),
});
