import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { MY_CLIPS } from "@/app/data/mock-data";
import { fmt } from "@/app/lib/format";
import type { ClipperTab } from "@/app/types";

export function ClipperOverview({ onViewAll }: { onViewAll: (tab: ClipperTab) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: "₦53,256", sub: "all time", color: "text-primary" },
          { label: "Pending Payout", value: "₦7,560", sub: "this week", color: "text-accent" },
          { label: "Clips Submitted", value: "4", sub: "total", color: "text-foreground" },
          { label: "Clips Verified", value: "2", sub: "paid out", color: "text-foreground" },
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
              {MY_CLIPS.map((c) => (
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
      </div>
    </div>
  );
}
