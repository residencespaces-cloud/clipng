export function PlatformBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    TikTok: "bg-pink-500/15 text-pink-400",
    Instagram: "bg-purple-500/15 text-purple-400",
    YouTube: "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${map[p] ?? ""}`}>{p}</span>
  );
}
