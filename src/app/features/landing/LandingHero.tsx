import Link from "next/link";
import { ArrowUpRight, Film, Play } from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { CAMPAIGNS } from "@/app/data/mock-data";

export function LandingHero() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              12 active campaigns · ₦2.4M paid out
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
            <div className="flex gap-8 pt-6 border-t border-border">
              {[
                { label: "Paid out", value: "₦2.4M" },
                { label: "Clips verified", value: "847" },
                { label: "Active campaigns", value: "12" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Live Campaign</span>
                <StatusBadge status="Active" />
              </div>
              <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video group">
                <img
                  src={CAMPAIGNS[0].image}
                  alt={CAMPAIGNS[0].name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
                  <p className="text-xs text-white font-mono">{"Burna Boy — 'City Boys' Drop"}</p>
                  <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Play size={15} fill="currentColor" />
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {["TikTok", "Instagram"].map((p) => <PlatformBadge key={p} p={p} />)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Your CPM</div>
                  <div className="text-lg font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>₦480</div>
                  <div className="text-xs text-muted-foreground">per 1k views</div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Budget left</div>
                  <div className="text-lg font-black text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>₦187K</div>
                  <div className="text-xs text-muted-foreground">of ₦300K</div>
                </div>
              </div>
              <BudgetBar remaining={187400} total={300000} />
              <Link
                href="/clipper"
                className="block w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all text-center"
              >
                Join Campaign →
              </Link>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-primary/30 rounded-lg px-4 py-3 shadow-xl">
              <div className="text-xs text-muted-foreground">Adaeze earned last week</div>
              <div className="text-xl font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>₦40,416</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
