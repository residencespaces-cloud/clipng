"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/app/lib/api/client";
import { emitNavigationStart } from "@/app/lib/page-transition";
import { useAuth } from "@/app/lib/auth/auth-context";
import { PageLoader } from "@/app/components/shared/PageLoader";
import { BrandLogo } from "@/app/components/shared/BrandLogo";
import type {
  AdminTab,
  ApprovedClip,
  AwaitingViewsClip,
  PendingClip,
} from "@/app/types";
import { AdminPayouts } from "./AdminPayouts";
import { AllCampaigns } from "./AllCampaigns";
import { ApprovedClips } from "./ApprovedClips";
import { AuditLogs } from "./AuditLogs";
import { PendingReview } from "./PendingReview";
import { ViewVerification } from "./ViewVerification";

const FEE_PERCENT = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT ?? 20);

export function AdminPanel() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>("pending");
  const [pendingClips, setPendingClips] = useState<PendingClip[]>([]);
  const [awaitingViews, setAwaitingViews] = useState<AwaitingViewsClip[]>([]);
  const [readyForPayout, setReadyForPayout] = useState<ApprovedClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [pending, awaiting, ready] = await Promise.all([
        api.admin.pending() as Promise<PendingClip[]>,
        api.admin.awaitingViews() as Promise<AwaitingViewsClip[]>,
        api.admin.readyForPayout() as Promise<ApprovedClip[]>,
      ]);
      setPendingClips(pending);
      setAwaitingViews(awaiting.map((c) => ({ ...c, viewCount: c.viewCount ?? "" })));
      setReadyForPayout(ready);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approveSubmission = async (id: string) => {
    setActionId(id);
    try {
      await api.admin.approve(id, true);
      toast.success("Clip approved");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionId(null);
    }
  };

  const rejectSubmission = async (id: string, reason?: string) => {
    setActionId(id);
    try {
      await api.admin.reject(id, reason);
      toast.success("Clip rejected");
      setRejectingId(null);
      setRejectReason("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  const confirmViews = async (id: string) => {
    const clip = awaitingViews.find((c) => c.id === id);
    const views = parseInt(clip?.viewCount ?? "") || 0;
    if (!clip || views <= 0) return;
    setActionId(id);
    try {
      await api.admin.verifyViews(id, views);
      toast.success("Views confirmed");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setActionId(null);
    }
  };

  const triggerPayout = async (id: string) => {
    setActionId(id);
    try {
      await api.admin.triggerPayout(id);
      toast.success("Payout triggered");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payout failed");
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = async () => {
    emitNavigationStart();
    await logout();
  };

  const adminTabs: { key: AdminTab; label: string }[] = [
    { key: "pending", label: "Pending Review" },
    { key: "view-verify", label: "View Verification" },
    { key: "approved", label: "Ready for Payout" },
    { key: "all-campaigns", label: "All Campaigns" },
    { key: "payouts", label: "Payouts" },
    { key: "audit-logs", label: "Audit Logs" },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" href="/" />
          <span className="text-xs font-mono bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{pendingClips.length} pending</span>
            <span className="text-border">·</span>
            <span>{awaitingViews.length} awaiting views</span>
          </div>
          <button onClick={refresh} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex border-b border-border px-6 overflow-x-auto">
        {adminTabs.map((t) => {
          const count =
            t.key === "pending"
              ? pendingClips.length
              : t.key === "view-verify"
                ? awaitingViews.length
                : t.key === "approved"
                  ? readyForPayout.filter((c) => c.payoutStatus === "Pending").length
                  : 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
              {count > 0 && (
                <span className="ml-2 text-xs bg-primary/15 text-primary border border-primary/20 rounded-full px-1.5 py-0.5">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {tab === "pending" && (
          <PendingReview
            clips={pendingClips}
            actionId={actionId}
            rejectingId={rejectingId}
            rejectReason={rejectReason}
            onApprove={approveSubmission}
            onReject={rejectSubmission}
            onStartReject={(id) => setRejectingId(id)}
            onCancelReject={() => { setRejectingId(null); setRejectReason(""); }}
            onRejectReasonChange={setRejectReason}
            onApproveAll={async () => {
              const verified = pendingClips.filter((c) => c.codeVerified);
              for (const c of verified) {
                await approveSubmission(c.id);
              }
            }}
            onCodeVerifiedChange={(id, verified) =>
              setPendingClips((prev) =>
                prev.map((clip) =>
                  clip.id === id ? { ...clip, codeVerified: verified } : clip,
                ),
              )
            }
          />
        )}
        {tab === "view-verify" && (
          <ViewVerification
            clips={awaitingViews}
            actionId={actionId}
            onConfirmViews={confirmViews}
            onViewCountChange={(id, value) =>
              setAwaitingViews((prev) =>
                prev.map((cl) => (cl.id === id ? { ...cl, viewCount: value } : cl)),
              )
            }
          />
        )}
        {tab === "approved" && (
          <ApprovedClips
            approvedClips={readyForPayout}
            actionId={actionId}
            feePercent={FEE_PERCENT}
            onTriggerPayout={triggerPayout}
          />
        )}
        {tab === "all-campaigns" && <AllCampaigns />}
        {tab === "payouts" && <AdminPayouts />}
        {tab === "audit-logs" && <AuditLogs />}
      </div>
    </div>
  );
}
