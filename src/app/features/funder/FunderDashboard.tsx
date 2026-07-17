"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BarChart2, Film, Upload, Wallet } from "lucide-react";
import { DashboardShell } from "@/app/components/shared/DashboardShell";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";
import type { CreateCampaignForm, CreateStep, FunderTab, WalletTransaction } from "@/app/types";
import { CreateCampaign } from "./CreateCampaign";
import { FunderBilling } from "./FunderBilling";
import { FunderCampaigns } from "./FunderCampaigns";
import { FunderOverview } from "./FunderOverview";

function formatTxDate() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function FunderDashboard() {
  const { user } = useAuth();
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
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const cpmNum = parseFloat(form.cpm) || 0;
  const budgetNum = parseFloat(form.budget) || 0;
  const viewCeiling = cpmNum && budgetNum ? Math.round((budgetNum / cpmNum) * 1000) : 0;

  const refreshWallet = async () => {
    try {
      const [bal, txs] = await Promise.all([
        api.wallet.balance(),
        api.wallet.transactions(),
      ]);
      setWalletBalance(bal.balance);
      setTransactions(txs);
    } catch {
      // fallback silent
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

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

  const fundWallet = async (amount: number) => {
    const res = await api.wallet.initiateTopUp(amount);
    // Demo: simulate successful Paystack webhook credit
    await refreshWallet();
    return res;
  };

  const launchCampaign = async () => {
    if (budgetNum <= 0 || walletBalance < budgetNum) return;
    await api.campaigns.create({
      name: form.name || "Untitled Campaign",
      sourceType: form.sourceType,
      assetUrl: form.assetUrl || undefined,
      bestMoments: form.bestMoments || undefined,
      description: form.description || form.name,
      platforms: form.platforms,
      cpm: cpmNum,
      budget: budgetNum,
      start: form.start || undefined,
      end: form.end || undefined,
    });
    await refreshWallet();
    setLaunchSuccess(true);
  };

  return (
    <DashboardShell
      tab={tab}
      items={sidebarItems}
      user={{ name: user?.name ?? "Funder", roleLabel: "Funder", accent: "accent" }}
      sidebarOpen={sidebarOpen}
      onSidebarOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
      onTab={(key) => { setTab(key); setSidebarOpen(false); }}
    >
      {tab === "overview" && <FunderOverview onTab={setTab} walletBalance={walletBalance} />}
      {tab === "campaigns" && <FunderCampaigns />}
      {tab === "create" && (
        <CreateCampaign
          form={form}
          setForm={setForm}
          assetFile={assetFile}
          setAssetFile={setAssetFile}
          createStep={createStep}
          setCreateStep={setCreateStep}
          launchSuccess={launchSuccess}
          setLaunchSuccess={setLaunchSuccess}
          togglePlatform={togglePlatform}
          cpmNum={cpmNum}
          budgetNum={budgetNum}
          viewCeiling={viewCeiling}
          walletBalance={walletBalance}
          onLaunch={launchCampaign}
          onViewCampaigns={setTab}
          onFundWallet={setTab}
        />
      )}
      {tab === "billing" && (
        <FunderBilling
          balance={walletBalance}
          transactions={transactions}
          onFundWallet={async (amount) => {
            await fundWallet(amount);
            await refreshWallet();
          }}
        />
      )}
    </DashboardShell>
  );
}
