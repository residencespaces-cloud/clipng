import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { CAMPAIGNS } from "@/app/data/mock-data";
import { fmt } from "@/app/lib/format";
import type { FunderTab } from "@/app/types";

export function FunderOverview({ onTab }: { onTab: (tab: FunderTab) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spent", value: "₦800K", color: "text-accent" },
          { label: "Views Delivered", value: "850K", color: "text-primary" },
          { label: "Active Campaigns", value: "3", color: "text-foreground" },
          { label: "Clips Submitted", value: "153", color: "text-foreground" },
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
        <div className="divide-y divide-border">
          {CAMPAIGNS.slice(0, 2).map((c) => (
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
      </div>
    </div>
  );
}
