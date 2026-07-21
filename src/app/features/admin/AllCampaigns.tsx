"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function AllCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.campaigns()
      .then(setCampaigns)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-card border border-border rounded-xl p-12 animate-pulse h-48" />;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">All Campaigns</h3>
        <p className="text-xs text-muted-foreground mt-1">Every campaign on the platform.</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Campaign", "Funder", "CPM", "Budget", "Remaining", "Views", "Clips", "Status", "End Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.funder}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.cpm)}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.budget)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{c.views.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.clips}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.end || "—"}</td>
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
