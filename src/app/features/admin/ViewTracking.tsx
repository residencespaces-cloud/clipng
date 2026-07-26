import { ExternalLink, Eye, TrendingUp } from "lucide-react";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { fmt } from "@/app/lib/format";
import type { TrackedClip } from "@/app/types";

export function ViewTracking({
  clips,
  actionId,
  feePercent,
  onUpdateViews,
  onViewCountChange,
}: {
  clips: TrackedClip[];
  actionId: string | null;
  feePercent: number;
  onUpdateViews: (id: string) => void;
  onViewCountChange: (id: string, value: string) => void;
}) {
  const clipperShare = (100 - feePercent) / 100;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">View Tracking</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Approved posts keep accruing. Enter the clip&apos;s latest total view count — only the
          views gained since the last update are paid, and updates stop when the campaign budget
          runs out.
        </p>
      </div>

      {clips.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Eye size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm">No approved clips to track yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Clipper",
                    "Campaign",
                    "Platform",
                    "Link",
                    "Credited views",
                    "Earned",
                    "Paid",
                    "Outstanding",
                    "Budget left",
                    "Latest total views",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clips.map((c) => {
                  const entered = parseInt(c.viewCount, 10);
                  const newViews = Number.isFinite(entered)
                    ? Math.max(0, entered - c.viewsVerified)
                    : 0;
                  const rawPayable = (newViews / 1000) * c.cpm * clipperShare;
                  const payable = Math.min(rawPayable, c.campaignRemaining * clipperShare);
                  const canUpdate = c.trackingOpen && newViews > 0 && actionId !== c.id;

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors align-top"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{c.clipper}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                        {c.campaign}
                      </td>
                      <td className="px-4 py-3">
                        <PlatformBadge p={c.platform} />
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Open <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {c.viewsVerified.toLocaleString()}
                        <span className="block text-[10px] text-muted-foreground">
                          {c.updateCount === 0
                            ? "no updates yet"
                            : `${c.updateCount} update${c.updateCount === 1 ? "" : "s"} · ${c.lastUpdated}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">
                        {fmt(c.earningsAccrued)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {fmt(c.paidOut)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {c.outstanding > 0 ? (
                          <span className="text-accent">{fmt(c.outstanding)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {fmt(c.campaignRemaining)}
                        <span className="block text-[10px] text-muted-foreground">
                          {c.campaignStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          placeholder={String(c.viewsVerified)}
                          min={c.viewsVerified}
                          value={c.viewCount}
                          disabled={!c.trackingOpen}
                          onChange={(e) => onViewCountChange(c.id, e.target.value)}
                          className="w-28 bg-input-background border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
                        />
                        <span className="block text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                          {!c.trackingOpen
                            ? "campaign closed"
                            : newViews > 0
                              ? `+${newViews.toLocaleString()} views ≈ ${fmt(Math.round(payable))}`
                              : "enter new total"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onUpdateViews(c.id)}
                          disabled={!canUpdate}
                          title={
                            !c.trackingOpen
                              ? "Campaign is closed or out of budget"
                              : newViews > 0
                                ? "Credit the new views and queue the extra payout"
                                : "Enter a total higher than the credited views"
                          }
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <TrendingUp size={10} /> {actionId === c.id ? "…" : "Update Views"}
                        </button>
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
