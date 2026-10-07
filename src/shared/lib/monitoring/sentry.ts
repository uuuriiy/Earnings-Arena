/**
 * Lightweight Sentry hook — set NEXT_PUBLIC_SENTRY_DSN to enable.
 * Full @sentry/nextjs SDK can replace this wrapper later.
 */
export function captureException(err: unknown, context?: Record<string, unknown>) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[sentry-disabled]", err, context);
    }
    return;
  }

  // Envelope-free fallback: log until @sentry/nextjs is installed in the project
  console.error("[sentry]", err, context);
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) return;
  console.info("[sentry]", message, context);
}
