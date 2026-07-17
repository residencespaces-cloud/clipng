import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { MY_CLIPS } from "@/app/data/mock-data";
import { fmt } from "@/app/lib/format";

export function ClipperClips() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">All Submitted Clips</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Campaign", "Platform", "Date", "Status", "Views", "Earnings"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MY_CLIPS.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="px-5 py-3 font-medium">{c.campaign}</td>
                <td className="px-5 py-3"><PlatformBadge p={c.platform} /></td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.date}</td>
                <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-5 py-3 font-mono text-xs">{c.views ? c.views.toLocaleString() : "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-primary">{c.earnings ? fmt(c.earnings) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
