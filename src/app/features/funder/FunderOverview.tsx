import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { Campaign, FunderTab } from "@/app/types";

export function FunderOverview({
  onTab,
  walletBalance,
  campaigns,
  loading,
}: {
  onTab: (tab: FunderTab) => void;
  walletBalance: number;
  campaigns: Campaign[];
  loading: boolean;
}) {
  const active = campaigns.filter((c) => c.status === "Active");
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalClips = campaigns.reduce((sum, c) => sum + c.clips, 0);

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
          { label: "Wallet Balance", value: fmt(walletBalance), color: "text-accent" },
          { label: "Views Delivered", value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(0)}K` : String(totalViews), color: "text-primary" },
          { label: "Active Campaigns", value: String(active.length), color: "text-foreground" },
          { label: "Clips Submitted", value: String(totalClips), color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Active Campaigns</h3>
          <button onClick={() => onTab("create")} className="text-xs text-primary hover:underline">+ New Campaign</button>
        </div>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No active campaigns. Create one to get started.</p>
        ) : (
          <div className="divide-y divide-border">
            {active.slice(0, 3).map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{c.clips} clips · {c.views.toLocaleString()} views</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-mono font-bold text-accent text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)} left</p>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
