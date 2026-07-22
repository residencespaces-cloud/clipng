"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Film, Play } from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function LandingHero() {
  const [featured, setFeatured] = useState<Campaign | null>(null);
  const [campaignCount, setCampaignCount] = useState(0);

  useEffect(() => {
    api.campaigns.public()
      .then((campaigns) => {
        setCampaignCount(campaigns.length);
        setFeatured(campaigns[0] ?? null);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {campaignCount > 0 ? `${campaignCount} active campaigns` : "Campaigns launching soon"}
            </div>
            <h1
              className="text-6xl lg:text-8xl font-black leading-none uppercase mb-6"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}
            >
              Get Paid<br />
              <span className="text-primary">to Clip.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Nigerian campaigns. Naira payouts. No follower minimum. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup?role=clipper"
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-all"
              >
                Start Clipping <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/signup?role=funder"
                className="flex items-center gap-2 px-6 py-3 border border-border rounded hover:border-accent hover:text-accent transition-all"
              >
                Fund a Campaign <Film size={16} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Live Campaign</span>
                <StatusBadge status={featured?.status ?? "Active"} />
              </div>
              <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video group">
                {featured?.image ? (
                  <img
                    src={featured.image}
                    alt={featured.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">KudiClip</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
                  <p className="text-xs text-white font-mono">{featured?.name ?? "Browse campaigns"}</p>
                  <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Play size={15} fill="currentColor" />
                  </span>
                </div>
              </div>
              {featured && (
                <>
                  <div className="flex gap-2">
                    {featured.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Your CPM</div>
                      <div className="text-lg font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(clipperCpm(featured.cpm))}</div>
                      <div className="text-xs text-muted-foreground">per 1k views</div>
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Budget left</div>
                      <div className="text-lg font-black text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(featured.remaining)}</div>
                      <div className="text-xs text-muted-foreground">of {fmt(featured.budget)}</div>
                    </div>
                  </div>
                  <BudgetBar remaining={featured.remaining} total={featured.budget} />
                </>
              )}
              <Link
                href="/clipper"
                className="block w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all text-center"
              >
                Join Campaign →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
