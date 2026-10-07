import Image from "next/image";
import Link from "next/link";
import { fontDisplay } from "@/shared/lib/fonts";
import { cn } from "@/shared/lib/utils";
import { listOpenDuels } from "@/features/home/server/service";
import { FeaturedBout } from "@/features/home/components/FeaturedBout";
import { BoutBoard } from "@/features/home/components/BoutBoard";
import { Button } from "@/shared/ui/button";

/** Live board — short ISR instead of blocking every navigation. */
export const revalidate = 15;

export default async function HomePage() {
  const duels = await listOpenDuels();

  const featured = duels[0];
  const board = featured ? duels.filter((d) => d.id !== featured.id) : duels;

  return (
    <div>
      <section className="relative mb-10 flex min-h-[100dvh] flex-col justify-end border-b border-border pb-10 pt-16">
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
            "pointer-events-none absolute inset-x-0 top-8 select-none text-[clamp(4rem,18vw,11rem)] leading-[0.85] tracking-[0.04em] text-foreground/[0.04]",
          )}
        >
          EARNINGS
          <br />
          ARENA
        </p>

        <div className="relative flex items-start gap-4 md:gap-5">
          <Image
            src="/brand-mark.png"
            alt="Earnings Arena"
            width={96}
            height={96}
            priority
            className="mt-1 size-16 shrink-0 md:size-24"
          />
          <p
            className={cn(
              fontDisplay.className,
              "m-0 text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] tracking-[0.04em]",
            )}
          >
            EARNINGS
            <br />
            ARENA
          </p>
        </div>
        <p className="relative mt-3 max-w-[28rem] font-sans text-muted-foreground">
          Memecoins pinned to sub-$5 stocks. Bigger absolute move after earnings takes the pot.
        </p>
        <div className="relative mt-5">
          <Button asChild variant="arena" size="xl">
            <Link href="/launch">Enter a coin</Link>
          </Button>
        </div>

        {featured ? (
          <div className="relative mt-8">
            <FeaturedBout duel={featured} escrow={Boolean(featured.vaultPubkey)} />
          </div>
        ) : (
          <p className="relative mt-8 font-mono text-sm text-muted-foreground">
            No live bouts — open the floor.
          </p>
        )}
      </section>

      <BoutBoard board={board} featuredId={featured?.id ?? null} />
    </div>
  );
}
