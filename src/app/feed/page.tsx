import Link from "next/link";
import { listKoFeed } from "@/features/feed/server/service";
import { KoFeedCard } from "@/features/feed/components/KoFeedCard";
import { Button } from "@/shared/ui/button";

export const revalidate = 30;

export default async function FeedPage() {
  const logs = await listKoFeed(30);

  return (
    <>
      <h1 className="mb-2 font-display text-5xl tracking-[0.05em]">KO FEED</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Settled bouts — winner, absolute moves, pot paid.
      </p>

      {logs.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center">
          <p className="font-display text-3xl tracking-[0.06em] text-muted-foreground">
            NO KOs YET
          </p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Run the arena clock — settlements land here.
          </p>
          <Button asChild variant="arenaGhost" size="xl" className="mt-6">
            <Link href="/">Back to arena</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
          {logs.map((log) => (
            <KoFeedCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </>
  );
}
