"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { useChallengePanel } from "@/features/duel/hooks/useChallengePanel";

export function ChallengePanel({
  duelId,
  sideACoinId,
  canChallenge,
  canAccept,
}: {
  duelId: string;
  sideACoinId: string;
  canChallenge: boolean;
  canAccept: boolean;
}) {
  const panel = useChallengePanel({ duelId, sideACoinId, canChallenge, canAccept });

  if (!panel.visible) return null;

  return (
    <div className="mt-4">
      {panel.canChallenge && (
        <div className="flex flex-col gap-3">
          {!panel.address ? (
            <>
              <p className="font-mono text-xs text-muted-foreground">
                Connect the wallet that owns your pinned coin, then challenge.
              </p>
              <Button
                type="button"
                variant="arena"
                size="xl"
                className="w-full sm:w-auto"
                onClick={() => void panel.connect()}
                disabled={!panel.ready}
              >
                Connect to challenge
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="arena"
                size="xl"
                className="w-full sm:w-auto"
                onClick={panel.enableSuggestions}
                disabled={panel.busy}
              >
                Suggest my rivals
              </Button>
              {panel.suggestionsEnabled &&
                !panel.suggestionsFetching &&
                panel.suggestions.length === 0 && (
                  <div className="border border-dashed border-border px-4 py-5">
                    <p className="font-mono text-xs text-muted-foreground">
                      No coins on this wallet match this bout. While connected as this user, pin a
                      stock under{" "}
                      <Link href="/launch" className="text-primary underline">
                        Enter
                      </Link>
                      , then return here to challenge.
                    </p>
                  </div>
                )}
              {panel.suggestions.map((s) => (
                <Button
                  key={s.coinId}
                  type="button"
                  variant="ghost"
                  disabled={panel.busy}
                  onClick={() => panel.challenge(s.coinId)}
                  className="h-auto flex-col items-start gap-1 px-4 py-3 text-left font-[family-name:var(--font-display)] text-xl tracking-[0.06em]"
                >
                  <span>
                    Challenge ${s.coin.symbol} ({s.coin.stockTicker}) — score {s.score}
                  </span>
                  <span className="font-mono text-xs font-normal tracking-normal text-muted-foreground">
                    {s.reasons.join(" · ")}
                  </span>
                </Button>
              ))}
            </>
          )}
        </div>
      )}
      {panel.canAccept && (
        <Button
          type="button"
          variant="arena"
          size="xl"
          className="w-full sm:w-auto"
          onClick={panel.accept}
          disabled={panel.busy}
        >
          Lock duel
        </Button>
      )}
      {panel.error && <p className="mt-2 text-danger">{panel.error}</p>}
    </div>
  );
}
