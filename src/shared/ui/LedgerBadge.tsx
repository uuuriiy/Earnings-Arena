import { cn } from "@/shared/lib/utils";

export function LedgerBadge({
  escrow,
  className,
}: {
  escrow?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        escrow
          ? "border-ok/50 text-ok"
          : "border-primary/40 text-primary",
        className,
      )}
    >
      {escrow ? "Escrow-backed pot" : "Ledger pot — escrow coming"}
    </span>
  );
}
