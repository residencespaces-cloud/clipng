import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { PAYOUTS } from "@/app/data/mock-data";
import { fmt } from "@/app/lib/format";

export function AdminPayouts() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Date", "Clipper", "Campaign", "Amount (₦)", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">{p.clipper}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{p.campaign}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(p.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
