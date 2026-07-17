"use client";

import { useState, type ReactNode } from "react";
import { BarChart2, Film, Globe, Wallet } from "lucide-react";
import { DashboardShell } from "@/app/components/shared/DashboardShell";
import {
  createVerificationCode,
  validatePublicPostUrl,
} from "@/app/lib/submission-proof";
import type { ClipperTab } from "@/app/types";
import { ClipperCampaigns } from "./ClipperCampaigns";
import { ClipperClips } from "./ClipperClips";
import { ClipperEarnings } from "./ClipperEarnings";
import { ClipperOverview } from "./ClipperOverview";

export function ClipperDashboard() {
  const [tab, setTab] = useState<ClipperTab>("overview");
  const [joinedCampaign, setJoinedCampaign] = useState<number | null>(null);
  const [clipUrl, setClipUrl] = useState("");
  const [clipPlatform, setClipPlatform] = useState("TikTok");
  const [submitted, setSubmitted] = useState(false);
  const [joinCodes, setJoinCodes] = useState<Record<number, string>>({});
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: { key: ClipperTab; label: string; icon: ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
    { key: "campaigns", label: "Browse Campaigns", icon: <Globe size={16} /> },
    { key: "clips", label: "My Clips", icon: <Film size={16} /> },
    { key: "earnings", label: "Earnings", icon: <Wallet size={16} /> },
  ];

  return (
    <DashboardShell
      tab={tab}
      items={sidebarItems}
      user={{ name: "Adaeze Obi", roleLabel: "Clipper", accent: "primary" }}
      sidebarOpen={sidebarOpen}
      onSidebarOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
      onTab={(key) => { setTab(key); setSidebarOpen(false); }}
      showSettings
    >
      {tab === "overview" && <ClipperOverview onViewAll={setTab} />}
      {tab === "campaigns" && (
        <ClipperCampaigns
          joinedCampaign={joinedCampaign}
          clipUrl={clipUrl}
          clipPlatform={clipPlatform}
          submitted={submitted}
          verificationCode={
            joinedCampaign === null ? "" : joinCodes[joinedCampaign] ?? ""
          }
          codeConfirmed={codeConfirmed}
          submissionError={submissionError}
          onJoin={(id) => {
            setJoinCodes((codes) => ({
              ...codes,
              [id]: codes[id] ?? createVerificationCode(id),
            }));
            setJoinedCampaign(id);
            setSubmitted(false);
            setClipUrl("");
            setCodeConfirmed(false);
            setSubmissionError("");
          }}
          onCloseJoin={() => setJoinedCampaign(null)}
          onClipUrl={(value) => {
            setClipUrl(value);
            setSubmissionError("");
          }}
          onClipPlatform={(value) => {
            setClipPlatform(value);
            setClipUrl("");
            setSubmissionError("");
          }}
          onCodeConfirmed={setCodeConfirmed}
          onSubmit={() => {
            if (!codeConfirmed) {
              setSubmissionError(
                "Confirm that your unique code is visible in the post caption.",
              );
              return;
            }
            const error = validatePublicPostUrl(clipUrl, clipPlatform);
            if (error) {
              setSubmissionError(error);
              return;
            }
            setSubmissionError("");
            setSubmitted(true);
          }}
        />
      )}
      {tab === "clips" && <ClipperClips />}
      {tab === "earnings" && <ClipperEarnings />}
    </DashboardShell>
  );
}
