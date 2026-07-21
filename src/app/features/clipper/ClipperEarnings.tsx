"use client";

import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { EarningsSummary, MyClip } from "@/app/types";

export function ClipperEarnings({
  summary,
  history,
  loading,
  error,
  onRetry,
}: {
  summary: EarningsSummary | null;
  history: MyClip[];
  loading: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
        <p className="text-sm text-red-400">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs text-primary hover:underline">Try again</button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Total Earned", value: fmt(summary?.totalEarned ?? 0), color: "text-primary" },
          { label: "Pending Payout", value: fmt(summary?.pendingThisWeek ?? 0), color: "text-accent" },
          { label: "Paid Out", value: fmt(summary?.paidOut ?? 0), color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 sm:p-5 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p
              className={`text-2xl sm:text-3xl font-black ${s.color} break-words`}
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Payout History</h3>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No earnings yet. Submit clips to start earning.</p>
        ) : (
          <div className="divide-y divide-border">
            {history.map((p) => (
              <div
                key={p.id}
                className="px-4 sm:px-5 py-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">{p.campaign}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.date} · {p.views.toLocaleString()} views</p>
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right space-y-1">
                  <p className="font-mono font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(p.earnings)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
