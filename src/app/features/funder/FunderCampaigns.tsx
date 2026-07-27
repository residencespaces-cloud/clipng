import { useState } from "react";
import { PlusCircle, Wallet } from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { Campaign } from "@/app/types";

export function FunderCampaigns({
  campaigns,
  loading,
  walletBalance,
  extendingId,
  onExtendBudget,
  onFundWallet,
}: {
  campaigns: Campaign[];
  loading: boolean;
  walletBalance: number;
  extendingId: string | null;
  onExtendBudget: (campaignId: string, amount: number) => Promise<void>;
  onFundWallet: () => void;
}) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
        <p className="text-sm">No campaigns yet. Create your first campaign to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((c) => {
        const isExhausted = c.status === "Exhausted";
        const amountStr = amounts[c.id] ?? "";
        const amount = parseFloat(amountStr) || 0;
        const canAfford = amount > 0 && walletBalance >= amount;
        const isExtending = extendingId === c.id;

        return (
          <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {c.end ? `Ends ${c.end}` : "No end date"}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "CPM (gross)", value: fmt(c.cpm) },
                { label: "Total Budget", value: fmt(c.budget) },
                { label: "Views Delivered", value: c.views.toLocaleString() },
                { label: "Clips Submitted", value: String(c.clips) },
              ].map((s) => (
                <div key={s.label} className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p
                    className="font-mono font-bold text-sm mt-0.5"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            <BudgetBar remaining={c.remaining} total={c.budget} />
            <div className="flex gap-1">
              {c.platforms.map((p) => (
                <PlatformBadge key={p} p={p} />
              ))}
            </div>

            {isExhausted && (
              <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-amber-200">Budget exhausted</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add more from your wallet to reopen payouts. Clippers can keep earning on
                    views already approved.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground block mb-1">
                      Additional budget (₦)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="50000"
                      value={amountStr}
                      onChange={(e) =>
                        setAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Wallet available: {fmt(walletBalance)}
                    </p>
                  </div>
                  <button
                    onClick={() => onExtendBudget(c.id, amount)}
                    disabled={!canAfford || isExtending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <PlusCircle size={14} />
                    {isExtending ? "Adding…" : "Add Budget"}
                  </button>
                </div>
                {amount > 0 && walletBalance < amount && (
                  <button
                    onClick={onFundWallet}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Wallet size={12} />
                    Fund wallet — need {fmt(amount - walletBalance)} more
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
