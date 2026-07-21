export type AuthRole = "clipper" | "funder";
export type ClipperTab = "overview" | "campaigns" | "clips" | "earnings" | "settings";
export type FunderTab = "overview" | "campaigns" | "create" | "billing" | "settings";
export type AdminTab = "pending" | "view-verify" | "approved" | "all-campaigns" | "payouts" | "audit-logs";
export type WalletTransactionType = "top_up" | "campaign_escrow" | "escrow_release" | "refund" | "adjustment";
export type CreateStep = 1 | 2 | 3;
export type SourceType = "video" | "vod";

export interface Campaign {
  id: string;
  name: string;
  funder: string;
  cpm: number;
  budget: number;
  remaining: number;
  views: number;
  clips: number;
  platforms: string[];
  status: string;
  end: string;
  description: string;
  asset: string;
  image: string;
}

export interface PendingClipRow {
  id: string;
  clipper: string;
  campaign: string;
  platform: string;
  link: string;
  verificationCode: string;
  date: string;
  views: number;
  status: string;
}

export interface PendingClip extends PendingClipRow {
  codeVerified: boolean;
}

export interface AwaitingViewsClip extends PendingClipRow {
  approvedDate: string;
  viewCount: string;
}

export interface ApprovedClip extends PendingClipRow {
  viewsVerified: number;
  approvedDate: string;
  earningsDue?: number;
  payoutStatus?: string;
}

export interface WalletTransaction {
  id: string;
  date: string;
  type: WalletTransactionType;
  description: string;
  amount: number;
  balanceAfter: number;
}

export interface MyClip {
  id: string;
  campaign: string;
  platform: string;
  postUrl?: string;
  date: string;
  status: string;
  views: number;
  earnings: number;
}

export interface Payout {
  id: string;
  date: string;
  clipper: string;
  campaign: string;
  amount: number;
  status: string;
  paystackRef?: string | null;
  failureReason?: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actor: string;
  createdAt: string;
}

export interface CreateCampaignForm {
  name: string;
  assetUrl: string;
  imageUrl: string;
  sourceType: SourceType;
  bestMoments: string;
  description: string;
  platforms: string[];
  cpm: string;
  budget: string;
  start: string;
  end: string;
}

export interface EarningsSummary {
  totalEarned: number;
  pendingThisWeek: number;
  paidOut: number;
  clipsSubmitted: number;
  clipsVerified: number;
}
