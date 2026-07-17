"use client";

import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { WalletTransaction } from "@/app/types";

export function FunderBilling({
  balance,
  transactions,
  onFundWallet,
}: {
  balance: number;
  transactions: WalletTransaction[];
  onFundWallet: (amount: number) => void;
}) {
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);

  const amountNum = parseFloat(fundAmount) || 0;

  const handleFund = () => {
    if (amountNum <= 0) return;
    setFunding(true);
    setTimeout(() => {
      onFundWallet(amountNum);
      setFundAmount("");
      setFunding(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
            <p className="text-3xl font-black text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>
              {fmt(balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Campaign budgets are debited from your wallet and held in escrow until views are verified.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Wallet size={22} className="text-accent" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Fund Wallet</h3>
        <p className="text-xs text-muted-foreground -mt-2">
          Top up via Paystack. Funds stay in your wallet until you launch a campaign.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">₦</span>
            <input
              type="number"
              min={0}
              placeholder="100,000"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-input-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleFund}
            disabled={amountNum <= 0 || funding}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-bold rounded-lg hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Plus size={16} />
            {funding ? "Processing…" : "Fund via Paystack"}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[100_000, 250_000, 500_000, 1_000_000].map((preset) => (
            <button
              key={preset}
              onClick={() => setFundAmount(String(preset))}
              className="px-3 py-1 text-xs font-mono border border-border rounded hover:border-accent/40 hover:text-accent transition-colors"
            >
              {fmt(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-1">
        <h3 className="text-sm font-semibold mb-3">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet.</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm">{t.description}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.date}</p>
              </div>
              <div className="text-right space-y-1">
                <p
                  className={`font-mono font-bold text-sm ${t.amount >= 0 ? "text-primary" : "text-accent"}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {t.amount >= 0 ? "+" : ""}{fmt(Math.abs(t.amount))}
                </p>
                <StatusBadge status={t.type === "top_up" ? "Top-up" : "Escrow"} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
