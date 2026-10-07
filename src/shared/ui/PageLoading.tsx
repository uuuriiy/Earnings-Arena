export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="animate-pulse space-y-6 py-4" aria-busy="true" aria-live="polite">
      <div className="h-10 w-48 bg-border/60" />
      <div className="h-4 w-full max-w-md bg-border/40" />
      <div className="space-y-3 pt-4">
        <div className="h-24 w-full bg-border/30" />
        <div className="h-24 w-full bg-border/30" />
        <div className="h-24 w-full max-w-xl bg-border/30" />
      </div>
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
