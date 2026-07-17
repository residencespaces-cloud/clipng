import { AlertCircle } from "lucide-react";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { CreateCampaignForm, CreateStep } from "@/app/types";

export function CreateCampaignStep3({
  form,
  assetFile,
  cpmNum,
  budgetNum,
  viewCeiling,
  setCreateStep,
  onPay,
}: {
  form: CreateCampaignForm;
  assetFile: File | null;
  cpmNum: number;
  budgetNum: number;
  viewCeiling: number;
  setCreateStep: (step: CreateStep) => void;
  onPay: () => void;
}) {
  return (
    <>
      <h3 className="font-semibold">Review & Pay</h3>
      <div className="space-y-1">
        {[
          { label: "Campaign Name", value: form.name || "Untitled Campaign" },
          { label: "Source Type", value: form.sourceType === "vod" ? "Livestream VOD" : "Single Video" },
          { label: "Source Asset", value: assetFile?.name || form.assetUrl || "Not provided" },
          { label: "Moment Notes", value: form.bestMoments ? "Included" : "Not included" },
          { label: "Platforms", value: form.platforms.join(", ") || "None selected" },
          { label: "CPM (gross)", value: fmt(cpmNum) },
          { label: "Clipper CPM (80%)", value: fmt(clipperCpm(cpmNum)) },
          { label: "Total Budget", value: fmt(budgetNum) },
          { label: "View Ceiling", value: viewCeiling.toLocaleString() + " views" },
          { label: "Campaign End", value: form.end || "Not set" },
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
          Full budget held in escrow until views are verified. Campaign goes live immediately after payment clears.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setCreateStep(2)} className="flex-1 py-2.5 border border-border text-sm rounded hover:border-primary/30 transition-colors">← Back</button>
        <button
          onClick={onPay}
          className="flex-1 py-3 bg-accent text-accent-foreground text-sm font-black rounded hover:bg-accent/90 transition-all"
        >
          Pay {fmt(budgetNum)} via Paystack
        </button>
      </div>
    </>
  );
}
