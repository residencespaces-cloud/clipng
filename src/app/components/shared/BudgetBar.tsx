import { fmt } from "@/app/lib/format";

export function BudgetBar({ remaining, total }: { remaining: number; total: number }) {
  const usedPct = Math.min(100, Math.round(((total - remaining) / total) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>{fmt(remaining)} left</span>
        <span>{usedPct}% used</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${usedPct}%` }} />
      </div>
    </div>
  );
}
