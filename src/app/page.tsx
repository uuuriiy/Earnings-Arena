import Image from "next/image";
import Link from "next/link";
import { fontDisplay } from "@/shared/lib/fonts";
import { cn } from "@/shared/lib/utils";
import { listOpenDuels } from "@/features/home/server/service";
import { FeaturedBout } from "@/features/home/components/FeaturedBout";
import { BoutBoard } from "@/features/home/components/BoutBoard";
import { Button } from "@/shared/ui/button";

/** Live board — runtime fetch (unstable_cache in service); no build-time DB. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const duels = await listOpenDuels();

  const featured = duels[0];
  const board = featured ? duels.filter((d) => d.id !== featured.id) : duels;

  return (
    <>
      <section className="relative mb-8 border-b border-border pb-8 pt-6 lg:mb-10 lg:flex lg:min-h-dvh lg:flex-col lg:justify-end lg:pb-10 lg:pt-16">
        <Image
          src="/brand-mark.png"
          alt=""
          width={520}
          height={520}
          aria-hidden
          priority
          className="pointer-events-none absolute right-[-4%] top-[8%] size-[min(52vw,420px)] select-none opacity-[0.12] md:right-0 md:top-[6%]"
        />
        <p
          aria-hidden
          className={cn(
            fontDisplay.className,
            "pointer-events-none absolute inset-x-0 top-4 select-none text-[clamp(3.5rem,16vw,11rem)] leading-[0.85] tracking-[0.04em] text-foreground/[0.04] lg:top-8",
          )}
        >
          EARNINGS
          <br />
          ARENA
        </p>

        <div className="relative flex items-start gap-3 sm:gap-4 md:gap-5">
          <Image
            src="/brand-mark.png"
            alt="Earnings Arena"
            width={96}
            height={96}
            priority
            className="mt-1 size-14 shrink-0 sm:size-16 md:size-24"
          />
          <p
            className={cn(
              fontDisplay.className,
              "m-0 text-[clamp(2.5rem,11vw,5.5rem)] leading-[0.9] tracking-[0.04em]",
            )}
          >
            EARNINGS
            <br />
            ARENA
          </p>
        </div>
        <p className="relative mt-3 max-w-md font-sans text-sm text-muted-foreground sm:text-base">
          Memecoins pinned to sub-$5 stocks. Bigger absolute move after earnings takes the pot.
        </p>
        <div className="relative mt-5">
          <Button asChild variant="arena" size="xl" className="w-full sm:w-auto">
            <Link href="/launch">Enter a coin</Link>
          </Button>
        </div>

        {/* Desktop: featured stays in hero fold. Mobile: below fold so brand owns first viewport. */}
        {featured ? (
          <div className="relative mt-8 hidden lg:block">
            <FeaturedBout duel={featured} escrow={Boolean(featured.vaultPubkey)} />
          </div>
        ) : (
          <p className="relative mt-8 hidden font-mono text-sm text-muted-foreground lg:block">
            No live bouts — open the floor.
          </p>
        )}
      </section>

      {featured ? (
        <div className="mb-8 lg:hidden">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Featured bout
          </p>
          <FeaturedBout duel={featured} escrow={Boolean(featured.vaultPubkey)} />
        </div>
      ) : (
        <p className="mb-8 font-mono text-sm text-muted-foreground lg:hidden">
          No live bouts — open the floor.
        </p>
      )}

      <BoutBoard board={board} featuredId={featured?.id ?? null} />
    </>
  );
}
