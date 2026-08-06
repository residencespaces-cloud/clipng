import type { Campaign, CampaignRules } from "@/app/types";

export function rulesFromCampaign(c: Partial<Campaign> | CampaignRules | null | undefined): CampaignRules {
  return {
    requiredCaption: c?.requiredCaption || "",
    minClipSeconds: c?.minClipSeconds ?? null,
    maxClipSeconds: c?.maxClipSeconds ?? null,
    maxClipsPerClipper: c?.maxClipsPerClipper ?? null,
    rulesDo: c?.rulesDo ?? [],
    rulesDont: c?.rulesDont ?? [],
    rulesNotes: c?.rulesNotes || "",
  };
}

export function hasCampaignRules(rules: CampaignRules) {
  return Boolean(
    rules.requiredCaption ||
      rules.minClipSeconds ||
      rules.maxClipSeconds ||
      rules.maxClipsPerClipper ||
      rules.rulesDo.length ||
      rules.rulesDont.length ||
      rules.rulesNotes,
  );
}

export function CampaignRulesPanel({
  rules,
  compact = false,
}: {
  rules: CampaignRules;
  compact?: boolean;
}) {
  if (!hasCampaignRules(rules)) {
    return (
      <p className={`text-muted-foreground ${compact ? "text-[11px]" : "text-xs"}`}>
        No structured creator rules set for this campaign.
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? "text-[11px]" : "text-xs"}`}>
      {rules.requiredCaption ? (
        <div>
          <p className="text-muted-foreground mb-0.5">Required caption</p>
          <code className="font-mono text-primary break-all">{rules.requiredCaption}</code>
        </div>
      ) : null}
      {(rules.minClipSeconds || rules.maxClipSeconds || rules.maxClipsPerClipper) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
          {(rules.minClipSeconds || rules.maxClipSeconds) && (
            <span>
              Length: {rules.minClipSeconds ?? "any"}–{rules.maxClipSeconds ?? "any"}s
            </span>
          )}
          {rules.maxClipsPerClipper ? <span>Max {rules.maxClipsPerClipper} clips / clipper</span> : null}
        </div>
      )}
      {rules.rulesDo.length > 0 && (
        <div>
          <p className="text-primary font-medium mb-0.5">Do</p>
          <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
            {rules.rulesDo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {rules.rulesDont.length > 0 && (
        <div>
          <p className="text-accent font-medium mb-0.5">Don&apos;t</p>
          <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
            {rules.rulesDont.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {rules.rulesNotes ? (
        <p className="text-muted-foreground leading-relaxed">{rules.rulesNotes}</p>
      ) : null}
    </div>
  );
}
