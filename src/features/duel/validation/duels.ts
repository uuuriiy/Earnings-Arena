import { z } from "zod";

export const createDuelSchema = z.object({
  sideACoinId: z.string().cuid(),
});

export const challengeDuelSchema = z.object({
  sideBCoinId: z.string().cuid(),
});

export const settleCronSchema = z
  .object({
    duelId: z.string().cuid().optional(),
    forceReportAt: z.string().datetime().optional(),
    priceOverrides: z.record(z.string(), z.number()).optional(),
  })
  .default({});
