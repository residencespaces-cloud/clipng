"use client";

import { useEffect, useState } from "react";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { fmt } from "@/app/lib/format";
import type { ClipperTab, EarningsSummary, MyClip } from "@/app/types";

export function ClipperOverview({
  onViewAll,
  clips,
  summary,
  loading,
}: {
  onViewAll: (tab: ClipperTab) => void;
  clips: MyClip[];
  summary: EarningsSummary | null;
  loading: boolean;
}) {
  const recent = clips.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: fmt(summary?.totalEarned ?? 0), sub: "all time", color: "text-primary" },
          { label: "Pending Payout", value: fmt(summary?.pendingThisWeek ?? 0), sub: "awaiting payout", color: "text-accent" },
          { label: "Clips Submitted", value: String(summary?.clipsSubmitted ?? 0), sub: "total", color: "text-foreground" },
          { label: "Clips Verified", value: String(summary?.clipsVerified ?? 0), sub: "verified", color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Clips</h3>
          <button onClick={() => onViewAll("clips")} className="text-xs text-primary hover:underline">View all</button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No clips submitted yet. Browse campaigns to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Campaign", "Platform", "Status", "Views", "Earnings"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-sm">{c.campaign}</td>
                    <td className="px-5 py-3"><PlatformBadge p={c.platform} /></td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 font-mono text-xs">{c.views ? c.views.toLocaleString() : "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-primary">{c.earnings ? fmt(c.earnings) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
