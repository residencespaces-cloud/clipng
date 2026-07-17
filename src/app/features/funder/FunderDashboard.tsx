"use client";

import { useState, type ReactNode } from "react";
import { BarChart2, Film, Upload, Wallet } from "lucide-react";
import { DashboardShell } from "@/app/components/shared/DashboardShell";
import type { CreateCampaignForm, CreateStep, FunderTab } from "@/app/types";
import { CreateCampaign } from "./CreateCampaign";
import { FunderBilling } from "./FunderBilling";
import { FunderCampaigns } from "./FunderCampaigns";
import { FunderOverview } from "./FunderOverview";

export function FunderDashboard() {
  const [tab, setTab] = useState<FunderTab>("overview");
  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState<CreateCampaignForm>({
    name: "",
    assetUrl: "",
    sourceType: "video",
    bestMoments: "",
    description: "",
    platforms: ["TikTok"],
    cpm: "",
    budget: "",
    start: "",
    end: "",
  });
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const cpmNum = parseFloat(form.cpm) || 0;
  const budgetNum = parseFloat(form.budget) || 0;
  const viewCeiling = cpmNum && budgetNum ? Math.round((budgetNum / cpmNum) * 1000) : 0;

  const sidebarItems: { key: FunderTab; label: string; icon: ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
    { key: "campaigns", label: "My Campaigns", icon: <Film size={16} /> },
    { key: "create", label: "Create Campaign", icon: <Upload size={16} /> },
    { key: "billing", label: "Billing", icon: <Wallet size={16} /> },
  ];

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  return (
    <DashboardShell
      tab={tab}
      items={sidebarItems}
      user={{ name: "Spaceship Collective", roleLabel: "Funder", accent: "accent" }}
      sidebarOpen={sidebarOpen}
      onSidebarOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
      onTab={(key) => { setTab(key); setSidebarOpen(false); }}
    >
      {tab === "overview" && <FunderOverview onTab={setTab} />}
      {tab === "campaigns" && <FunderCampaigns />}
      {tab === "create" && (
        <CreateCampaign
          form={form}
          setForm={setForm}
          assetFile={assetFile}
          setAssetFile={setAssetFile}
          createStep={createStep}
          setCreateStep={setCreateStep}
          paidSuccess={paidSuccess}
          setPaidSuccess={setPaidSuccess}
          togglePlatform={togglePlatform}
          cpmNum={cpmNum}
          budgetNum={budgetNum}
          viewCeiling={viewCeiling}
          onViewCampaigns={setTab}
        />
      )}
      {tab === "billing" && <FunderBilling />}
    </DashboardShell>
  );
}
