import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function FunderCampaigns({ campaigns, loading }: { campaigns: Campaign[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
        <p className="text-sm">No campaigns yet. Create your first campaign to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((c) => (
        <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.end ? `Ends ${c.end}` : "No end date"}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "CPM (gross)", value: fmt(c.cpm) },
              { label: "Total Budget", value: fmt(c.budget) },
              { label: "Views Delivered", value: c.views.toLocaleString() },
              { label: "Clips Submitted", value: String(c.clips) },
            ].map((s) => (
              <div key={s.label} className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-mono font-bold text-sm mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <BudgetBar remaining={c.remaining} total={c.budget} />
          <div className="flex gap-1">
            {c.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
