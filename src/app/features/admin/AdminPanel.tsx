"use client";

import { useState } from "react";
import { PENDING_CLIPS } from "@/app/data/mock-data";
import type { AdminTab, ApprovedClip, AwaitingViewsClip, PendingClip } from "@/app/types";
import { AdminPayouts } from "./AdminPayouts";
import { AllCampaigns } from "./AllCampaigns";
import { ApprovedClips } from "./ApprovedClips";
import { PendingReview } from "./PendingReview";
import { ViewVerification } from "./ViewVerification";

function todayLabel() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("pending");
  const [pendingClips, setPendingClips] = useState<PendingClip[]>(
    PENDING_CLIPS.map((c) => ({
      ...c,
      codeVerified: false,
    })),
  );
  const [awaitingViews, setAwaitingViews] = useState<AwaitingViewsClip[]>([]);
  const [readyForPayout, setReadyForPayout] = useState<ApprovedClip[]>([]);
  const [payoutStatus, setPayoutStatus] = useState<Record<number, string>>({});

  const approveSubmission = (id: number) => {
    const clip = pendingClips.find((c) => c.id === id);
    if (!clip?.codeVerified) return;
    setAwaitingViews((prev) => [
      ...prev,
      { ...clip, approvedDate: todayLabel(), viewCount: "" },
    ]);
    setPendingClips((prev) => prev.filter((c) => c.id !== id));
  };

  const rejectSubmission = (id: number) =>
    setPendingClips((prev) => prev.filter((c) => c.id !== id));

  const confirmViews = (id: number) => {
    const clip = awaitingViews.find((c) => c.id === id);
    const viewsVerified = parseInt(clip?.viewCount ?? "") || 0;
    if (!clip || viewsVerified <= 0) return;
    setReadyForPayout((prev) => [
      ...prev,
      { ...clip, viewsVerified, approvedDate: clip.approvedDate },
    ]);
    setAwaitingViews((prev) => prev.filter((c) => c.id !== id));
  };

  const triggerPayout = (id: number) =>
    setPayoutStatus((prev) => ({ ...prev, [id]: "Triggered" }));

  const adminTabs: { key: AdminTab; label: string }[] = [
    { key: "pending", label: "Pending Review" },
    { key: "view-verify", label: "View Verification" },
    { key: "approved", label: "Ready for Payout" },
    { key: "all-campaigns", label: "All Campaigns" },
    { key: "payouts", label: "Payouts" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <span className="text-xs font-mono bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded">ADMIN</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{pendingClips.length} pending</span>
          <span className="text-border">·</span>
          <span>{awaitingViews.length} awaiting views</span>
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
                  ? readyForPayout.filter((c) => (payoutStatus[c.id] ?? "Pending") === "Pending").length
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
            onApprove={approveSubmission}
            onReject={rejectSubmission}
            onApproveAll={() =>
              pendingClips.filter((c) => c.codeVerified).forEach((c) => approveSubmission(c.id))
            }
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
            payoutStatus={payoutStatus}
            onTriggerPayout={triggerPayout}
          />
        )}
        {tab === "all-campaigns" && <AllCampaigns />}
        {tab === "payouts" && <AdminPayouts />}
      </div>
    </div>
  );
}
