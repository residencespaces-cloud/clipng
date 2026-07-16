# Nigerian Clipping Platform — UI Implementation Plan

## Context

Building a React UI prototype for a Nigerian creator monetization marketplace (like Whop/Vyro, localized for Nigeria). Funders (artists, brands) pay clippers per 1,000 views to post clips on TikTok/IG/YT. The platform handles campaign creation, clip submission, manual admin review, and Paystack payouts in Naira.

The goal is a comprehensive, multi-view prototype covering all three user roles: **Clipper**, **Funder**, and **Admin**. Navigation between views is handled with React state (no router needed — it's a single-page prototype).

---

## Aesthetic Direction

**Stance:** Dark-ground, data-dense, creator-economy energy. Bloomberg meets Afrobeats money. Dark canvas with electric green (money/views) and amber gold (Nigerian warmth) accents. Condensed display type for impact headings, clean sans for body.

**Fonts (Google Fonts):**
- Display: `Big Shoulders Display` — condensed, loud, editorial weight for hero/stat headings
- Body: `Plus Jakarta Sans` — modern, legible, slightly geometric
- Mono: `DM Mono` — for view counts, ₦ figures, status codes

**Design Tokens (update `src/styles/theme.css`):**
```
--background: #070709
--foreground: #EFEFEC
--card: #111116
--card-foreground: #EFEFEC
--primary: #00E878        (electric green — money/views)
--primary-foreground: #070709
--secondary: #1A1A22
--secondary-foreground: #EFEFEC
--muted: #1A1A22
--muted-foreground: #7A7A8A
--accent: #F5A12E         (amber gold — Nigerian warmth)
--accent-foreground: #070709
--border: rgba(255,255,255,0.08)
--radius: 0.375rem
--ring: #00E878
```

---

## Architecture

Single file: `src/app/App.tsx`. React state drives view switching. No external routing.

**Top-level views** (nav tab switches between them):
1. `landing` — Marketing home page
2. `clipper` — Clipper dashboard
3. `funder` — Funder dashboard  
4. `admin` — Admin panel

Each view is a self-contained section component rendered inline in App.tsx.

---

## View Breakdown

### 1. Landing Page (`landing`)

**Sections:**
- **Nav bar** — Logo ("ClipNG"), nav links, CTA buttons ("I'm a Clipper" / "I'm a Funder"), demo toggle
- **Hero** — Bold display headline ("Get Paid to Clip. Nigerian Campaigns. Naira Payouts."), sub-copy, two CTAs, animated stat strip (₦2.4M paid out · 847 clips verified · 12 active campaigns)
- **How It Works** — Three-column: Funders pay → Clippers clip → Admin verifies → Everyone wins. Numbered steps.
- **Live Campaigns strip** — Horizontal scroll of 4–5 campaign cards showing artist name, CPM, remaining budget, platforms
- **Money math explainer** — "If a campaign pays ₦500/1k views and your clip gets 50,000 views, you earn ₦20,000." Visual breakdown.
- **Footer** — Logo, tagline, platform links

### 2. Clipper Dashboard (`clipper`)

**Layout:** Left sidebar nav + main content area

**Sidebar items:** Overview, Browse Campaigns, My Clips, Earnings, Settings

**Main content panels:**
- **Overview** — Stat cards: Total earned (₦), Pending payout (₦), Clips submitted, Clips verified. Recent earnings table.
- **Browse Campaigns** — Grid of campaign cards. Each card: artist/brand name, source video thumbnail placeholder, CPM (₦), total budget, remaining budget progress bar, allowed platforms (TikTok/IG/YT badges), CTA "Join Campaign"
- **My Clips** — Table: Campaign, Submitted Link, Date, Status (Pending/Approved/Rejected/Paid), Views, Earnings. Filter by status.
- **Earnings** — Timeline of payouts. Running total. Breakdown by campaign.

**Clip submission flow:** Clicking "Join Campaign" opens an inline panel: download link + submission form (clip URL input, platform selector, submit button).

### 3. Funder Dashboard (`funder`)

**Layout:** Left sidebar + main content

**Sidebar items:** Overview, My Campaigns, Create Campaign, Billing

**Main content panels:**
- **Overview** — Stat cards: Total spent (₦), Views delivered, Active campaigns, Total clips submitted
- **My Campaigns** — Table/cards: Campaign name, Status (Active/Paused/Exhausted), Budget, Remaining, Views delivered, Clips submitted. Click to expand detail.
- **Campaign Detail** — Remaining budget progress bar, CPM, view ceiling calc, clips table with status breakdown, platform distribution
- **Create Campaign** — Multi-step form:
  - Step 1: Campaign details (name, source video URL or upload link, description, platforms checkboxes)
  - Step 2: Budget (CPM input, total budget input, auto-calculated view ceiling displayed prominently)
  - Step 3: Review + Pay (summary card, "Pay ₦X,XXX via Paystack" CTA button)

### 4. Admin Panel (`admin`)

**Layout:** Full-width with tabs

**Tabs:** Pending Review · Approved Clips · All Campaigns · Payouts

**Pending Review tab:**
- Table of submitted clips awaiting manual approval
- Columns: Clipper name, Campaign, Platform, Submitted link, Date, Views (manually entered field), Actions (Approve / Reject)
- Bulk approve/reject controls

**Approved Clips tab:**
- Table: Clipper, Campaign, Views verified, Earnings due (₦), Payout status (Pending / Triggered / Paid)
- "Trigger Payout" button per row (or bulk)

**All Campaigns tab:**
- Full campaign list: Funder, Name, Budget, Remaining, Views delivered, Status, Start/End dates

**Payouts tab:**
- Payout history: Date, Clipper, Amount (₦), Campaign, Status

---

## Realistic Placeholder Data

Use these specifics throughout:
- Campaigns: "Burna Boy — 'City Boys' Drop", "Flutterwave Brand Push", "Falz x MTN Campaign", "Nollywood Skit — Mr Macaroni"
- Clipper names: Adaeze Obi, Emeka Chukwu, Fatima Bello, Tunde Adeleke, Chisom Eze
- CPMs: ₦400–₦800/1k views
- Budgets: ₦50k–₦500k

---

## Files to Modify

| File | Change |
|------|--------|
| `src/styles/fonts.css` | Add Google Fonts imports for Big Shoulders Display, Plus Jakarta Sans, DM Mono |
| `src/styles/theme.css` | Update `:root` token values to dark-ground palette (preserve `.dark` block and `@theme inline`) |
| `src/app/App.tsx` | Replace placeholder with full multi-view platform UI |

---

## Verification

After implementation:
1. All 4 views render without errors (check browser console)
2. View switching works via nav/tabs
3. Create Campaign form shows auto-calculated view ceiling as CPM/budget inputs change
4. Clip submission inline panel opens correctly
5. Admin approve/reject interactions update row state
6. Responsive: at ≤1000px sidebar collapses or stacks, campaign grids go to 1-col
