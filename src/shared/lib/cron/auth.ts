export function isProductionLike() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/** Require `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this). */
export function authorizeCron(req: Request): CronAuthResult {
  const secret = process.env.CRON_SECRET;
  
  if (isProductionLike() && !secret) {
    return { ok: false, status: 500, error: "CRON_SECRET is required in production" };
  }
  
  if (!secret) {
    return { ok: false, status: 401, error: "CRON_SECRET is not configured" };
  }
  
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  
  return { ok: true };
}
