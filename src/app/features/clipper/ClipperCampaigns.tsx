import {
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Play,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { BudgetBar } from "@/app/components/shared/BudgetBar";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { CAMPAIGNS } from "@/app/data/mock-data";
import { clipperCpm, fmt } from "@/app/lib/format";

export function ClipperCampaigns({
  joinedCampaign,
  clipUrl,
  clipPlatform,
  submitted,
  verificationCode,
  codeConfirmed,
  submissionError,
  onJoin,
  onCloseJoin,
  onClipUrl,
  onClipPlatform,
  onCodeConfirmed,
  onSubmit,
}: {
  joinedCampaign: number | null;
  clipUrl: string;
  clipPlatform: string;
  submitted: boolean;
  verificationCode: string;
  codeConfirmed: boolean;
  submissionError: string;
  onJoin: (id: number) => void;
  onCloseJoin: () => void;
  onClipUrl: (v: string) => void;
  onClipPlatform: (v: string) => void;
  onCodeConfirmed: (v: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {CAMPAIGNS.map((c) => (
        <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="relative aspect-[16/7] rounded-lg overflow-hidden bg-secondary group">
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center">
              <Play size={13} fill="currentColor" />
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold leading-snug">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.funder}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-sm text-muted-foreground">{c.description}</p>
          <div className="flex gap-1 flex-wrap">
            {c.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Your CPM</p>
              <p className="font-mono font-bold text-primary text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(clipperCpm(c.cpm))}</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Budget left</p>
              <p className="font-mono font-bold text-accent text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)}</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Clips in</p>
              <p className="font-mono font-bold text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{c.clips}</p>
            </div>
          </div>
          <BudgetBar remaining={c.remaining} total={c.budget} />

          {joinedCampaign === c.id ? (
            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Submit your clip</p>
                <button onClick={onCloseJoin} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              <a href={c.asset} className="flex items-center gap-2 text-xs text-primary hover:underline">
                <Upload size={12} /> Download source asset
              </a>
              <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">
                      Your unique campaign code
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Include this exact code in your public post caption. Admin
                      will verify it before approving your clip.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-sm font-bold font-mono text-foreground bg-background/60 border border-border rounded px-2 py-1">
                        {verificationCode}
                      </code>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(verificationCode)
                        }
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Copy verification code"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <select
                  value={clipPlatform}
                  onChange={(e) => onClipPlatform(e.target.value)}
                  className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {c.platforms.map((p) => <option key={p}>{p}</option>)}
                </select>
                <input
                  type="url"
                  placeholder={`Paste your direct ${clipPlatform} post URL...`}
                  value={clipUrl}
                  onChange={(e) => onClipUrl(e.target.value)}
                  className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ExternalLink size={13} className="shrink-0 mt-0.5" />
                  Submit the live public post—not a profile, screenshot, download,
                  Drive link, or unpublished draft.
                </div>
                <label className="flex items-start gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codeConfirmed}
                    onChange={(e) => onCodeConfirmed(e.target.checked)}
                    className="mt-0.5 accent-primary"
                  />
                  <span>
                    I included <strong className="font-mono text-primary">{verificationCode}</strong>{" "}
                    in the post caption.
                  </span>
                </label>
                {submissionError && (
                  <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    {submissionError}
                  </div>
                )}
                {submitted ? (
                  <div className="text-sm text-primary py-2">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle size={14} /> Clip submitted! Pending review.
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-5">
                      Keep the post public and leave the code in its caption until
                      payout.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={onSubmit}
                    className="w-full py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all"
                  >
                    Submit Clip
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => onJoin(c.id)}
              className="w-full py-2.5 bg-primary/10 text-primary text-sm font-bold rounded hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20"
            >
              Join Campaign
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
