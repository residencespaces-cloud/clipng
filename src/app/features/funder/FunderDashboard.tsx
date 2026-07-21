"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart2, Film, Settings, Upload, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/app/components/shared/DashboardShell";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";
import type { Campaign, CreateCampaignForm, CreateStep, FunderTab, WalletTransaction } from "@/app/types";
import { CreateCampaign } from "./CreateCampaign";
import { FunderBilling } from "./FunderBilling";
import { FunderCampaigns } from "./FunderCampaigns";
import { FunderOverview } from "./FunderOverview";
import { FunderSettings } from "./FunderSettings";

const emptyForm = (): CreateCampaignForm => ({
  name: "",
  assetUrl: "",
  imageUrl: "",
  sourceType: "video",
  bestMoments: "",
  description: "",
  platforms: ["TikTok"],
  cpm: "",
  budget: "",
  start: "",
  end: "",
});

export function FunderDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<FunderTab>("overview");
  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState<CreateCampaignForm>(emptyForm());
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);

  const cpmNum = parseFloat(form.cpm) || 0;
  const budgetNum = parseFloat(form.budget) || 0;
  const viewCeiling = cpmNum && budgetNum ? Math.round((budgetNum / cpmNum) * 1000) : 0;

  const refreshWallet = useCallback(async () => {
    try {
      const [bal, txs] = await Promise.all([
        api.wallet.balance(),
        api.wallet.transactions(),
      ]);
      setWalletBalance(bal.balance);
      setEscrowBalance(bal.escrow);
      setTransactions(txs);
    } catch {
      toast.error("Could not load wallet");
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const refreshCampaigns = useCallback(async () => {
    try {
      const data = await api.campaigns.my();
      setCampaigns(data);
    } catch {
      toast.error("Could not load campaigns");
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
    refreshCampaigns();
  }, [refreshWallet, refreshCampaigns]);

  useEffect(() => {
    if (searchParams.get("topup") === "success") {
      toast.success("Payment received — wallet updating shortly");
      refreshWallet();
    }
  }, [searchParams, refreshWallet]);

  const sidebarItems: { key: FunderTab; label: string; icon: ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
    { key: "campaigns", label: "My Campaigns", icon: <Film size={16} /> },
    { key: "create", label: "Create Campaign", icon: <Upload size={16} /> },
    { key: "billing", label: "Billing", icon: <Wallet size={16} /> },
    { key: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  const launchCampaign = async () => {
    if (budgetNum <= 0 || walletBalance < budgetNum) return;
    setLaunching(true);
    try {
      await api.campaigns.create({
        name: form.name,
        sourceType: form.sourceType,
        assetUrl: form.assetUrl || undefined,
        imageUrl: form.imageUrl || undefined,
        bestMoments: form.bestMoments || undefined,
        description: form.description,
        platforms: form.platforms,
        cpm: cpmNum,
        budget: budgetNum,
        start: form.start || undefined,
        end: form.end || undefined,
      });
      await Promise.all([refreshWallet(), refreshCampaigns()]);
      setLaunchSuccess(true);
      toast.success("Campaign launched");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Launch failed");
    } finally {
      setLaunching(false);
    }
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
      {tab === "overview" && (
        <FunderOverview
          onTab={setTab}
          walletBalance={walletBalance}
          campaigns={campaigns}
          loading={campaignsLoading || walletLoading}
        />
      )}
      {tab === "campaigns" && <FunderCampaigns campaigns={campaigns} loading={campaignsLoading} />}
      {tab === "create" && (
        <CreateCampaign
          form={form}
          setForm={setForm}
          createStep={createStep}
          setCreateStep={setCreateStep}
          launchSuccess={launchSuccess}
          setLaunchSuccess={setLaunchSuccess}
          togglePlatform={togglePlatform}
          cpmNum={cpmNum}
          budgetNum={budgetNum}
          viewCeiling={viewCeiling}
          walletBalance={walletBalance}
          launching={launching}
          onLaunch={launchCampaign}
          onViewCampaigns={() => {
            setTab("campaigns");
            setLaunchSuccess(false);
            setCreateStep(1);
            setForm(emptyForm());
          }}
          onFundWallet={setTab}
        />
      )}
      {tab === "billing" && (
        <FunderBilling
          balance={walletBalance}
          escrow={escrowBalance}
          transactions={transactions}
          loading={walletLoading}
          onFundWallet={async (amount) => {
            const res = await api.wallet.initiateTopUp(amount);
            window.location.href = res.authorizationUrl;
          }}
        />
      )}
      {tab === "settings" && <FunderSettings />}
    </DashboardShell>
  );
}
