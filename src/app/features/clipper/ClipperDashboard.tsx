"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BarChart2, Film, Globe, Wallet } from "lucide-react";
import { DashboardShell } from "@/app/components/shared/DashboardShell";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";
import type { Campaign, ClipperTab } from "@/app/types";
import { validatePublicPostUrl } from "@/app/lib/submission-proof";
import { ClipperCampaigns } from "./ClipperCampaigns";
import { ClipperClips } from "./ClipperClips";
import { ClipperEarnings } from "./ClipperEarnings";
import { ClipperOverview } from "./ClipperOverview";

export function ClipperDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<ClipperTab>("overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [joinedCampaign, setJoinedCampaign] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState("");
  const [clipPlatform, setClipPlatform] = useState("TikTok");
  const [submitted, setSubmitted] = useState(false);
  const [joinCodes, setJoinCodes] = useState<Record<string, string>>({});
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.campaigns.live().then(setCampaigns).catch(() => setCampaigns([]));
  }, []);

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
      user={{ name: user?.name ?? "Clipper", roleLabel: "Clipper", accent: "primary" }}
      sidebarOpen={sidebarOpen}
      onSidebarOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
      onTab={(key) => { setTab(key); setSidebarOpen(false); }}
      showSettings
    >
      {tab === "overview" && <ClipperOverview onViewAll={setTab} />}
      {tab === "campaigns" && (
        <ClipperCampaigns
          campaigns={campaigns}
          joinedCampaign={joinedCampaign}
          clipUrl={clipUrl}
          clipPlatform={clipPlatform}
          submitted={submitted}
          verificationCode={
            joinedCampaign === null ? "" : joinCodes[joinedCampaign] ?? ""
          }
          codeConfirmed={codeConfirmed}
          submissionError={submissionError}
          onJoin={async (id) => {
            try {
              const { verificationCode } = await api.campaigns.join(id);
              setJoinCodes((codes) => ({ ...codes, [id]: verificationCode }));
              setJoinedCampaign(id);
              setSubmitted(false);
              setClipUrl("");
              setCodeConfirmed(false);
              setSubmissionError("");
            } catch (err) {
              setSubmissionError(err instanceof Error ? err.message : "Could not join campaign");
            }
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
          onSubmit={async () => {
            if (!joinedCampaign) return;
            if (!codeConfirmed) {
              setSubmissionError("Confirm that your unique code is visible in the post caption.");
              return;
            }
            const error = validatePublicPostUrl(clipUrl, clipPlatform);
            if (error) {
              setSubmissionError(error);
              return;
            }
            try {
              await api.submissions.create({
                campaignId: joinedCampaign,
                platform: clipPlatform,
                postUrl: clipUrl,
                codeConfirmed,
              });
              setSubmissionError("");
              setSubmitted(true);
            } catch (err) {
              setSubmissionError(err instanceof Error ? err.message : "Submission failed");
            }
          }}
        />
      )}
      {tab === "clips" && <ClipperClips />}
      {tab === "earnings" && <ClipperEarnings />}
    </DashboardShell>
  );
}
