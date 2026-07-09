# App Store Subscription Metadata — Model V2 (2026-07-08)

App Store Connect field values for the membership migration. Governing
rules: CLAUDE.md §2 (Commercial Model V2), §6 (discretion / stranger test),
and the claims framework in [MARKETING-FOUNDATION.md](./MARKETING-FOUNDATION.md) §3.

**The stranger test applies beyond the listing.** Subscription names appear
on surfaces we do not control: iOS Settings → Subscriptions on a shared or
handed-over phone, Apple receipt emails, and family purchase-sharing
notifications. Every name below must be unremarkable to a partner or
stranger reading it there. Domain vocabulary (anxiety, pelvic, intimacy,
performance, somatic) is banned from all subscription names and any field
Apple reprints outside the store listing.

---

## 1. App identity

| Field | Value | Notes |
|---|---|---|
| Bundle display name (home screen) | `Compose` | Unchanged — §6 rule |
| App Store title (≤30) | `COMPOSE: Somatic Presence` | Recommended pick from MARKETING-FOUNDATION §9; store-listing only, never on-device |
| Subtitle (≤30) | `Presence over performance` | Recommended pick from MARKETING-FOUNDATION §9 |

## 2. Subscription group

| Field | Value |
|---|---|
| Reference name (internal) | `Compose Membership` |
| **Group display name (user-facing)** | `Compose Membership` |

The group display name is what iOS shows as the heading in
Settings → Subscriptions. "Compose Membership" reads like any wellness or
media app. Passes the stranger test.

## 3. Products (must match RevenueCat exactly — see `hooks/useRevenueCat.ts`)

| Product ID | Display name (user-facing) | Duration | Price (US) | Role |
|---|---|---|---|---|
| `compose_annual_9999` | `Annual Membership` | 1 year | $99.99 | Primary — default in the offering |
| `compose_annual_6999` | `Annual Membership` | 1 year | $69.99 | RC Experiment arm only; identical display name so the receipt reads the same |
| `compose_monthly_1799` | `Monthly Membership` | 1 month | $17.99 | Secondary |

Notes:
- Display names deliberately carry no protocol vocabulary. On a receipt the
  line reads "Compose — Annual Membership." Unremarkable.
- Pricing policy: experiments run **upward only**; never introduce a
  discounted offer, win-back promo price, or free-trial offer in ASC — the
  no-trial / no-countdown / no-discount rule is a product ruling, not a
  marketing preference.
- All three products live in the one group so Apple handles up/downgrade
  proration between monthly and annual automatically.

## 4. Promotional text (≤170 chars, editable without review)

> A 75-day daily practice to move from performance anxiety to present,
> grounded confidence. One membership covers your full year. Private by
> design. (149)

(Adapted from MARKETING-FOUNDATION §9; the "no pharmacy, no numbing" close
was traded for the membership-year line this migration requires.)

## 5. Description — required subscription disclosure block

Append to the App Store description (Apple reprints parts of this in
review; keep it exact and plain):

> **Membership.** Compose is offered as an auto-renewable membership:
> $99.99 per year, or $17.99 per month. Payment is charged to your Apple ID
> account at confirmation of purchase. The membership renews automatically
> unless cancelled at least 24 hours before the end of the current period;
> your account is charged for renewal within 24 hours before the period
> ends. Manage or cancel anytime in Settings → Apple ID → Subscriptions.
>
> Privacy Policy: https://adwlivingventures.github.io/compose-legal/privacy-policy.html
> Terms of Use: https://adwlivingventures.github.io/compose-legal/terms-of-use.html

Also update the description's "what it is not" bullet (MARKETING-FOUNDATION
§9 outline): the V1 line "not a subscription trap — one payment, yours to
keep" is retired. Replacement angle: "honest billing — the price is the
price, no trials, no countdown offers, and a plain renewal reminder before
your second year." Screenshot caption 4 ("One payment. Yours to keep.")
is likewise retired; replacement: "One payment covers your full year."

## 6. App Review notes (submission form)

- Hard paywall after a diagnostic onboarding; reviewers can purchase in
  sandbox with any of the three products. Restore Purchases is on the
  paywall footer.
- Optional, consent-based anonymous analytics: one in-onboarding consent
  step; declinable; decline disables all telemetry. Events are anonymous
  milestone counts only (schema-whitelisted in `services/analytics.ts`).
  App Privacy label: "Data Not Linked to You" → Usage Data (Product
  Interaction), collection optional.
- No refund handling in-app by design: refunds are requested from and
  decided solely by Apple. Support responses point to Apple's process.
- Rated 17+; wellness/mindfulness positioning; no explicit imagery
  anywhere in binary or metadata.
