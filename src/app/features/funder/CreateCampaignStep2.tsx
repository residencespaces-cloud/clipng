import type { Dispatch, SetStateAction } from "react";
import { Eye } from "lucide-react";
import { clipperCpm, fmt } from "@/app/lib/format";
import type { CreateCampaignForm, CreateStep } from "@/app/types";

export function CreateCampaignStep2({
  form,
  setForm,
  cpmNum,
  budgetNum,
  viewCeiling,
  setCreateStep,
}: {
  form: CreateCampaignForm;
  setForm: Dispatch<SetStateAction<CreateCampaignForm>>;
  cpmNum: number;
  budgetNum: number;
  viewCeiling: number;
  setCreateStep: (step: CreateStep) => void;
}) {
  return (
    <>
      <h3 className="font-semibold">Budget & CPM</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">CPM — Cost per 1,000 views (₦)</label>
          <input
            type="number"
            placeholder="e.g. 500"
            value={form.cpm}
            onChange={(e) => setForm((f) => ({ ...f, cpm: e.target.value }))}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
          {cpmNum > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Clippers earn 80% → <span className="text-primary font-mono">{fmt(clipperCpm(cpmNum))}</span> per 1k views
            </p>
          )}
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Total Budget (₦)</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        {viewCeiling > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">Implied View Ceiling</p>
                <p className="text-2xl font-black text-primary mt-1" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
                  {viewCeiling.toLocaleString()} views
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fmt(budgetNum)} ÷ {fmt(cpmNum)} CPM × 1,000 = campaign exhausts at {viewCeiling.toLocaleString()} total views
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setCreateStep(1)} className="flex-1 py-2.5 border border-border text-sm rounded hover:border-primary/30 transition-colors">← Back</button>
        <button onClick={() => setCreateStep(3)} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all">
          Review & Pay →
        </button>
      </div>
    </>
  );
}
