import { StatusBadge } from "@/app/components/shared/StatusBadge";

export function FunderBilling() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card border border-border rounded-xl p-5 space-y-1">
        <h3 className="text-sm font-semibold mb-3">Payment History</h3>
        {[
          { date: "Jan 10, 2024", desc: "Burna Boy — City Boys Drop (Campaign funded)", amount: "₦300,000", status: "Paid" },
          { date: "Dec 20, 2023", desc: "Falz x MTN Campaign (Campaign funded)", amount: "₦200,000", status: "Paid" },
          { date: "Dec 01, 2023", desc: "Flutterwave Brand Push (Campaign funded)", amount: "₦500,000", status: "Paid" },
        ].map((p, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm">{p.desc}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.date}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-mono font-bold text-sm text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>{p.amount}</p>
              <StatusBadge status={p.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
