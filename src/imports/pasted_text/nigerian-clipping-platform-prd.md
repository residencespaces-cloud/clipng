# PRD: [Working Title] — Nigerian Clipping Platform

**Author:** Alameen
**Status:** Draft v1
**Reference models:** Whop (clipping ecosystem), Vyro (MrBeast's clipping marketplace), ClipAffiliates (two-sided marketplace)

---

## 1. Problem & Opportunity

Nigerian artists, skit creators, and brands need distribution on TikTok, Instagram Reels, and YouTube Shorts. Right now this clipping happens **informally and for free** — fans clip Afrobeats drops and comedy skits because they enjoy it, not because they're paid. Whop and Vyro have proven the paid-clipping model works globally (clippers earn $1–5 per 1k views with no follower minimums). No platform currently serves this loop locally, with Naira payouts and Nigerian-relevant campaigns (music drops, betting apps, fintech, Nollywood/skits).

**Opportunity:** Be the local rail that connects Nigerian brands/artists (funders) who want reach to Nigerian clippers who want to get paid for what they're already doing for free.

## 2. Goals (MVP)

- Prove clippers will submit clips and get paid reliably.
- Prove funders will pay for verified views at a Naira CPM.
- Keep the loop simple: **Campaign → Clip submission → View verification → Payout.**

**Non-goals for MVP:** automated fraud ML, multi-platform OAuth for auto view-pulling, native mobile app, dispute resolution UI. (Self-serve campaign creation for funders is now in scope for MVP — see below.)

## 3. Users

| Role | Who | Wants |
|---|---|---|
| **Funder** | Artist/label, skit creator, brand (fintech, betting, music) | Reach at a predictable cost per 1k views |
| **Clipper** | Nigerian creator/editor with TikTok/IG/YT account | Get paid per view, no follower minimum, fast payout |
| **Admin (you, at MVP stage)** | Platform operator | Onboard funders manually, verify views, trigger payouts |

## 4. Core Loop (MVP, matches Whop/Vyro mechanics)

1. **Funder self-serve campaign creation** — funder signs up, uploads source video/asset, sets **CPM** (e.g. ₦500 / 1,000 views) and a **total budget** (e.g. ₦50,000), pays the budget upfront via Paystack. No admin involvement needed to create or launch a campaign.
   - Platform auto-calculates and displays the implied view ceiling: `budget ÷ CPM × 1000` (e.g. ₦50,000 budget ÷ ₦500 CPM = **100,000 views** total across the campaign before it's exhausted).
2. **Campaign goes live automatically** once payment clears — open to **unlimited clippers**. Any number of people can join and submit clips against the same campaign; they're effectively racing against the shared budget, not against a per-person cap.
3. **Clipper joins campaign** — downloads source, edits a clip, posts to their own TikTok/IG/YT account.
4. **Clipper submits the public post link** to the platform.
5. **Weekly review cycle (manual)** — once a week, admin manually approves/rejects submitted clips and reviews performance (view counts) against each campaign's remaining budget. This is the one manual step in the loop.
6. **Weekly payout** — earnings per clip = `views ÷ 1000 × CPM`, paid via Paystack. Running total is deducted from the campaign's remaining budget after each cycle.
7. **Campaign auto-closes** when the running total of paid-out views reaches the budget ceiling (or funder's end date, whichever comes first). Late-arriving clips that would exceed the remaining budget get paid pro-rata or paused — decide which before launch.

## 5. MVP Feature List

**Funder side (self-serve)**
- [ ] Sign up (name, phone/email, business details)
- [ ] Create campaign: source asset upload/link, CPM (₦), total budget (₦), platform(s) allowed, start/end date
- [ ] Auto-calculated field, shown to funder for confirmation: implied total view ceiling (`budget ÷ CPM × 1000`)
- [ ] Pay budget upfront via Paystack — campaign only goes live once payment clears (escrow-style)
- [ ] View own campaign status: clips submitted, remaining budget, views delivered so far
- [ ] Unlimited clippers allowed per campaign by default (no per-campaign clipper cap at MVP)

**Clipper side (self-serve)**
- [ ] Sign up (name, phone/email, bank details for Paystack payout)
- [ ] Browse open campaigns
- [ ] Submit clip link against a campaign
- [ ] View own earnings/status (pending / verified / paid)

**Admin side — the only manual steps in the loop**
- [ ] Weekly review: approve/reject submitted clips per campaign (quality/rule check — e.g. required caption, no reposts)
- [ ] Weekly performance review: record/verify view counts per approved clip against each campaign's remaining budget
- [ ] Trigger Paystack payout per clipper once approved and verified

**Not in MVP:** automated view-pulling via OAuth/API (view counts still manually checked at review time), in-app messaging, referral system.

## 6. Verification & Anti-Fraud (keep it simple at MVP)

The hardest technical problem is trustworthy view counts. At MVP, skip building automated scraping/OAuth pipelines — verify manually:
- Clipper submits link → admin checks view count directly on the platform on a fixed cadence (e.g. every 3–7 days).
- Basic rules: one submission per clip per campaign, minimum clip length, must include a required tag/caption, account must be public.
- Flag suspicious velocity (e.g. 100k views in an hour) for manual review before payout.

Automated verification (API/OAuth-based) is a **Phase 2** item once the manual process proves the model works and volume makes manual checking unsustainable.

## 7. Money Model

- **Funder sets:** CPM (₦ per 1,000 views) + total budget (₦). These two numbers alone define the campaign — no separate view target needs to be entered manually, since the platform derives it.
- **Platform auto-calculates:** implied view ceiling = `budget ÷ CPM × 1000`. Shown back to the funder at campaign creation so they know exactly what they're buying (e.g. "₦50,000 at ₦500 CPM = up to 100,000 views").
- **Funder pays:** full budget upfront to the platform (escrow-style) before the campaign goes live — protects clippers from funders who don't pay after the fact.
- **Platform take rate: 20% flat.** Applied per clip, not per campaign — so the split is calculated the same way every time regardless of campaign size.
- **Clipper receives: 80% of CPM.** Worked example: funder sets CPM at ₦500/1k views → clipper earns **₦400 per 1k views**, platform holds **₦100 per 1k views**. Paid via Paystack weekly, once views are verified.
- **Unlimited clippers, shared budget:** since any number of clippers can submit against one campaign, the budget is a shared pool — it's first-verified, first-paid until exhausted, not divided evenly per clipper. Note: the funder's stated CPM is the *gross* rate the budget is spent against (i.e. ₦50,000 budget ÷ ₦500 CPM = 100,000 views is still the correct ceiling — the 20% comes out of the clipper's share, not on top of the funder's budget).

*Open question to validate:* is ₦400/1k views (clipper's net, after take rate) attractive enough versus international platforms, or does it need to be positioned purely as "Nigerian campaigns, faster Naira payout, no minimum threshold" rather than competing on rate alone.

*Decision needed before launch:* what happens when a weekly batch of verified clips would exceed the remaining budget? Options: (a) pay everyone pro-rata that week so the budget stretches exactly to zero, or (b) pay in submission order until budget runs out and reject/carry over the rest. Pro-rata is fairer to clippers; submission-order is simpler to build. Recommend starting with submission-order for MVP simplicity.

## 8. Tech Stack (MVP — matches your existing skillset)

- **Backend:** NestJS + TypeScript (same as your other projects)
- **Database:** Postgres
- **Payments:** Paystack (you've already integrated this in OrderUp)
- **Frontend:** Simple React or server-rendered forms — no need for anything fancy at MVP
- **Hosting:** Coolify on Hostinger (your existing deployment setup)
- **Admin panel:** Can start as basic CRUD screens, or even a simple internal tool, before investing in a polished dashboard

## 9. Phased Rollout

**Phase 1 (MVP):**
Self-serve funder campaign creation + Paystack escrow payment. Self-serve clipper signup and clip submission. The only manual step: weekly admin review (approve clips, verify view counts, trigger payouts). Goal: onboard 2–3 funders (e.g. an artist or skit page you know personally) and 20–30 clippers. Prove people submit clips and get paid on a reliable weekly cycle.

**Phase 2 (automate the manual review step):**
- Automated view-checking via platform APIs/OAuth where available, reducing the weekly manual review burden
- Basic fraud detection (velocity flags, duplicate detection)
- Faster-than-weekly payout options as volume grows

**Phase 3 (scale):**
- Funder analytics dashboard (deeper campaign performance insights beyond basic status)
- Clipper leaderboard/reputation system
- Multi-platform support expansion
- Referral/affiliate mechanics (like Whop's broader marketplace)

## 10. Success Metrics (MVP)

- Number of funders who fund a campaign and pay out at least once
- Number of clippers who complete the full loop (submit → verify → get paid)
- Average time from clip submission to payout
- Funder retention: do they fund a second campaign?

## 11. Key Risks

| Risk | Notes |
|---|---|
| **Funder acquisition** | Chicken-and-egg: no funders → no reason for clippers to join. Start by personally onboarding 1–2 funders you already have a relationship with, even though signup itself is self-serve. |
| **Self-serve funder quality** | Since anyone can create and pay for a campaign without you vetting them first, you'll want basic guardrails (minimum budget, content guidelines checked at signup) so low-quality or bad-actor campaigns don't damage clipper trust. |
| **View verification trust** | Manual checking doesn't scale; funders need to trust the numbers. Keep MVP volume small enough that manual weekly checking is credible. |
| **Payout reliability** | Paystack payout delays or failures will kill clipper trust fast — test this rail early. |
| **Regulatory** | Avoid political/advocacy campaigns at MVP stage; stick to brand/artist promo to keep things simple. |

---

**Next step:** validate Phase 1 by finding 1–2 funders willing to commit a small budget (even ₦50k–₦100k) before writing a single line of code beyond the manual intake flow.