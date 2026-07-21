"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { fmt } from "@/app/lib/format";
import type { Payout } from "@/app/types";

export function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.payouts()
      .then(setPayouts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-card border border-border rounded-xl p-12 animate-pulse h-48" />;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Payout History</h3>
        <p className="text-xs text-muted-foreground mt-1">All clipper payouts across the platform.</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No payouts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Clipper", "Campaign", "Amount", "Status", "Paystack Ref"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.date}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{p.clipper}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{p.campaign}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[140px]">{p.paystackRef ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
