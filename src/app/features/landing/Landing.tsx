import { CreatorBenefits } from "./CreatorBenefits";
import { HowItWorks } from "./HowItWorks";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { LiveCampaigns } from "./LiveCampaigns";
import { MoneyMath } from "./MoneyMath";

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <LandingNav />
      <LandingHero />
      <HowItWorks />
      <CreatorBenefits />
      <LiveCampaigns />
      <MoneyMath />
      <LandingFooter />
    </div>
  );
}
