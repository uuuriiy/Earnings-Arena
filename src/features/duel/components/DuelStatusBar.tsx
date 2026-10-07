import { Badge } from "@/shared/ui/badge";
import { LedgerBadge } from "@/shared/ui/LedgerBadge";

export function DuelStatusBar({
  status,
  escrow,
  demoBout,
  bothVerified,
}: {
  status: string;
  escrow: boolean;
  demoBout: boolean;
  bothVerified: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm text-muted-foreground">DUEL</span>
      <Badge>{status}</Badge>
      <LedgerBadge escrow={escrow} />
      {demoBout && (
        <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Demo seed
        </span>
      )}
      {bothVerified && (
        <span className="border border-ok/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ok">
          Pump verified
        </span>
      )}
    </div>
  );
}
