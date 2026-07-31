# COMPOSE — TikTok Weekly Metrics (one page, 30 minutes, Sundays)

The governing number is **profile-visit rate** (profile visits ÷ views). Views
are vanity. A clip with 20k views at 5% PVR beats 500k at 0.2%.

Fill one row per posted clip from TikTok Studio → Analytics → Content.
Claude reads this file during the Sunday batch and biases the next week toward
what the algorithm rewarded.

## Week of ____ (fill in)

| Clip ID | Account | Views | Avg watch % | Completion % | Profile visits | PVR % | Link taps* | Notes |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

\* Link taps come from your redirect logs (`/tb`, `/tc`, `/ta`), not TikTok.

## Weekly one-liners (the log that writes next week's brief)

- What the algorithm rewarded this week (per account, one sentence each):
  - @composeprotocol:
  - @cole.composed:
  - @audreylately:
- Credits spent this week: ____ / cap 700
- Any moderation flags, filter warnings, or takedowns (clip ID + what happened):

## Decision rules (pre-committed — apply mechanically)

1. Format verdict only after ≥10 posted clips of that format (hook variants count).
2. Kill a format whose PVR runs <50% of library median across those 10.
3. Top-decile clip (watch % or PVR) → 3 hook-swap remakes within 2 weeks.
4. Account underperforming both siblings after 6 weeks → rebuild its format mix.
5. Never scale a mismatch: if one account's clicks convert on the App Store at
   2× another's, fix the weaker account's promise before feeding it views.
