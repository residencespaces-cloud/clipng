import type { Dispatch, SetStateAction } from "react";
import { Film, Upload } from "lucide-react";
import type { CreateCampaignForm, CreateStep, SourceType } from "@/app/types";

export function CreateCampaignStep1({
  form,
  assetFile,
  setForm,
  setAssetFile,
  togglePlatform,
  setCreateStep,
}: {
  form: CreateCampaignForm;
  assetFile: File | null;
  setForm: Dispatch<SetStateAction<CreateCampaignForm>>;
  setAssetFile: (file: File | null) => void;
  togglePlatform: (p: string) => void;
  setCreateStep: (step: CreateStep) => void;
}) {
  return (
    <>
      <h3 className="font-semibold">Campaign Details</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Campaign Name</label>
          <input
            type="text"
            placeholder="e.g. Burna Boy — City Boys Drop"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Source Type</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "video" as SourceType, label: "Single Video", description: "Music video, skit or ad" },
              { key: "vod" as SourceType, label: "Livestream VOD", description: "Long-form stream recording" },
            ].map((source) => (
              <button
                key={source.key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, sourceType: source.key }))}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  form.sourceType === source.key
                    ? "bg-primary/10 border-primary/40"
                    : "bg-secondary/40 border-border hover:border-primary/20"
                }`}
              >
                <span className={`text-sm font-semibold ${form.sourceType === source.key ? "text-primary" : ""}`}>
                  {source.label}
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">{source.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Source Video / Asset</label>
          <label className="flex flex-col items-center justify-center min-h-28 border border-dashed border-border rounded-lg bg-secondary/30 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => setAssetFile(e.target.files?.[0] ?? null)}
            />
            {assetFile ? (
              <div className="flex items-center gap-3 px-4 text-center">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Film size={17} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">{assetFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(assetFile.size / (1024 * 1024)).toFixed(1)} MB · Click to replace
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload size={20} className="text-primary mb-2" />
                <p className="text-sm font-medium">Upload source video</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV or WebM</p>
              </>
            )}
          </label>
          <div className="flex items-center gap-3 my-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase">or use a link</span>
            <div className="h-px bg-border flex-1" />
          </div>
          <input
            type="url"
            placeholder={form.sourceType === "vod" ? "YouTube or Twitch VOD URL" : "YouTube, Drive or direct video URL"}
            value={form.assetUrl}
            onChange={(e) => setForm((f) => ({ ...f, assetUrl: e.target.value }))}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            Best Moments / Timestamp Notes
            <span className="text-muted-foreground/60 ml-1">(optional)</span>
          </label>
          <textarea
            placeholder={
              form.sourceType === "vod"
                ? "e.g. Best reactions are between 1:15:00–2:30:00. Big win at 1:42:18."
                : "Point clippers to the strongest scenes, hooks, or moments..."
            }
            value={form.bestMoments}
            onChange={(e) => setForm((f) => ({ ...f, bestMoments: e.target.value }))}
            rows={3}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
          />
          {form.sourceType === "vod" && (
            <p className="text-xs text-accent mt-1.5">
              Timestamps help clippers find standout moments in long streams faster.
            </p>
          )}
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Brief / Rules for Clippers</label>
          <textarea
            placeholder="Required caption, minimum clip length, creative guidelines..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Allowed Platforms</label>
          <div className="flex gap-2">
            {["TikTok", "Instagram", "YouTube"].map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-4 py-1.5 text-xs rounded border transition-colors ${form.platforms.includes(p) ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Start Date</label>
            <input type="date" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">End Date</label>
            <input type="date" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
      </div>
      <button onClick={() => setCreateStep(2)} className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all">
        Continue to Budget →
      </button>
    </>
  );
}
