"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/app/lib/api/client";
import type { CreateCampaignForm, CreateStep } from "@/app/types";

const RULE_TEMPLATES: {
  key: string;
  label: string;
  apply: Partial<CreateCampaignForm>;
}[] = [
  {
    key: "music",
    label: "Music drop",
    apply: {
      requiredCaption: "#KudiClip",
      minClipSeconds: "15",
      maxClipSeconds: "60",
      maxClipsPerClipper: "5",
      rulesDo: "Keep original audio\nStart with a strong hook in the first 3 seconds\nShow the artist or key lyric moment\nUse vertical 9:16",
      rulesDont: "No sped-up/slowed mashups that break the song\nNo unrelated gameplay overlays\nNo spam reposts of the full video",
      rulesNotes: "Include your unique campaign code in the caption along with any required hashtags.",
    },
  },
  {
    key: "skit",
    label: "Skit / comedy",
    apply: {
      requiredCaption: "#KudiClip",
      minClipSeconds: "10",
      maxClipSeconds: "45",
      maxClipsPerClipper: "5",
      rulesDo: "Lead with the punchline or reaction\nKeep faces and timing clear\nAdd light on-screen text if it helps the joke",
      rulesDont: "No stolen reaction clips from other accounts\nNo NSFW edits\nNo watermark spam covering the skit",
      rulesNotes: "Include your unique campaign code in the caption.",
    },
  },
  {
    key: "brand",
    label: "Brand / product",
    apply: {
      requiredCaption: "#ad #KudiClip",
      minClipSeconds: "15",
      maxClipSeconds: "60",
      maxClipsPerClipper: "3",
      rulesDo: "Show the product clearly\nMention the brand in caption\nKeep tone positive and on-brief",
      rulesDont: "No competitor mentions\nNo misleading claims\nNo low-light unreadable product shots",
      rulesNotes: "Disclose the partnership if required by the platform. Include your unique campaign code.",
    },
  },
];

export function CreateCampaignStep1({
  form,
  setForm,
  togglePlatform,
  setCreateStep,
}: {
  form: CreateCampaignForm;
  setForm: Dispatch<SetStateAction<CreateCampaignForm>>;
  togglePlatform: (p: string) => void;
  setCreateStep: (step: CreateStep) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const hasRules =
    form.requiredCaption.trim() ||
    form.rulesDo.trim() ||
    form.rulesDont.trim() ||
    form.rulesNotes.trim() ||
    form.minClipSeconds.trim() ||
    form.maxClipSeconds.trim();

  const canContinue =
    form.name.trim() &&
    form.description.trim() &&
    form.assetUrl.trim() &&
    form.imageUrl.trim() &&
    form.platforms.length > 0 &&
    hasRules &&
    !uploading;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploads.thumbnail(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Thumbnail uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearThumbnail = () => {
    setForm((f) => ({ ...f, imageUrl: "" }));
  };

  const applyTemplate = (key: string) => {
    const template = RULE_TEMPLATES.find((t) => t.key === key);
    if (!template) return;
    setForm((f) => ({ ...f, ...template.apply }));
    toast.success(`Applied “${template.label}” rules — edit as needed`);
  };

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
              { key: "video" as const, label: "Single Video", description: "Music video, skit or ad" },
              { key: "vod" as const, label: "Livestream VOD", description: "Long-form stream recording" },
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
          <label className="text-xs text-muted-foreground block mb-1.5">Source Video URL</label>
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
            Campaign Thumbnail <span className="text-red-400">*</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {form.imageUrl ? (
            <div className="relative rounded-lg border border-border overflow-hidden bg-secondary/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="Campaign thumbnail" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={clearThumbnail}
                className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white hover:bg-black/80"
                aria-label="Remove thumbnail"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 rounded-lg border border-dashed border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 size={22} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Uploading…</span>
                </>
              ) : (
                <>
                  <ImagePlus size={22} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Upload thumbnail</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF · max 2MB</span>
                </>
              )}
            </button>
          )}
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
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            Campaign brief <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="What is this campaign about? Who is it for? What should a great clip feel like?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
          />
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold">Creator rules</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clippers and admins will see these when joining and reviewing.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RULE_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => applyTemplate(t.key)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] border border-border rounded hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Sparkles size={10} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Required caption / hashtags</label>
            <input
              type="text"
              placeholder="e.g. #CityBoys #KudiClip @artist"
              value={form.requiredCaption}
              onChange={(e) => setForm((f) => ({ ...f, requiredCaption: e.target.value }))}
              className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Unique campaign codes are always required in addition to this.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Min length (sec)</label>
              <input
                type="number"
                min={1}
                placeholder="15"
                value={form.minClipSeconds}
                onChange={(e) => setForm((f) => ({ ...f, minClipSeconds: e.target.value }))}
                className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Max length (sec)</label>
              <input
                type="number"
                min={1}
                placeholder="60"
                value={form.maxClipSeconds}
                onChange={(e) => setForm((f) => ({ ...f, maxClipSeconds: e.target.value }))}
                className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Max clips / clipper</label>
              <input
                type="number"
                min={1}
                placeholder="Unlimited"
                value={form.maxClipsPerClipper}
                onChange={(e) => setForm((f) => ({ ...f, maxClipsPerClipper: e.target.value }))}
                className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Do (one per line)</label>
              <textarea
                placeholder={"Keep original audio\nStart with a hook"}
                value={form.rulesDo}
                onChange={(e) => setForm((f) => ({ ...f, rulesDo: e.target.value }))}
                rows={4}
                className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Don&apos;t (one per line)</label>
              <textarea
                placeholder={"No full-video reposts\nNo unrelated overlays"}
                value={form.rulesDont}
                onChange={(e) => setForm((f) => ({ ...f, rulesDont: e.target.value }))}
                rows={4}
                className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Extra rule notes</label>
            <textarea
              placeholder="Anything else admins should enforce when reviewing..."
              value={form.rulesNotes}
              onChange={(e) => setForm((f) => ({ ...f, rulesNotes: e.target.value }))}
              rows={2}
              className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-2">Allowed Platforms</label>
          <div className="flex gap-2">
            {["TikTok", "Instagram", "YouTube"].map((p) => (
              <button
                key={p}
                type="button"
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
      <button
        onClick={() => setCreateStep(2)}
        disabled={!canContinue}
        className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all disabled:opacity-40"
      >
        Continue to Budget →
      </button>
    </>
  );
}
