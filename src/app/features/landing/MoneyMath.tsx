import { Clock, Globe, Users, Wallet } from "lucide-react";

export function MoneyMath() {
  return (
    <section id="money" className="py-24 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Do the math</p>
            <h2 className="text-5xl font-black uppercase mb-6" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
              Real money.<br />Every week.
            </h2>
            <p className="text-muted-foreground mb-8">
              No follower minimum. No niche requirement. Your existing TikTok or Instagram account is enough.
            </p>
            {[
              { icon: <Globe size={16} />, text: "Any Nigerian TikTok, IG, or YouTube account qualifies" },
              { icon: <Clock size={16} />, text: "Weekly payout cycle — no waiting months" },
              { icon: <Wallet size={16} />, text: "Naira straight to your bank via Paystack" },
              { icon: <Users size={16} />, text: "No minimum follower count" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 mb-3 text-sm">
                <span className="text-primary">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-8">
            <p className="text-sm text-muted-foreground mb-6">Earnings example</p>
            {[
              { label: "Campaign CPM", value: "₦600 / 1k views", sub: "set by funder", highlight: false },
              { label: "Platform take (20%)", value: "₦120 / 1k", sub: "our fee", highlight: false },
              { label: "Your rate (80%)", value: "₦480 / 1k views", sub: "yours to keep", highlight: true },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                <div>
                  <p className={`text-sm font-medium ${r.highlight ? "text-primary" : ""}`}>{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.sub}</p>
                </div>
                <span className={`font-mono font-bold text-lg ${r.highlight ? "text-primary" : ""}`} style={{ fontFamily: "'DM Mono', monospace" }}>{r.value}</span>
              </div>
            ))}
            <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Your clip gets 50,000 views →</p>
              <p className="text-3xl font-black text-primary" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>₦24,000 earned</p>
              <p className="text-xs text-muted-foreground mt-1">50k ÷ 1000 × ₦480 = ₦24,000</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
