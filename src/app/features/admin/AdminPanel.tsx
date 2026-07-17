"use client";

import { useState } from "react";
import { PENDING_CLIPS } from "@/app/data/mock-data";
import type { AdminTab, ApprovedClip, PendingClip } from "@/app/types";
import { AdminPayouts } from "./AdminPayouts";
import { AllCampaigns } from "./AllCampaigns";
import { ApprovedClips } from "./ApprovedClips";
import { PendingReview } from "./PendingReview";

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("pending");
  const [clips, setClips] = useState<PendingClip[]>(
    PENDING_CLIPS.map((c) => ({
      ...c,
      viewCount: "",
      codeVerified: false,
    })),
  );
  const [approvedClips, setApprovedClips] = useState<ApprovedClip[]>([]);
  const [payoutStatus, setPayoutStatus] = useState<Record<number, string>>({});

  const approve = (id: number) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip?.codeVerified) return;
    const viewsVerified = parseInt(clip.viewCount) || 0;
    setApprovedClips((prev) => [...prev, { ...clip, viewsVerified }]);
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const reject = (id: number) => setClips((prev) => prev.filter((c) => c.id !== id));
  const triggerPayout = (id: number) => setPayoutStatus((prev) => ({ ...prev, [id]: "Triggered" }));

  const adminTabs: { key: AdminTab; label: string }[] = [
    { key: "pending", label: "Pending Review" },
    { key: "approved", label: "Approved Clips" },
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
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">{clips.length} pending</span>
        </div>
      </header>

      <div className="flex border-b border-border px-6 overflow-x-auto">
        {adminTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
            {t.key === "pending" && clips.length > 0 && (
              <span className="ml-2 text-xs bg-primary/15 text-primary border border-primary/20 rounded-full px-1.5 py-0.5">{clips.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "pending" && (
          <PendingReview
            clips={clips}
            onApprove={approve}
            onReject={reject}
            onApproveAll={() =>
              clips.filter((c) => c.codeVerified).forEach((c) => approve(c.id))
            }
            onViewCountChange={(id, value) =>
              setClips((prev) => prev.map((cl) => (cl.id === id ? { ...cl, viewCount: value } : cl)))
            }
            onCodeVerifiedChange={(id, verified) =>
              setClips((prev) =>
                prev.map((clip) =>
                  clip.id === id ? { ...clip, codeVerified: verified } : clip,
                ),
              )
            }
          />
        )}
        {tab === "approved" && (
          <ApprovedClips
            approvedClips={approvedClips}
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
