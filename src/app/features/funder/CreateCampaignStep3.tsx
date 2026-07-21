import { AlertCircle } from "lucide-react";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { CreateCampaignForm, CreateStep, FunderTab } from "@/app/types";

const FEE_PERCENT = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT ?? 20);

export function CreateCampaignStep3({
  form,
  cpmNum,
  budgetNum,
  viewCeiling,
  walletBalance,
  launching,
  setCreateStep,
  onLaunch,
  onFundWallet,
}: {
  form: CreateCampaignForm;
  cpmNum: number;
  budgetNum: number;
  viewCeiling: number;
  walletBalance: number;
  launching?: boolean;
  setCreateStep: (step: CreateStep) => void;
  onLaunch: () => void;
  onFundWallet: (tab: FunderTab) => void;
}) {
  const canLaunch = walletBalance >= budgetNum && budgetNum > 0;
  const shortfall = budgetNum - walletBalance;
  const clipperPercent = 100 - FEE_PERCENT;

  return (
    <>
      <h3 className="font-semibold">Review & Launch</h3>
      <div className="space-y-1">
        {[
          { label: "Campaign Name", value: form.name || "Untitled Campaign" },
          { label: "Source Type", value: form.sourceType === "vod" ? "Livestream VOD" : "Single Video" },
          { label: "Source Asset", value: form.assetUrl || "Not provided" },
          { label: "Moment Notes", value: form.bestMoments ? "Included" : "Not included" },
          { label: "Platforms", value: form.platforms.join(", ") || "None selected" },
          { label: "CPM (gross)", value: fmt(cpmNum) },
          { label: `Clipper CPM (${clipperPercent}%)`, value: fmt(clipperCpm(cpmNum)) },
          { label: "Total Budget", value: fmt(budgetNum) },
          { label: "View Ceiling", value: viewCeiling.toLocaleString() + " views" },
          { label: "Campaign End", value: form.end || "Not set" },
          { label: "Wallet Balance", value: fmt(walletBalance) },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground">{r.label}</span>
            <span className="text-sm font-mono font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-accent">
          {canLaunch
            ? "Budget will be debited from your wallet and held in escrow until views are verified. Campaign goes live immediately."
            : `Insufficient wallet balance. You need ${fmt(shortfall)} more to launch this campaign.`}
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setCreateStep(2)} className="flex-1 py-2.5 border border-border text-sm rounded hover:border-primary/30 transition-colors">← Back</button>
        {canLaunch ? (
          <button
            onClick={onLaunch}
            disabled={launching}
            className="flex-1 py-3 bg-accent text-accent-foreground text-sm font-black rounded hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {launching ? "Launching…" : `Launch — debit ${fmt(budgetNum)} from wallet`}
          </button>
        ) : (
          <button
            onClick={() => onFundWallet("billing")}
            className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-black rounded hover:bg-primary/90 transition-all"
          >
            Fund wallet
          </button>
        )}
      </div>
    </>
  );
}
