import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import type { PendingClip } from "@/app/types";

export function PendingReview({
  clips,
  onApprove,
  onReject,
  onApproveAll,
  onViewCountChange,
  onCodeVerifiedChange,
}: {
  clips: PendingClip[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onApproveAll: () => void;
  onViewCountChange: (id: number, value: string) => void;
  onCodeVerifiedChange: (id: number, verified: boolean) => void;
}) {
  const verifiedCount = clips.filter((clip) => clip.codeVerified).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Clips Awaiting Review</h3>
        {clips.length > 0 && (
          <button
            onClick={onApproveAll}
            disabled={verifiedCount === 0}
            className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Approve Verified ({verifiedCount})
          </button>
        )}
      </div>
      {clips.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <CheckCircle size={32} className="mx-auto mb-3 text-primary/40" />
          <p className="text-sm">All clips reviewed. Nothing pending.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Clipper", "Campaign", "Platform", "Date", "Proof code", "Link", "Views (manual)", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clips.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{c.clipper}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{c.campaign}</td>
                    <td className="px-4 py-3"><PlatformBadge p={c.platform} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.date}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-primary whitespace-nowrap">
                        {c.verificationCode}
                      </code>
                      <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={c.codeVerified}
                          onChange={(e) =>
                            onCodeVerifiedChange(c.id, e.target.checked)
                          }
                          className="accent-primary"
                        />
                        Code visible in caption
                      </label>
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
                        value={c.viewCount}
                        onChange={(e) => onViewCountChange(c.id, e.target.value)}
                        className="w-24 bg-input-background border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove(c.id)}
                          disabled={!c.codeVerified}
                          title={
                            c.codeVerified
                              ? "Approve clip"
                              : "Verify the caption code first"
                          }
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
                        >
                          <CheckCircle size={10} /> Approve
                        </button>
                        <button
                          onClick={() => onReject(c.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                        >
                          <XCircle size={10} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
