import { ExternalLink } from "lucide-react";
import { PlatformBadge } from "@/app/components/shared/PlatformBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { fmt } from "@/app/lib/format";
import type { MyClip } from "@/app/types";

export function ClipperClips({ clips, loading }: { clips: MyClip[]; loading: boolean }) {
  if (loading) {
    return <div className="bg-card border border-border rounded-xl p-12 animate-pulse h-48" />;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">All Submitted Clips</h3>
      </div>
      {clips.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No clips submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Campaign", "Platform", "Date", "Status", "Views", "Earnings", "Link"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clips.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3 font-medium">{c.campaign}</td>
                  <td className="px-5 py-3"><PlatformBadge p={c.platform} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 font-mono text-xs">{c.views ? c.views.toLocaleString() : "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-primary">{c.earnings ? fmt(c.earnings) : "—"}</td>
                  <td className="px-5 py-3">
                    {c.postUrl ? (
                      <a href={c.postUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        Open <ExternalLink size={10} />
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
