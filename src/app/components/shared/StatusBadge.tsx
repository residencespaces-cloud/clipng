import { normalizeStatus } from "@/server/status";

export function StatusBadge({ status }: { status: string }) {
  const label = normalizeStatus(status);
  const map: Record<string, string> = {
    Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Approved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    Verified: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Triggered: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/15",
    Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Exhausted: "bg-red-500/15 text-red-400 border-red-500/20",
    Ended: "bg-muted text-muted-foreground border-border",
    Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
    Failed: "bg-red-500/15 text-red-400 border-red-500/20",
    "Top-up": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Escrow: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    Draft: "bg-muted text-muted-foreground border-border",
    Archived: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${map[label] ?? "border-border text-muted-foreground"}`}>
      {label}
    </span>
  );
}
