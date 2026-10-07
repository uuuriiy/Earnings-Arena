import { z } from "zod";

export const createCoinSchema = z.object({
  mint: z.string().min(32).max(64),
  symbol: z.string().min(1).max(16),
  name: z.string().min(1).max(64),
  stockTicker: z.string().min(1).max(12),
  sector: z.string().max(64).optional(),
  stockPinnedPrice: z.number().positive().optional(),
  earningsAt: z.string().datetime().optional(),
  autoMarket: z.boolean().optional(),
});

export const verifyMintSchema = z.object({
  mint: z.string().min(32).max(64),
});

/** Launch wizard pin form (client). */
export const launchPinFormSchema = z.object({
  mint: z
    .string()
    .trim()
    .min(32, "Paste a full Pump mint address")
    .max(64),
  symbol: z.string().trim().min(1, "Coin ticker required").max(16),
  name: z.string().trim().min(1, "Coin name required").max(64),
  stockTicker: z
    .string()
    .trim()
    .min(1, "Stock ticker required")
    .max(12)
    .transform((v) => v.toUpperCase()),
  sector: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type LaunchPinFormValues = z.input<typeof launchPinFormSchema>;
export type LaunchPinFormOutput = z.output<typeof launchPinFormSchema>;

