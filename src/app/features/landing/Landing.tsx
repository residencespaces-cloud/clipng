import { CreatorBenefits } from "./CreatorBenefits";
import { HowItWorks } from "./HowItWorks";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { CampaignsSection } from "./CampaignsSection";
import { MoneyMath } from "./MoneyMath";
import type { Campaign } from "@/app/types";

export function Landing({
  campaigns = [],
  campaignCount,
}: {
  campaigns?: Campaign[];
  campaignCount?: number;
}) {
  const featured = campaigns[0];
  const grid = campaigns.slice(1, 5);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      <LandingNav />
      <main>
        <LandingHero featured={featured} campaignCount={campaignCount ?? campaigns.length} />
        <HowItWorks />
        <CreatorBenefits />
        <CampaignsSection campaigns={grid} />
        <MoneyMath />
      </main>
      <LandingFooter />
    </div>
  );
}
