import Link from "next/link";
import { ArrowUpRight, Film, Play } from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function LandingHero({
  featured = null,
  campaignCount = 0,
}: {
  featured?: Campaign | null;
  campaignCount?: number;
}) {
  return (
    <section className="pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-5 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              <span className="truncate">
                {campaignCount > 0 ? `${campaignCount}+ campaigns on KudiClip` : "Campaigns launching soon"}
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-[0.95] uppercase mb-5 sm:mb-6 break-words"
              style={{ fontFamily: "var(--font-big-shoulders), 'Big Shoulders Display', sans-serif" }}
            >
              Get Paid<br />
              <span className="text-primary">to Clip.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-7 sm:mb-8 max-w-md">
              Nigerian campaigns. Naira payouts. No follower minimum. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 sm:mb-10">
              <Link
                href="/signup?role=clipper"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-all"
              >
                Start Clipping <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/signup?role=funder"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded hover:border-accent hover:text-accent transition-all"
              >
                Fund a Campaign <Film size={16} />
              </Link>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Latest Campaign</span>
                <StatusBadge status={featured?.status ?? "Active"} />
              </div>
              <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video group">
                {featured?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.image}
                    alt={featured.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">KudiClip</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between gap-3">
                  <p className="text-xs text-white font-mono truncate min-w-0">
                    {featured?.name ?? "Browse campaigns"}
                  </p>
                  <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Play size={15} fill="currentColor" aria-hidden="true" />
                  </span>
                </div>
              </div>
              {featured && (
                <>
                  <div className="flex gap-2 flex-wrap">
                    {featured.platforms.map((p) => (
                      <PlatformBadge key={p} p={p} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-secondary rounded-lg p-3 min-w-0">
                      <div className="text-xs text-muted-foreground">Your CPM</div>
                      <div
                        className="text-base sm:text-lg font-black text-primary truncate"
                        style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace" }}
                      >
                        {fmt(clipperCpm(featured.cpm))}
                      </div>
                      <div className="text-xs text-muted-foreground">per 1k views</div>
                    </div>
                    <div className="bg-secondary rounded-lg p-3 min-w-0">
                      <div className="text-xs text-muted-foreground">Budget left</div>
                      <div
                        className="text-base sm:text-lg font-black text-accent truncate"
                        style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace" }}
                      >
                        {fmt(featured.remaining)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">of {fmt(featured.budget)}</div>
                    </div>
                  </div>
                  <BudgetBar remaining={featured.remaining} total={featured.budget} />
                </>
              )}
              <Link
                href={featured?.status === "Exhausted" ? "/signup?role=funder" : "/signup?role=clipper"}
                className="block w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all text-center"
              >
                {featured?.status === "Exhausted" ? "Budget exhausted — Fund a campaign →" : "Join Campaign →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
