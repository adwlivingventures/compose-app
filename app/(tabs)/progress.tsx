import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { useProtocol, getPhaseForDay, DayData } from '../../context/ProtocolContext';
import {
  LEDGER_ITEMS,
  LedgerState,
  ledgerItemsForDay,
  ledgerVotes,
} from '../../content/ledger';
import { useSpikeLog, daysSince, weeklyCounts } from '../../hooks/useSpikeLog';
import { useDefusionLog } from '../../hooks/useDefusionLog';
import { DISTORTION_META, Distortion } from '../../content/restructure';
import {
  getBaseline,
  getComposureHistory,
  ComposureMeasurement,
} from '../../services/composureHistory';
import { LocalStore } from '../../services/storage';
import TabContextBanner from '../../components/TabContextBanner';

/**
 * Progress — "Autonomic Acclimation" / the Baseline tab, v2
 * (founder review 2026-07-12).
 *
 * This screen is the product's proof-of-change artifact AND its renewal
 * asset: the Day-14 checkpoint, the graduation export, and the month-11
 * renewal-evidence screen all draw from what accrues here. Self-generated
 * data is the one form of evidence the anxious brain can't dismiss as
 * marketing.
 *
 * Doctrine (votes, not verdicts — canon §7.8): everything here COUNTS
 * behavior or plots a signal; nothing grades the self. v2 removed the old
 * percentage bars (they were verdicts). No red, no goals, no pass/fail;
 * missed days absorb into the ground color, they are never marked.
 *
 * v3 (Deepwater, 2026-07-25) — evidence-not-applause composition: composure
 * headline with a gain-chipped delta ("since Day 1 — measured, not
 * promised"), a 3-stat count row, the aqua control trend, and the
 * identity-named milestone ladder at the bottom. Accent roles: aqua for
 * measured/earned signals, ember only for identity marks (sealed-day cells,
 * milestone names). No percentages, no grades.
 */

// ─── Composure headline — evidence, not applause ─────────────────────────────

function ComposureCard({ history }: { history: ComposureMeasurement[] }) {
  if (history.length === 0) return null;
  const baseline = getBaseline(history) ?? history[0];
  const latest = history[history.length - 1];
  const delta = latest.day === baseline.day ? null : latest.score - baseline.score;

  return (
    <View className="mt-6 bg-surface border border-line rounded-2xl p-5">
      <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
        Composure Score
      </Text>
      {/* Deepwater ROLE: the measured reading is earned progress → accent
          (aqua). This numeral is the screen's first of its ≤4 aqua uses. */}
      <Text className="text-accent text-[44px] font-serif-light leading-[48px] mt-2">
        {latest.score}
      </Text>
      {delta !== null && delta > 0 ? (
        // Deepwater ROLE: positive delta → `gain`, never color-alone (the ▲
        // and the label carry it). Shown only when the evidence is positive.
        <View className="flex-row items-center gap-2 mt-2">
          <View className="bg-gain/10 border border-gain/30 rounded-full px-2.5 py-0.5">
            <Text className="text-gain text-xs font-semibold">▲ {delta}</Text>
          </View>
          <Text className="text-muted text-xs">since Day 1 — measured, not promised</Text>
        </View>
      ) : delta !== null ? (
        // Flat or negative reads neutral: no red, no verdict — the reps are
        // the evidence; the number is allowed to move last.
        <Text className="text-muted text-xs leading-4 mt-2">
          Measured against your Day-0 baseline of {baseline.score}. Same questions, same
          scale — the number moves when the nervous system does.
        </Text>
      ) : (
        <Text className="text-muted text-xs leading-4 mt-2">
          Measured at onboarding — the number the protocol retrains. Re-measured at Days
          14, 40, and 75: evidence you watch, never a promise you take.
        </Text>
      )}
    </View>
  );
}

// ─── Control chart (retained from v1, with phase boundaries) ─────────────────

const CHART_W = 320;
const CHART_H = 150;
const PAD_X = 10;
const PAD_Y = 14;

function ControlChart({ points }: { points: { day: number; score: number }[] }) {
  if (points.length < 2) return null;

  const xFor = (i: number) => PAD_X + (i / (points.length - 1)) * (CHART_W - PAD_X * 2);
  // Control score runs 1–10 (founder batch 2026-07-15; was 1–5).
  const yFor = (score: number) =>
    CHART_H - PAD_Y - ((score - 1) / 9) * (CHART_H - PAD_Y * 2);

  const poly = points.map((p, i) => `${xFor(i)},${yFor(p.score)}`).join(' ');

  const rolling = points.map((_, i) => {
    const window = points.slice(Math.max(0, i - 6), i + 1);
    return window.reduce((a, p) => a + p.score, 0) / window.length;
  });
  const rollingPoly = rolling.map((s, i) => `${xFor(i)},${yFor(s)}`).join(' ');

  const boundaries = [25.5, 50.5]
    .map((b, idx) => {
      const i = points.findIndex((p) => p.day > b);
      if (i <= 0) return null;
      return { x: (xFor(i - 1) + xFor(i)) / 2, label: `P${idx + 2}` };
    })
    .filter((b): b is { x: number; label: string } => b !== null);

  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {[1, 4, 7, 10].map((s) => (
        <Line
          key={s}
          x1={PAD_X}
          y1={yFor(s)}
          x2={CHART_W - PAD_X}
          y2={yFor(s)}
          stroke="#182430"
          strokeWidth={1}
        />
      ))}
      {boundaries.map((b) => (
        <React.Fragment key={b.label}>
          <Line
            x1={b.x}
            y1={PAD_Y - 6}
            x2={b.x}
            y2={CHART_H - PAD_Y}
            stroke="#2A3A4A"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <SvgText x={b.x + 4} y={PAD_Y} fill="#53626E" fontSize={8} fontWeight="300">
            {b.label}
          </SvgText>
        </React.Fragment>
      ))}
      {/* Deepwater ROLE: the control trend is earned progress, not identity —
          the line goes aqua (accent), no legend; the raw trace stays faint. */}
      <Polyline
        points={poly}
        fill="none"
        stroke="#5FD4C1"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.35}
      />
      {points.length >= 7 && (
        <Polyline
          points={rollingPoly}
          fill="none"
          stroke="#5FD4C1"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {points.map((p, i) => (
        <Circle
          key={p.day}
          cx={xFor(i)}
          cy={yFor(p.score)}
          r={2.5}
          fill="#5FD4C1"
          opacity={points.length >= 7 ? 0.4 : 1}
        />
      ))}
    </Svg>
  );
}

// ─── 75-day vote map ─────────────────────────────────────────────────────────
// Endowment made visible: every completed day is a lit cell, intensity by
// votes kept that day (a count rendered as light, not a grade). Missed and
// future days absorb into the ground — no red, no gaps marked, ever.

const MAP_COLS = 15;
const CELL = 16;
const CELL_GAP = 4;

function VoteMap({ completedDays }: { completedDays: Record<number, DayData> }) {
  const rows = Math.ceil(75 / MAP_COLS);
  return (
    <View className="items-center">
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} className="flex-row" style={{ marginTop: r === 0 ? 0 : CELL_GAP }}>
          {Array.from({ length: MAP_COLS }).map((_, c) => {
            const day = r * MAP_COLS + c + 1;
            if (day > 75) return null;
            const data = completedDays[day];
            const done = data?.completed;
            const votes = ledgerVotes(data?.ledger);
            const maxVotes = ledgerItemsForDay(day).length;
            // Lit intensity scales with votes; a completed day with zero
            // ledger votes still glows faintly — the session itself is a vote.
            const opacity = done ? 0.3 + 0.7 * (maxVotes ? votes / maxVotes : 0) : 1;
            return (
              <View
                key={day}
                style={{
                  width: CELL,
                  height: CELL,
                  marginLeft: c === 0 ? 0 : CELL_GAP,
                  borderRadius: 4,
                  // Deepwater ROLE (accent unification 2026-07-25): lit cells
                  // are earned progress → the aqua current. Unlit cells absorb
                  // into the nested-surface tone; missed days are never marked.
                  backgroundColor: done ? '#5FD4C1' : '#0D141D',
                  opacity: done ? opacity : 1,
                  borderWidth: done ? 0 : 1,
                  borderColor: '#182430',
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── The milestone ladder — identity named, never graded ─────────────────────
// Votes-not-verdicts (canon §7.8): each rung is a named stage of who he is
// becoming, not a score. No percentages, no grades; done-state derives from
// activeDay alone. The identity words are the ladder's whole point — they
// give the basal-ganglia work a self-image to consolidate into (Phase 3
// doctrine, CLAUDE.md §4).

const MILESTONES: { day: number; name: string; sub: string }[] = [
  { day: 1, name: 'The Decision', sub: 'You chose the work.' },
  { day: 7, name: 'Settling', sub: 'One week of daily reps.' },
  { day: 14, name: 'Measured', sub: 'The first re-measurement.' },
  { day: 25, name: 'Grounded', sub: 'Phase 1 sealed.' },
  { day: 40, name: 'Steadied', sub: 'Steady under a heavier load.' },
  { day: 51, name: 'Present', sub: 'The identity phase opens.' },
  { day: 75, name: 'Composed', sub: 'The word becomes the baseline.' },
];

function MilestoneLadder({ activeDay }: { activeDay: number }) {
  const nextIndex = MILESTONES.findIndex((m) => activeDay <= m.day);
  return (
    <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
      <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
        The Milestones
      </Text>
      {MILESTONES.map((m, i) => {
        const done = activeDay > m.day;
        const isNext = i === nextIndex;
        return (
          <View
            key={m.day}
            className="flex-row items-center gap-3 py-2.5"
            // Future rungs dim as a whole — visible endowment, zero urgency.
            style={{ opacity: done || isNext ? 1 : 0.45 }}
          >
            {done ? (
              // Done — the absorbed check: a sealed mark, not a celebration.
              <View className="w-[18px] h-[18px] rounded-full bg-surface-deep border border-line items-center justify-center">
                <Check size={10} color="#6E8090" strokeWidth={3} />
              </View>
            ) : isNext ? (
              // Deepwater ROLE (accent unification 2026-07-25): the next rung
              // is the next step → aqua ring.
              <View className="w-[18px] h-[18px] rounded-full border-[1.5px] border-accent" />
            ) : (
              <View className="w-[18px] h-[18px] rounded-full border border-line-soft" />
            )}
            <View className="flex-1">
              <Text className="text-muted text-xs">
                Day {m.day} ·{' '}
                {/* Deepwater ROLE (accent unification 2026-07-25): the identity
                    word reads in ink, serif italic — register, not color. */}
                <Text className="text-ink font-serif-italic text-[13px]">{m.name}</Text>
              </Text>
              <Text className="text-faint text-[11px] leading-4 mt-0.5">{m.sub}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Rule-based insight (deterministic; §7 — authored templates only) ────────

interface DayRow {
  day: number;
  score: number;
  ledger?: LedgerState;
}

/** Authored insight templates, keyed by ledger item. Computed locally;
 *  shown only when the evidence clears the thresholds below.
 *
 *  2026-08-03 (build order 2.3): the four missing templates written —
 *  previously Hydrate/Breathwork/Clean Baseline/Supplements could be
 *  SELECTED as the strongest effect and then render nothing, so the man
 *  whose own data showed his biggest lever saw no insight at all. Every
 *  live LEDGER_ITEMS key now carries a template, computeInsight skips
 *  template-less keys as a permanent guard, and the dead `tensionAudit`
 *  entry (a retired habit) is removed. The ledger insight is the only
 *  personally-generated causal belief in the product — unfakeable, from
 *  his numbers — which made an empty slot here the costliest kind of
 *  silent bug.
 *
 *  Register: mechanism stated plainly, no cheerleading. The Supplements
 *  template is deliberately MECHANISM-FREE — correlation framing only,
 *  never compound names, never dosages (App Store health-claim lane). */
const INSIGHT_TEMPLATES: Partial<Record<string, string>> = {
  screenSunset:
    'On days after a full Screen Sunset, your control score has averaged {d} higher. The ledger and the pacer are one system.',
  morningLight:
    'On days that began with Morning Light, your control score has averaged {d} higher. The baseline is built in the morning.',
  presenceRep:
    'On days with a Presence Rep, your control score has averaged {d} higher. The daylight reps are showing up in the session.',
  training:
    'On days with Deliberate Movement, your control score has averaged {d} higher. Blood flow is doing what blood flow does.',
  cleanFocus:
    'On days after Clean Focus held, your control score has averaged {d} higher. The resensitization is measurable.',
  hydrate:
    'On fully hydrated days, your control score has averaged {d} higher. Blood flow is plumbing before it is psychology — the vessels work with what you give them.',
  breathwork:
    'On days with a breath or meditation session outside the protocol, your control score has averaged {d} higher. The daily track trains the reflex; the extra session lowers the baseline it fires from.',
  autonomicPreservation:
    'On clean-baseline days, your control score has averaged {d} higher. Less stimulant load, less alcohol — a quieter baseline gives the alarm less to work with.',
  supplements:
    'On days you kept your supplement routine, your control score has averaged {d} higher. Your ledger, your data — steady routines read clearest.',
};

/** Items whose mechanism lands the NEXT day (sleep- and dopamine-mediated). */
const NEXT_DAY_ITEMS = new Set(['screenSunset', 'cleanFocus']);

function computeInsight(rows: DayRow[]): string | null {
  if (rows.length < 10) return null;
  const byDay = new Map(rows.map((r) => [r.day, r]));

  let best: { key: string; diff: number } | null = null;
  for (const item of LEDGER_ITEMS) {
    // Guard (build order 2.3): a key with no authored template can never be
    // selected — the selector degrades to the next-best covered insight,
    // never to silence. All live keys are covered today; this holds under
    // any future ledger edit.
    if (!INSIGHT_TEMPLATES[item.key]) continue;
    const lag = NEXT_DAY_ITEMS.has(item.key) ? 1 : 0;
    const withItem: number[] = [];
    const without: number[] = [];
    for (const r of rows) {
      const flag = byDay.get(r.day - lag)?.ledger?.[item.key];
      if (flag === undefined) continue;
      (flag ? withItem : without).push(r.score);
    }
    if (withItem.length < 5 || without.length < 5) continue;
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const diff = avg(withItem) - avg(without);
    if (diff >= 0.5 && (!best || diff > best.diff)) best = { key: item.key, diff };
  }
  if (!best) return null;
  const template = INSIGHT_TEMPLATES[best.key];
  return template ? template.replace('{d}', `+${best.diff.toFixed(1)}`) : null;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 bg-surface border border-line rounded-2xl p-4">
      <Text className="text-ink text-2xl font-serif-light">{value}</Text>
      <Text className="text-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const { activeDay, completedDays, streak } = useProtocol();
  const { entries: spikes, reload: reloadSpikes } = useSpikeLog();
  const { entries: defusions, reload: reloadDefusions } = useDefusionLog();

  // Composure measurements (Day 0 baseline + the 14/40/75 re-measurements),
  // re-read on focus so a reading taken minutes ago shows up immediately.
  // One load feeds both the headline card and the measurement ledger below.
  const [composureHistory, setComposureHistory] = useState<ComposureMeasurement[]>([]);
  // Pelvic re-check log (newest-first, per app/pelvic-check.tsx) — read here
  // for the Release-capacity evidence line (build order 2.5).
  const [pelvicChecks, setPelvicChecks] = useState<{ date: string; value: number }[]>([]);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getComposureHistory().then((history) => {
        if (alive) setComposureHistory(history);
      });
      LocalStore.getItem<{ date: string; value: number }[]>('@pelvic_recheck_log').then((log) => {
        if (alive) setPelvicChecks(Array.isArray(log) ? log : []);
      });
      reloadSpikes();
      reloadDefusions();
      return () => {
        alive = false;
      };
    }, [reloadSpikes, reloadDefusions]),
  );
  const composureBaseline = getBaseline(composureHistory);
  const latestComposure =
    composureHistory.length > 0 ? composureHistory[composureHistory.length - 1] : null;
  const composureDelta =
    composureBaseline && latestComposure && latestComposure.day !== 0
      ? latestComposure.score - composureBaseline.score
      : null;

  const days = Object.entries(completedDays)
    .map(([day, data]) => ({ day: Number(day), ...data }))
    .filter((d) => d.completed)
    .sort((a, b) => a.day - b.day);

  const scores = days
    .filter((d) => d.pelvicRating >= 1)
    .map((d) => ({ day: d.day, score: d.pelvicRating, ledger: d.ledger }));

  const enoughData = scores.length >= 10;
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const baselineShift = enoughData
    ? avg(scores.slice(-7).map((s) => s.score)) - avg(scores.slice(0, 7).map((s) => s.score))
    : null;

  // Per-phase control averages — the arc made legible ("Phase 2 is working,"
  // not just "the line went up"). Shown once a phase has ≥5 scored days.
  const phaseAvgs = ([1, 2, 3] as const).map((p) => {
    const xs = scores.filter((s) => getPhaseForDay(s.day).number === p).map((s) => s.score);
    return xs.length >= 5 ? avg(xs) : null;
  });

  const insight = computeInsight(scores);

  // Ledger vote counts — counts, never percentages (votes, not verdicts).
  const itemCounts = LEDGER_ITEMS.map((item) => {
    const eligible = days.filter((d) => d.ledger?.[item.key] !== undefined);
    return {
      item,
      kept: eligible.filter((d) => d.ledger?.[item.key]).length,
      of: eligible.length,
    };
  }).filter((c) => c.of > 0);
  const totalVotes = days.reduce((sum, d) => sum + ledgerVotes(d.ledger), 0);

  // Restructure evidence — extinction made visible.
  const allSpikeDates = [...spikes.map((s) => s.date), ...defusions.map((d) => d.date)];
  const loopsClosed = allSpikeDates.length;
  const quietDays = daysSince(allSpikeDates);
  const distortionCounts = new Map<Distortion, number>();
  for (const s of spikes) {
    distortionCounts.set(s.distortion, (distortionCounts.get(s.distortion) ?? 0) + 1);
  }
  for (const d of defusions) {
    distortionCounts.set(d.fallacy, (distortionCounts.get(d.fallacy) ?? 0) + 1);
  }
  const dominant = [...distortionCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  const weekly = weeklyCounts(allSpikeDates);
  const extinctionVisible =
    loopsClosed >= 6 && weekly[0] > weekly[weekly.length - 1];

  return (
    <View className="flex-1 bg-ground">
      <TabContextBanner tab="baseline" />
      <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 48 }}
    >
      <Text className="text-muted text-xs font-bold uppercase tracking-widest">
        Autonomic Acclimation
      </Text>
      <Text className="text-ink text-3xl font-serif-light mt-1">Your Baseline</Text>

      {/* Composure — the headline the whole product reports to. */}
      <ComposureCard history={composureHistory} />

      {/* The 3-stat row — counts only, never grades. Minutes are not
          tracked anywhere in state (deriving them would be invention —
          Deepwater brief: never invent data), so the third slot orients:
          the protocol day reached, which the ladder below expands. */}
      <View className="flex-row mt-4 gap-3">
        <StatCard value={`${streak}`} label="Day streak" />
        <StatCard value={`${days.length}`} label="Sessions" />
        <StatCard value={`${activeDay}`} label="Day of 75" />
      </View>

      {/* Composure measurements — the "measured, not promised" ledger.
          Matte on purpose (Deepwater): the aqua budget is spent on the
          headline numeral and the trendline; this ledger is evidence,
          not a next step. */}
      {composureHistory.length > 0 && (
        <View className="mt-6 bg-surface border border-line rounded-2xl p-5">
          <Text className="text-body text-sm font-bold">Composure</Text>
          <Text className="text-faint text-xs mt-0.5 mb-2">
            Same questions, same scale — Day 0, then Days 14, 40, and 75
          </Text>
          {composureHistory.map((m) => (
            <View key={m.day} className="flex-row justify-between py-1.5">
              <Text className="text-body text-xs">
                {m.day === 0 ? 'Baseline · Day 0' : `Day ${m.day}`}
              </Text>
              <Text className="text-ink text-xs font-semibold">{m.score}</Text>
            </View>
          ))}
          {composureDelta !== null && composureDelta > 0 && (
            <Text className="text-muted text-xs mt-2 leading-4">
              {composureDelta} points above your Day-0 baseline — the same questions,
              answered by a differently conditioned nervous system.
            </Text>
          )}
        </View>
      )}

      {/* Release capacity (2026-08-03, build order 2.5) — the one physical,
          objective-feeling metric in the product, previously buried in the
          You tab. For a population that distrusts psychological metrics, a
          number from his own muscle is the most credible evidence available,
          and it moves faster than the Composure Score — so it belongs here,
          in view before Day 14 carries the evidence burden alone. Read-only:
          the tab's zero-tap-target rule holds; re-measuring lives in You. */}
      {pelvicChecks.length > 0 && (
        <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
          <Text className="text-body text-sm font-bold">Release capacity</Text>
          <Text className="text-faint text-xs mt-0.5 mb-2">
            The 15-second tension check, rated 1–10
          </Text>
          {pelvicChecks.length >= 2 ? (
            <>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-ink text-xl font-serif-light">
                  {pelvicChecks[pelvicChecks.length - 1].value} → {pelvicChecks[0].value}
                </Text>
              </View>
              <Text className="text-muted text-xs mt-1.5 leading-4">
                First check to latest — the floor is learning to let go, and this number is the
                muscle reporting it.
              </Text>
            </>
          ) : (
            <>
              <View className="flex-row justify-between py-1">
                <Text className="text-body text-xs">Latest check</Text>
                <Text className="text-ink text-xs font-semibold">{pelvicChecks[0].value}</Text>
              </View>
              <Text className="text-muted text-xs mt-1.5 leading-4">
                Re-measure any time from You → Pelvic Release Check — two readings make a trend.
              </Text>
            </>
          )}
        </View>
      )}

      {/* Control trendline */}
      <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
        <Text className="text-body text-sm font-bold">Control Score</Text>
        {/* No legend (Deepwater): one quiet sentence, not a key. */}
        <Text className="text-faint text-xs mt-0.5 mb-3">
          Daily 1–10 self-rating; the line is the 7-day trend.
        </Text>
        {scores.length >= 2 ? (
          <ControlChart points={scores} />
        ) : (
          <Text className="text-muted text-sm leading-5 py-6 text-center">
            Your first data points arrive with your first sessions.{'\n'}This is where you'll
            watch your baseline change.
          </Text>
        )}
        {/* Per-phase averages: the protocol got harder each phase, so a flat
            line is improvement and a rising one is a story. */}
        {phaseAvgs.some((a) => a !== null) && (
          <View className="flex-row gap-3 mt-4 pt-4 border-t border-line-soft">
            {phaseAvgs.map((a, i) =>
              a === null ? null : (
                <View key={i} className="flex-1">
                  <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
                    Phase {['I', 'II', 'III'][i]}
                  </Text>
                  <Text className="text-ink text-lg font-serif-light mt-0.5">
                    {a.toFixed(1)}
                  </Text>
                </View>
              ),
            )}
          </View>
        )}
        {/* Deepwater ROLE: commentary absorbs — this screen's aqua budget is
            spent on the composure numeral and the trendline itself. */}
        {baselineShift !== null && baselineShift > 0 && (
          <Text className="text-muted text-xs mt-3 leading-4">
            Your recent control scores average {baselineShift.toFixed(1)} higher than your
            first week — and each phase asks more of the same five minutes. That shift is
            your nervous system re-learning its baseline; not willpower, conditioning.
          </Text>
        )}
      </View>

      {/* The vote map */}
      <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
        <Text className="text-body text-sm font-bold">Seventy-Five Days</Text>
        <Text className="text-faint text-xs mt-0.5 mb-4">
          Each lit cell is a completed day; brighter cells carried more ledger votes.
        </Text>
        <VoteMap completedDays={completedDays} />
      </View>

      {/* Ledger votes — counts only */}
      <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
        <Text className="text-body text-sm font-bold">The Ledger</Text>
        <Text className="text-faint text-xs mt-0.5">
          {totalVotes === 0
            ? 'Votes appear here as days complete.'
            : `${totalVotes} votes cast across the protocol.`}
        </Text>
        {itemCounts.length > 0 && (
          <View className="mt-4 gap-2.5">
            {itemCounts.map(({ item, kept, of }) => (
              <View key={item.key} className="flex-row justify-between">
                <Text className="text-body text-[13px]">{item.title}</Text>
                <Text className="text-muted text-[13px]">
                  {kept} of {of} days
                </Text>
              </View>
            ))}
          </View>
        )}
        {/* The causal link, computed locally, shown only when the evidence
            clears threshold (n≥10, both buckets ≥5, effect ≥ +0.5). This is
            the moment discipline connects to outcome — the identity thesis
            with a number on it. Deterministic templates; §7 intact. */}
        {/* Deepwater ROLE: the insight is evidence, not a next action — it
            reads in body ink, no accent. */}
        {insight && (
          <Text className="text-body text-xs leading-4 mt-4 pt-4 border-t border-line-soft">
            {insight}
          </Text>
        )}
      </View>

      {/* Restructure evidence */}
      {loopsClosed > 0 && (
        <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
          <Text className="text-body text-sm font-bold">The Evidence Locker</Text>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <Text className="text-ink text-2xl font-serif-light">{loopsClosed}</Text>
              <Text className="text-muted text-xs mt-0.5">loops closed</Text>
            </View>
            {quietDays !== null && quietDays >= 1 && (
              <View className="flex-1">
                <Text className="text-ink text-2xl font-serif-light">{quietDays}</Text>
                <Text className="text-muted text-xs mt-0.5">
                  {quietDays === 1 ? 'day' : 'days'} since the last spike
                </Text>
              </View>
            )}
          </View>
          {dominant && dominant[1] >= 3 && (
            <Text className="text-muted text-xs leading-4 mt-3">
              {dominant[1]} of your {loopsClosed} loops are one known voice —{' '}
              {DISTORTION_META[dominant[0]].label.toLowerCase()}. One nameable pattern, not
              many problems.
            </Text>
          )}
          {extinctionVisible && (
            <Text className="text-muted text-xs leading-4 mt-2">
              Spikes per week are falling ({weekly[0]} → {weekly[weekly.length - 1]}). A
              quieting alarm is extinction, and extinction is the mechanism working.
            </Text>
          )}
        </View>
      )}

      {/* The identity ladder closes the screen: after the evidence, the
          becoming. Done-state derives from activeDay only. */}
      <MilestoneLadder activeDay={activeDay} />

      <Text className="text-faint text-xs text-center mt-6 leading-4 px-4">
        All of this data lives only on this device.
      </Text>
    </ScrollView>
    </View>
  );
}
