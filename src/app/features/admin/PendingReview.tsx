import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import type { PendingClip } from "@/app/types";

export function PendingReview({
  clips,
  actionId,
  rejectingId,
  rejectReason,
  onApprove,
  onReject,
  onStartReject,
  onCancelReject,
  onRejectReasonChange,
  onApproveAll,
  onCodeVerifiedChange,
}: {
  clips: PendingClip[];
  actionId: string | null;
  rejectingId: string | null;
  rejectReason: string;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onStartReject: (id: string) => void;
  onCancelReject: () => void;
  onRejectReasonChange: (reason: string) => void;
  onApproveAll: () => void;
  onCodeVerifiedChange: (id: string, verified: boolean) => void;
}) {
  const verifiedCount = clips.filter((clip) => clip.codeVerified).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Clips Awaiting Review</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Verify the post link and caption code. Approve or reject — view counts are verified separately.
        </p>
      </div>
      <div className="flex items-center justify-end">
        {clips.length > 0 && (
          <button
            onClick={onApproveAll}
            disabled={verifiedCount === 0 || !!actionId}
            className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                  {["Clipper", "Campaign", "Platform", "Submitted", "Proof code", "Link", "Actions"].map((h) => (
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
                          onChange={(e) => onCodeVerifiedChange(c.id, e.target.checked)}
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
                      {rejectingId === c.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <input
                            value={rejectReason}
                            onChange={(e) => onRejectReasonChange(e.target.value)}
                            placeholder="Rejection reason"
                            className="w-full bg-input-background border border-border rounded px-2 py-1 text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => onReject(c.id, rejectReason || undefined)}
                              disabled={actionId === c.id}
                              className="text-xs text-red-400 hover:underline disabled:opacity-50"
                            >
                              Confirm reject
                            </button>
                            <button onClick={onCancelReject} className="text-xs text-muted-foreground hover:underline">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApprove(c.id)}
                            disabled={!c.codeVerified || actionId === c.id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <CheckCircle size={10} /> {actionId === c.id ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => onStartReject(c.id)}
                            disabled={actionId === c.id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500 hover:text-white transition-all whitespace-nowrap disabled:opacity-40"
                          >
                            <XCircle size={10} /> Reject
                          </button>
                        </div>
                      )}
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
