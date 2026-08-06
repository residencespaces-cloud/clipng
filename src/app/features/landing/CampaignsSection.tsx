import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function CampaignsSection({ campaigns = [] }: { campaigns?: Campaign[] }) {
  return (
    <section id="campaigns" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="min-w-0">
            <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Browse</p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase"
              style={{ fontFamily: "var(--font-big-shoulders), 'Big Shoulders Display', sans-serif" }}
            >
              Campaigns
            </h2>
          </div>
          <Link
            href="/signup?role=clipper"
            className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm">No campaigns to show yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaigns.map((c) => {
              const exhausted = c.status === "Exhausted";
              return (
                <article
                  key={c.id}
                  className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors min-w-0"
                >
                  <div className="relative bg-secondary rounded-lg aspect-video overflow-hidden group">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        KudiClip
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3">
                      <StatusBadge status={c.status} />
                    </span>
                    <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center">
                      <Play size={13} fill="currentColor" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug break-words">{c.name}</h3>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {c.platforms.map((p) => (
                      <PlatformBadge key={p} p={p} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono gap-2">
                    <span className="text-primary font-bold truncate">{fmt(clipperCpm(c.cpm))}/1k</span>
                    <span className="text-muted-foreground shrink-0">you earn</span>
                  </div>
                  <BudgetBar remaining={c.remaining} total={c.budget} />
                  <Link
                    href={exhausted ? "/signup?role=funder" : "/signup?role=clipper"}
                    className="w-full py-2 text-xs font-bold bg-primary/10 text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20 text-center"
                  >
                    {exhausted ? "Budget exhausted" : "Join Campaign"}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
