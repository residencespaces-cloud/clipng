import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { CAMPAIGNS } from "@/app/data/mock-data";
import { fmt } from "@/app/lib/format";

export function AllCampaigns() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
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
            {CAMPAIGNS.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.funder}</td>
                <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.cpm)}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.budget)}</td>
                <td className="px-4 py-3 font-mono text-xs text-accent whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{c.views.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.clips}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
