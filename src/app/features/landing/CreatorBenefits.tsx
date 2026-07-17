import Link from "next/link";
import { ArrowUpRight, Podcast, Target, TrendingUp } from "lucide-react";

export function CreatorBenefits() {
  return (
    <section id="benefits" className="py-20 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div>
            <p className="text-accent text-xs font-mono uppercase tracking-widest mb-2">For creators, streamers & brands</p>
            <h2 className="text-5xl font-black uppercase leading-none mb-5" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
              Make your content<br />
              <span className="text-primary">travel further.</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Turn one podcast, stream, music video, or campaign into dozens of short-form moments—shared by creators who already understand the culture.
            </p>
            <Link
              href="/signup?role=funder"
              className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-bold rounded hover:bg-accent/90 transition-all"
            >
              Grow your reach <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp size={20} />,
                title: "Increase virality",
                body: "Give every strong moment more chances to find its audience.",
              },
              {
                icon: <Podcast size={20} />,
                title: "More from every stream",
                body: "Turn long-form podcasts, VODs, and live streams into shareable short clips.",
              },
              {
                icon: <Target size={20} />,
                title: "Reach new audiences",
                body: "Distribute through real creators across TikTok, Reels, and Shorts.",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-5">
                  {benefit.icon}
                </div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
