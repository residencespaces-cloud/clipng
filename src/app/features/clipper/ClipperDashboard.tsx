"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BarChart2, Film, Globe, Settings, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/app/components/shared/DashboardShell";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";
import type { Campaign, ClipperTab, EarningsSummary, MyClip } from "@/app/types";
import { validatePublicPostUrl } from "@/app/lib/submission-proof";
import { ClipperCampaigns } from "./ClipperCampaigns";
import { ClipperClips } from "./ClipperClips";
import { ClipperEarnings } from "./ClipperEarnings";
import { ClipperOverview } from "./ClipperOverview";
import { ClipperSettings } from "./ClipperSettings";

export function ClipperDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<ClipperTab>("overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clips, setClips] = useState<MyClip[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState("");
  const [joinedCampaign, setJoinedCampaign] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState("");
  const [clipPlatform, setClipPlatform] = useState("TikTok");
  const [submitted, setSubmitted] = useState(false);
  const [joinCodes, setJoinCodes] = useState<Record<string, string>>({});
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [joining, setJoining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refreshClips = useCallback(async () => {
    try {
      const [earnings, mine] = await Promise.all([
        api.submissions.earnings(),
        api.submissions.mine(),
      ]);
      setSummary(earnings);
      setClips(mine);
      setEarningsError("");
    } catch (e) {
      setEarningsError(e instanceof Error ? e.message : "Failed to load earnings");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClips();
    api.campaigns.live()
      .then(setCampaigns)
      .catch(() => toast.error("Could not load campaigns"))
      .finally(() => setCampaignsLoading(false));
  }, [refreshClips]);

  const sidebarItems: { key: ClipperTab; label: string; icon: ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
    { key: "campaigns", label: "Browse Campaigns", icon: <Globe size={16} /> },
    { key: "clips", label: "My Clips", icon: <Film size={16} /> },
    { key: "earnings", label: "Earnings", icon: <Wallet size={16} /> },
    { key: "settings", label: "Settings", icon: <Settings size={16} /> },
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
    >
      {tab === "overview" && (
        <ClipperOverview onViewAll={setTab} clips={clips} summary={summary} loading={dataLoading} />
      )}
      {tab === "campaigns" && (
        <ClipperCampaigns
          campaigns={campaigns}
          loading={campaignsLoading}
          joinedCampaign={joinedCampaign}
          clipUrl={clipUrl}
          clipPlatform={clipPlatform}
          submitted={submitted}
          joining={joining}
          submitting={submitting}
          verificationCode={
            joinedCampaign === null ? "" : joinCodes[joinedCampaign] ?? ""
          }
          codeConfirmed={codeConfirmed}
          submissionError={submissionError}
          onJoin={async (id) => {
            setJoining(true);
            try {
              const { verificationCode } = await api.campaigns.join(id);
              setJoinCodes((codes) => ({ ...codes, [id]: verificationCode }));
              setJoinedCampaign(id);
              setSubmitted(false);
              setClipUrl("");
              setCodeConfirmed(false);
              setSubmissionError("");
              toast.success("Joined campaign");
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Could not join campaign";
              setSubmissionError(msg);
              toast.error(msg);
            } finally {
              setJoining(false);
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
            setSubmitting(true);
            try {
              await api.submissions.create({
                campaignId: joinedCampaign,
                platform: clipPlatform,
                postUrl: clipUrl,
                codeConfirmed,
              });
              setSubmissionError("");
              setSubmitted(true);
              toast.success("Clip submitted for review");
              await refreshClips();
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Submission failed";
              setSubmissionError(msg);
              toast.error(msg);
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
      {tab === "clips" && <ClipperClips clips={clips} loading={dataLoading} />}
      {tab === "earnings" && (
        <ClipperEarnings
          summary={summary}
          history={clips.filter((c) => c.earnings > 0)}
          loading={dataLoading}
          error={earningsError}
          onRetry={refreshClips}
        />
      )}
      {tab === "settings" && <ClipperSettings />}
    </DashboardShell>
  );
}
