import { Clock } from "lucide-react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { ApprovedClip } from "@/app/types";

export function ApprovedClips({
  approvedClips,
  actionId,
  feePercent,
  onTriggerPayout,
}: {
  approvedClips: ApprovedClip[];
  actionId: string | null;
  feePercent: number;
  onTriggerPayout: (id: string) => void;
}) {
  const clipperPercent = 100 - feePercent;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Ready for Payout</h3>
      {approvedClips.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Clock size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm">Clips appear here after view counts are confirmed in the View Verification tab.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Clipper", "Campaign", "Views Verified", `Earnings Due (${clipperPercent}%)`, "Payout Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approvedClips.map((c) => {
                  const earnings = c.earningsDue ?? 0;
                  const pStatus = c.payoutStatus ?? "Pending";
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{c.clipper}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{c.campaign}</td>
                      <td className="px-4 py-3 font-mono text-xs">{c.viewsVerified.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(earnings)}</td>
                      <td className="px-4 py-3"><StatusBadge status={pStatus} /></td>
                      <td className="px-4 py-3">
                        {pStatus === "Pending" ? (
                          <button
                            onClick={() => onTriggerPayout(c.id)}
                            disabled={actionId === c.id}
                            className="px-3 py-1.5 text-xs bg-accent/10 text-accent border border-accent/20 rounded hover:bg-accent hover:text-accent-foreground transition-all font-medium whitespace-nowrap disabled:opacity-50"
                          >
                            {actionId === c.id ? "Triggering…" : "Trigger Payout"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">{pStatus}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
