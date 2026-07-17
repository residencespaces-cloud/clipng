import { StatusBadge } from "@/app/components/shared/StatusBadge";

export function ClipperEarnings() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: "₦53,256", color: "text-primary" },
          { label: "Pending This Week", value: "₦7,560", color: "text-accent" },
          { label: "Paid Out", value: "₦40,416", color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Payout History</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { date: "Jan 21, 2024", campaign: "Burna Boy — 'City Boys' Drop", views: "84,200", amount: "₦40,416", status: "Paid" },
            { date: "Jan 28, 2024", campaign: "Falz x MTN Campaign", views: "18,900", amount: "₦7,560", status: "Pending" },
            { date: "Jan 22, 2024", campaign: "Flutterwave Brand Push", views: "32,100", amount: "₦12,840", status: "Verified" },
          ].map((p, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{p.campaign}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.date} · {p.views} views</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-mono font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{p.amount}</p>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
