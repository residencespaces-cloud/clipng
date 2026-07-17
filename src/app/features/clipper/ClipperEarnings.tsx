"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { fmt } from "@/app/lib/format";
import type { MyClip } from "@/app/types";
import { MY_CLIPS } from "@/app/data/mock-data";

export function ClipperEarnings() {
  const [summary, setSummary] = useState({
    totalEarned: "₦53,256",
    pendingThisWeek: "₦7,560",
    paidOut: "₦40,416",
  });
  const [history, setHistory] = useState<MyClip[]>(MY_CLIPS.filter((c) => c.earnings > 0));

  useEffect(() => {
    api.submissions.earnings()
      .then((e) => {
        setSummary({
          totalEarned: fmt(e.totalEarned),
          pendingThisWeek: fmt(e.pendingThisWeek),
          paidOut: fmt(e.paidOut),
        });
      })
      .catch(() => undefined);

    api.submissions.mine()
      .then((clips) => setHistory(clips.filter((c) => c.earnings > 0)))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Total Earned", value: summary.totalEarned, color: "text-primary" },
          { label: "Pending This Week", value: summary.pendingThisWeek, color: "text-accent" },
          { label: "Paid Out", value: summary.paidOut, color: "text-foreground" },
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
      </div>
    </div>
  );
}
