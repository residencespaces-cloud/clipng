import type { Campaign, MyClip, Payout, PendingClipRow, WalletTransaction } from "../types";

export const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "Burna Boy — 'City Boys' Drop",
    funder: "Spaceship Collective",
    cpm: 600,
    budget: 300000,
    remaining: 187400,
    views: 187667,
    clips: 34,
    platforms: ["TikTok", "Instagram"],
    status: "Active",
    end: "2024-02-15",
    description: "Clip the 'City Boys' official video. Must include #CityBoysNG caption. Minimum 30s clip.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1767661667474-4f2a197c9a51?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    name: "Flutterwave Brand Push",
    funder: "Flutterwave Marketing",
    cpm: 500,
    budget: 500000,
    remaining: 341200,
    views: 317600,
    clips: 52,
    platforms: ["TikTok", "YouTube"],
    status: "Active",
    end: "2024-02-28",
    description: "Showcase how Flutterwave simplifies payments. Include #SendMoneyNG tag.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    name: "Falz x MTN Campaign",
    funder: "MTN Nigeria",
    cpm: 450,
    budget: 200000,
    remaining: 44500,
    views: 345556,
    clips: 67,
    platforms: ["TikTok", "Instagram", "YouTube"],
    status: "Active",
    end: "2024-02-10",
    description: "Clip the Falz x MTN collaboration. Must include #MTNxFalz in caption.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1733953096768-8b060f824587?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 4,
    name: "Mr Macaroni — Nollywood Skit",
    funder: "Debo Adedayo Ent.",
    cpm: 400,
    budget: 100000,
    remaining: 100000,
    views: 0,
    clips: 0,
    platforms: ["TikTok", "Instagram"],
    status: "Active",
    end: "2024-03-01",
    description: "Best moments from latest skit drop. Caption: #MrMacaroni2024. Min 15s.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1638389747564-c7cc1c9f7a49?auto=format&fit=crop&w=1200&q=85",
  },
];

export const PENDING_CLIPS: PendingClipRow[] = [
  { id: 1, clipper: "Adaeze Obi", campaign: "Burna Boy — 'City Boys' Drop", platform: "TikTok", link: "https://www.tiktok.com/@adaeze/video/7421200000000000001", verificationCode: "#CNG-01-A7K2", date: "2024-01-28", views: 0, status: "Pending" },
  { id: 2, clipper: "Emeka Chukwu", campaign: "Flutterwave Brand Push", platform: "YouTube", link: "https://www.youtube.com/shorts/clipng-demo-02", verificationCode: "#CNG-02-E9M4", date: "2024-01-27", views: 0, status: "Pending" },
  { id: 3, clipper: "Fatima Bello", campaign: "Burna Boy — 'City Boys' Drop", platform: "Instagram", link: "https://www.instagram.com/reel/clipngdemo03/", verificationCode: "#CNG-01-F3B8", date: "2024-01-27", views: 0, status: "Pending" },
  { id: 4, clipper: "Tunde Adeleke", campaign: "Falz x MTN Campaign", platform: "TikTok", link: "https://www.tiktok.com/@tunde/video/7421200000000000004", verificationCode: "#CNG-03-T6D1", date: "2024-01-26", views: 0, status: "Pending" },
  { id: 5, clipper: "Chisom Eze", campaign: "Flutterwave Brand Push", platform: "TikTok", link: "https://www.tiktok.com/@chisom/video/7421200000000000005", verificationCode: "#CNG-02-C5E7", date: "2024-01-25", views: 0, status: "Pending" },
];

export const MY_CLIPS: MyClip[] = [
  { id: 1, campaign: "Burna Boy — 'City Boys' Drop", platform: "TikTok", date: "2024-01-20", status: "Paid", views: 84200, earnings: 40416 },
  { id: 2, campaign: "Flutterwave Brand Push", platform: "YouTube", date: "2024-01-22", status: "Verified", views: 32100, earnings: 12840 },
  { id: 3, campaign: "Falz x MTN Campaign", platform: "TikTok", date: "2024-01-25", status: "Pending", views: 0, earnings: 0 },
  { id: 4, campaign: "Burna Boy — 'City Boys' Drop", platform: "Instagram", date: "2024-01-27", status: "Approved", views: 18900, earnings: 7560 },
];

export const PAYOUTS: Payout[] = [
  { id: 1, date: "2024-01-21", clipper: "Adaeze Obi", campaign: "Burna Boy — 'City Boys' Drop", amount: 40416, status: "Paid" },
  { id: 2, date: "2024-01-21", clipper: "Emeka Chukwu", campaign: "Falz x MTN Campaign", amount: 27000, status: "Paid" },
  { id: 3, date: "2024-01-21", clipper: "Fatima Bello", campaign: "Flutterwave Brand Push", amount: 16000, status: "Paid" },
  { id: 4, date: "2024-01-28", clipper: "Tunde Adeleke", campaign: "Burna Boy — 'City Boys' Drop", amount: 19200, status: "Triggered" },
  { id: 5, date: "2024-01-28", clipper: "Chisom Eze", campaign: "Flutterwave Brand Push", amount: 8400, status: "Pending" },
];

export const INITIAL_WALLET_BALANCE = 750_000;

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 1, date: "Dec 01, 2023", type: "top_up", description: "Wallet top-up via Paystack", amount: 500_000, balanceAfter: 500_000 },
  { id: 2, date: "Dec 20, 2023", type: "campaign_escrow", description: "Falz x MTN Campaign (escrow)", amount: -200_000, balanceAfter: 300_000 },
  { id: 3, date: "Jan 10, 2024", type: "top_up", description: "Wallet top-up via Paystack", amount: 350_000, balanceAfter: 650_000 },
  { id: 4, date: "Jan 10, 2024", type: "campaign_escrow", description: "Burna Boy — City Boys Drop (escrow)", amount: -300_000, balanceAfter: 350_000 },
  { id: 5, date: "Jan 15, 2024", type: "top_up", description: "Wallet top-up via Paystack", amount: 400_000, balanceAfter: 750_000 },
];
