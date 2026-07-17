export type AuthRole = "clipper" | "funder";
export type ClipperTab = "overview" | "campaigns" | "clips" | "earnings";
export type FunderTab = "overview" | "campaigns" | "create" | "billing";
export type AdminTab = "pending" | "approved" | "all-campaigns" | "payouts";
export type CreateStep = 1 | 2 | 3;
export type SourceType = "video" | "vod";

export interface Campaign {
  id: number;
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
  id: number;
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
  viewCount: string;
  codeVerified: boolean;
}

export interface ApprovedClip extends PendingClipRow {
  viewsVerified: number;
}

export interface MyClip {
  id: number;
  campaign: string;
  platform: string;
  date: string;
  status: string;
  views: number;
  earnings: number;
}

export interface Payout {
  id: number;
  date: string;
  clipper: string;
  campaign: string;
  amount: number;
  status: string;
}

export interface CreateCampaignForm {
  name: string;
  assetUrl: string;
  sourceType: SourceType;
  bestMoments: string;
  description: string;
  platforms: string[];
  cpm: string;
  budget: string;
  start: string;
  end: string;
}
