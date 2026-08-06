export type AuthRole = "clipper" | "funder";
export type ClipperTab = "overview" | "campaigns" | "clips" | "earnings" | "settings";
export type FunderTab = "overview" | "campaigns" | "create" | "billing" | "settings";
export type AdminTab = "pending" | "view-tracking" | "approved" | "all-campaigns" | "payouts" | "audit-logs" | "signup-tokens";
export type WalletTransactionType = "top_up" | "campaign_escrow" | "escrow_release" | "refund" | "adjustment" | "signup_credit";
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
  bestMoments?: string;
  requiredCaption?: string;
  minClipSeconds?: number | null;
  maxClipSeconds?: number | null;
  maxClipsPerClipper?: number | null;
  rulesDo?: string[];
  rulesDont?: string[];
  rulesNotes?: string;
}

export interface CampaignRules {
  requiredCaption?: string;
  minClipSeconds?: number | null;
  maxClipSeconds?: number | null;
  maxClipsPerClipper?: number | null;
  rulesDo: string[];
  rulesDont: string[];
  rulesNotes?: string;
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
  /** Campaign creator rules shown beside the submission for admin review. */
  campaignRules?: CampaignRules;
  campaignBrief?: string;
}

/** An approved clip whose view count keeps being topped up while its campaign runs. */
export interface TrackedClip extends PendingClipRow {
  approvedDate: string;
  /** Draft value of the admin's view input, prefilled with the credited total. */
  viewCount: string;
  viewsVerified: number;
  earningsAccrued: number;
  paidOut: number;
  outstanding: number;
  updateCount: number;
  lastUpdated: string;
  cpm: number;
  campaignStatus: string;
  campaignRemaining: number;
  trackingOpen: boolean;
  codeVerified?: boolean;
}

/** One queued payout slice for a clip — a clip may have several over its life. */
export interface ApprovedClip extends PendingClipRow {
  submissionId: string;
  viewsVerified: number;
  approvedDate: string;
  earningsDue?: number;
  payoutStatus?: string;
  failureReason?: string | null;
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
  /** Campaign brief — what the content is about. */
  description: string;
  requiredCaption: string;
  minClipSeconds: string;
  maxClipSeconds: string;
  maxClipsPerClipper: string;
  /** One rule per line — things clippers must do. */
  rulesDo: string;
  /** One rule per line — things clippers must not do. */
  rulesDont: string;
  rulesNotes: string;
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
