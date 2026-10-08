import Link from "next/link";
import { listKoFeed } from "@/features/feed/server/service";
import { KoFeedCard } from "@/features/feed/components/KoFeedCard";
import { Button } from "@/shared/ui/button";

/** Avoid build-time Prisma (CI/Vercel have no DB during static generation). */
export const dynamic = "force-dynamic";


export default async function FeedPage() {
  const logs = await listKoFeed(30);

  return (
    <>
      <h1 className="mb-2 font-display text-4xl tracking-wider sm:text-5xl">KO FEED</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Settled bouts — winner, absolute moves, pot paid.
      </p>

      {!logs.length ? (
        <div className="border border-dashed border-border p-10 text-center">
          <p className="font-display text-3xl tracking-[0.06em] text-muted-foreground">
            NO KOs YET
          </p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Run the arena clock — settlements land here.
          </p>
          <Button asChild variant="arenaGhost" size="xl" className="mt-6 w-full sm:w-auto">
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
