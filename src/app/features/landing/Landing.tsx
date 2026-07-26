import { CreatorBenefits } from "./CreatorBenefits";
import { HowItWorks } from "./HowItWorks";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { LiveCampaigns } from "./LiveCampaigns";
import { MoneyMath } from "./MoneyMath";
import type { Campaign } from "@/app/types";

export function Landing({ campaigns = [] }: { campaigns?: Campaign[] }) {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      <LandingNav />
      <main>
        <LandingHero campaigns={campaigns} />
        <HowItWorks />
        <CreatorBenefits />
        <LiveCampaigns campaigns={campaigns} />
        <MoneyMath />
      </main>
      <LandingFooter />
    </div>
  );
}
