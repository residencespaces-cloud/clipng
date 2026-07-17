import { DollarSign, Film, Shield, Zap } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">The loop</p>
          <h2 className="text-5xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            How It Works
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: <DollarSign size={24} />, num: "01", title: "Funder pays", body: "Artist or brand sets a CPM and total budget. Pays upfront via Paystack. Campaign goes live once payment clears." },
            { icon: <Film size={24} />, num: "02", title: "Clipper clips", body: "Download the source asset, edit your clip, post to TikTok, IG, or YouTube. Submit your public link." },
            { icon: <Shield size={24} />, num: "03", title: "Admin verifies", body: "Weekly manual review: quality check, view count recorded, suspicious velocity flagged. First-verified, first-paid." },
            { icon: <Zap size={24} />, num: "04", title: "Naira payout", body: "80% of CPM lands in your account via Paystack every week. ₦600 CPM → you earn ₦480 per 1k views." },
          ].map((s) => (
            <div key={s.num} className="relative bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group">
              <div className="absolute top-4 right-4 text-4xl font-black text-border" style={{ fontFamily: "'DM Mono', monospace" }}>{s.num}</div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                {s.icon}
              </div>
              <h3 className="font-bold mb-2 capitalize">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
