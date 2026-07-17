"use client";

import type { Dispatch, SetStateAction } from "react";
import { CheckCircle } from "lucide-react";
import type { CreateCampaignForm, CreateStep, FunderTab } from "@/app/types";
import { CreateCampaignStep1 } from "./CreateCampaignStep1";
import { CreateCampaignStep2 } from "./CreateCampaignStep2";
import { CreateCampaignStep3 } from "./CreateCampaignStep3";

export function CreateCampaign({
  form,
  setForm,
  assetFile,
  setAssetFile,
  createStep,
  setCreateStep,
  paidSuccess,
  setPaidSuccess,
  togglePlatform,
  cpmNum,
  budgetNum,
  viewCeiling,
  onViewCampaigns,
}: {
  form: CreateCampaignForm;
  setForm: Dispatch<SetStateAction<CreateCampaignForm>>;
  assetFile: File | null;
  setAssetFile: (file: File | null) => void;
  createStep: CreateStep;
  setCreateStep: (step: CreateStep) => void;
  paidSuccess: boolean;
  setPaidSuccess: (v: boolean) => void;
  togglePlatform: (p: string) => void;
  cpmNum: number;
  budgetNum: number;
  viewCeiling: number;
  onViewCampaigns: (tab: FunderTab) => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        {([1, 2, 3] as CreateStep[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${createStep >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {createStep > s ? <CheckCircle size={14} /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-12 transition-colors ${createStep > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {createStep === 1 ? "Campaign Details" : createStep === 2 ? "Budget & CPM" : "Review & Pay"}
        </span>
      </div>

      {paidSuccess ? (
        <div className="bg-card border border-primary/30 rounded-xl p-10 text-center space-y-4">
          <CheckCircle size={48} className="text-primary mx-auto" />
          <h3 className="text-2xl font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>Campaign Live!</h3>
          <p className="text-muted-foreground text-sm">Payment confirmed via Paystack. Your campaign is now open to all clippers.</p>
          <button
            onClick={() => { onViewCampaigns("campaigns"); setPaidSuccess(false); setCreateStep(1); }}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all"
          >
            View Campaigns
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          {createStep === 1 && (
            <CreateCampaignStep1
              form={form}
              assetFile={assetFile}
              setForm={setForm}
              setAssetFile={setAssetFile}
              togglePlatform={togglePlatform}
              setCreateStep={setCreateStep}
            />
          )}
          {createStep === 2 && (
            <CreateCampaignStep2
              form={form}
              setForm={setForm}
              cpmNum={cpmNum}
              budgetNum={budgetNum}
              viewCeiling={viewCeiling}
              setCreateStep={setCreateStep}
            />
          )}
          {createStep === 3 && (
            <CreateCampaignStep3
              form={form}
              assetFile={assetFile}
              cpmNum={cpmNum}
              budgetNum={budgetNum}
              viewCeiling={viewCeiling}
              setCreateStep={setCreateStep}
              onPay={() => setPaidSuccess(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
