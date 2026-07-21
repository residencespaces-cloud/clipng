export function normalizeStatus(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    draft: "Draft",
    paused: "Paused",
    exhausted: "Exhausted",
    ended: "Ended",
    archived: "Archived",
    pending_review: "Pending",
    rejected: "Rejected",
    approved_awaiting_views: "Approved",
    views_verified: "Verified",
    payout_triggered: "Triggered",
    paid: "Paid",
    pending: "Pending",
    triggered: "Triggered",
    failed: "Failed",
    top_up: "Top-up",
    campaign_escrow: "Escrow",
  };
  if (map[status.toLowerCase()]) return map[status.toLowerCase()];
  if (status.length === 0) return status;
  return status.charAt(0).toUpperCase() + status.slice(1);
}
