"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { api } from "@/app/lib/api/client";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function LiveCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    api.campaigns.public().then(setCampaigns).catch(() => setCampaigns([]));
  }, []);

  return (
    <section id="campaigns" className="py-24 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Open now</p>
            <h2 className="text-5xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>Live Campaigns</h2>
          </div>
          <Link href="/clipper" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm">No live campaigns right now. Check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors">
                <div className="relative bg-secondary rounded-lg aspect-video overflow-hidden group">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">KudiClip</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center">
                    <Play size={13} fill="currentColor" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.funder}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {c.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-primary font-bold">{fmt(clipperCpm(c.cpm))}/1k</span>
                  <span className="text-muted-foreground">you earn</span>
                </div>
                <BudgetBar remaining={c.remaining} total={c.budget} />
                <Link
                  href="/clipper"
                  className="w-full py-2 text-xs font-bold bg-primary/10 text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20 text-center"
                >
                  Join Campaign
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
