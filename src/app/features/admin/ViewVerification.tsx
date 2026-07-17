import { CheckCircle, ExternalLink, Eye } from "lucide-react";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import type { AwaitingViewsClip } from "@/app/types";

export function ViewVerification({
  clips,
  onConfirmViews,
  onViewCountChange,
}: {
  clips: AwaitingViewsClip[];
  onConfirmViews: (id: number) => void;
  onViewCountChange: (id: number, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">View Verification</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Approved posts — open the link, confirm view count, then mark verified for payout.
        </p>
      </div>
      {clips.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Eye size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm">No clips awaiting view verification.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Clipper", "Campaign", "Platform", "Approved", "Proof code", "Link", "Views (manual)", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clips.map((c) => {
                  const views = parseInt(c.viewCount) || 0;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{c.clipper}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{c.campaign}</td>
                      <td className="px-4 py-3"><PlatformBadge p={c.platform} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.approvedDate}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-primary whitespace-nowrap">{c.verificationCode}</code>
                      </td>
                      <td className="px-4 py-3">
                        <a href={c.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          Open <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          placeholder="0"
                          min={0}
                          value={c.viewCount}
                          onChange={(e) => onViewCountChange(c.id, e.target.value)}
                          className="w-28 bg-input-background border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onConfirmViews(c.id)}
                          disabled={views <= 0}
                          title={views > 0 ? "Confirm views and send to payout queue" : "Enter view count first"}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
                        >
                          <CheckCircle size={10} /> Confirm Views
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
