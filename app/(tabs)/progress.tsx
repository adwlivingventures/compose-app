import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
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
  getComposureHistory,
  ComposureMeasurement,
} from '../../services/composureHistory';

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
 */

// ─── Composure headline ───────────────────────────────────────────────────────

function ComposureCard({ history }: { history: ComposureMeasurement[] }) {
  if (history.length === 0) return null;
  const baseline = history[0];
  const latest = history[history.length - 1];
  const delta = latest.day === baseline.day ? null : latest.score - baseline.score;

  return (
    <View className="mt-6 bg-surface border border-line rounded-2xl p-5">
      <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
        Composure Score
      </Text>
      <View className="flex-row items-end gap-3 mt-2">
        <Text className="text-accent text-[44px] font-serif-light leading-[48px]">
          {latest.score}
        </Text>
        {delta !== null && (
          <Text className="text-body text-sm mb-2">
            {delta >= 0 ? '+' : ''}
            {delta} since your baseline of {baseline.score}
          </Text>
        )}
      </View>
      <Text className="text-muted text-xs leading-4 mt-2">
        {delta === null
          ? `Measured at onboarding — the number the protocol retrains. Re-measured at Days 14, 40, and 75: evidence you watch, never a promise you take.`
          : `Measured, not promised. The calm zone sits at 80–100 — the gap is the work, and it is closing on schedule.`}
      </Text>
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
  const yFor = (score: number) =>
    CHART_H - PAD_Y - ((score - 1) / 4) * (CHART_H - PAD_Y * 2);

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
      {[1, 2, 3, 4, 5].map((s) => (
        <Line
          key={s}
          x1={PAD_X}
          y1={yFor(s)}
          x2={CHART_W - PAD_X}
          y2={yFor(s)}
          stroke="#1B2233"
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
            stroke="#2E3B5E"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <SvgText x={b.x + 4} y={PAD_Y} fill="#4B5563" fontSize={8} fontWeight="300">
            {b.label}
          </SvgText>
        </React.Fragment>
      ))}
      <Polyline
        points={poly}
        fill="none"
        stroke="#C89B6D"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.35}
      />
      {points.length >= 7 && (
        <Polyline
          points={rollingPoly}
          fill="none"
          stroke="#C89B6D"
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
          fill="#C89B6D"
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
                  backgroundColor: done ? '#C89B6D' : '#0E121C',
                  opacity: done ? opacity : 1,
                  borderWidth: done ? 0 : 1,
                  borderColor: '#1B2233',
                }}
              />
            );
          })}
        </View>
      ))}
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
 *  shown only when the evidence clears the thresholds below. */
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
  tensionAudit:
    'On days you caught the clench, your control score has averaged {d} higher. The floor you release at noon is the floor you find at night.',
};

/** Items whose mechanism lands the NEXT day (sleep- and dopamine-mediated). */
const NEXT_DAY_ITEMS = new Set(['screenSunset', 'cleanFocus']);

function computeInsight(rows: DayRow[]): string | null {
  if (rows.length < 10) return null;
  const byDay = new Map(rows.map((r) => [r.day, r]));

  let best: { key: string; diff: number } | null = null;
  for (const item of LEDGER_ITEMS) {
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
  const { completedDays, streak } = useProtocol();
  const { entries: spikes, reload: reloadSpikes } = useSpikeLog();
  const { entries: defusions, reload: reloadDefusions } = useDefusionLog();
  const [composure, setComposure] = useState<ComposureMeasurement[]>([]);

  useFocusEffect(
    useCallback(() => {
      getComposureHistory().then(setComposure);
      reloadSpikes();
      reloadDefusions();
    }, [reloadSpikes, reloadDefusions]),
  );

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
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 48 }}
    >
      <Text className="text-muted text-xs font-bold uppercase tracking-widest">
        Autonomic Acclimation
      </Text>
      <Text className="text-ink text-3xl font-serif-light mt-1">Your Baseline</Text>

      {/* Composure — the headline the whole product reports to. */}
      <ComposureCard history={composure} />

      {/* Stats */}
      <View className="flex-row mt-4 gap-3">
        <StatCard value={`${days.length}`} label="Days Completed" />
        <StatCard value={`${streak}`} label="Day Streak" />
        <StatCard
          value={
            baselineShift === null
              ? '—'
              : `${baselineShift >= 0 ? '+' : ''}${baselineShift.toFixed(1)}`
          }
          label="Baseline Shift"
        />
      </View>

      {/* Control trendline */}
      <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
        <Text className="text-body text-sm font-bold">Control Score</Text>
        <Text className="text-faint text-xs mt-0.5 mb-3">
          Daily 1–5 self-rating (faint) and the 7-day trend (solid). P2/P3 mark phase starts.
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
        {baselineShift !== null && baselineShift > 0 && (
          <Text className="text-accent/80 text-xs mt-3 leading-4">
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
        {insight && (
          <Text className="text-accent-soft text-xs leading-4 mt-4 pt-4 border-t border-line-soft">
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

      <Text className="text-faint text-xs text-center mt-6 leading-4 px-4">
        All of this data lives only on this device.
      </Text>
    </ScrollView>
  );
}
