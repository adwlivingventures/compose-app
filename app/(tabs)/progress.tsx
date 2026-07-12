import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { useProtocol, HabitState } from '../../context/ProtocolContext';
import {
  getBaseline,
  getComposureHistory,
  type ComposureMeasurement,
} from '../../services/composureHistory';

/**
 * Progress — "Autonomic Acclimation."
 *
 * This screen is the product's proof-of-change artifact: the user's own
 * daily 1–5 control scores plotted over the protocol. Self-reported data he
 * generated himself is the one form of evidence the anxious brain can't
 * dismiss as marketing — and at Day 75 it's what makes continuing feel like
 * protecting an investment. Display only; no goals, no grades, no red.
 */

const CHART_W = 320;
const CHART_H = 150;
const PAD_X = 10;
const PAD_Y = 14;

function ControlChart({ points }: { points: { day: number; score: number }[] }) {
  if (points.length < 2) return null;

  const xFor = (i: number) =>
    PAD_X + (i / (points.length - 1)) * (CHART_W - PAD_X * 2);
  const yFor = (score: number) =>
    CHART_H - PAD_Y - ((score - 1) / 4) * (CHART_H - PAD_Y * 2);

  const poly = points.map((p, i) => `${xFor(i)},${yFor(p.score)}`).join(' ');

  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {/* Reference lines at scores 1–5 */}
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
      <Polyline
        points={poly}
        fill="none"
        stroke="#C89B6D"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <Circle key={p.day} cx={xFor(i)} cy={yFor(p.score)} r={3} fill="#C89B6D" />
      ))}
    </Svg>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 bg-surface border border-line rounded-2xl p-4">
      <Text className="text-accent text-2xl font-serif-light">{value}</Text>
      <Text className="text-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

const HABIT_LABELS: { key: keyof HabitState; label: string }[] = [
  { key: 'presence', label: 'Presence Work' },
  { key: 'focus', label: 'Clean Focus' },
  { key: 'vitality', label: 'Vitality Habit' },
];

export default function ProgressScreen() {
  const { completedDays, streak } = useProtocol();

  // Composure measurements (Day 0 baseline + the 14/40/75 re-measurements),
  // re-read on focus so a reading taken minutes ago shows up immediately.
  const [composureHistory, setComposureHistory] = useState<ComposureMeasurement[]>([]);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getComposureHistory().then((history) => {
        if (alive) setComposureHistory(history);
      });
      return () => {
        alive = false;
      };
    }, []),
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
    .map((d) => ({ day: d.day, score: d.pelvicRating }));

  // Baseline shift: average of the most recent 7 scores vs the first 7.
  // Needs enough data to mean anything — otherwise we're still calibrating.
  const enoughData = scores.length >= 10;
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const baselineShift = enoughData
    ? avg(scores.slice(-7).map((s) => s.score)) - avg(scores.slice(0, 7).map((s) => s.score))
    : null;

  const habitPct = (key: keyof HabitState) =>
    days.length === 0
      ? 0
      : Math.round((days.filter((d) => d.habits?.[key]).length / days.length) * 100);

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 48 }}
    >
      <Text className="text-muted text-xs font-bold uppercase tracking-widest">
        Autonomic Acclimation
      </Text>
      <Text className="text-ink text-3xl font-serif-light mt-1">Your Baseline</Text>

      {/* Stats */}
      <View className="flex-row mt-6 gap-3">
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

      {/* Composure measurements — the "measured, not promised" ledger.
          Matte on purpose: this screen's sand is spent on the stat values
          and the trendline; the ledger is evidence, not a next step. */}
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

      {/* Control trendline */}
      <View className="mt-6 bg-surface border border-line rounded-2xl p-5">
        <Text className="text-body text-sm font-bold">Control Score</Text>
        <Text className="text-faint text-xs mt-0.5 mb-3">
          Your daily 1–5 self-rating across the protocol
        </Text>
        {scores.length >= 2 ? (
          <ControlChart points={scores} />
        ) : (
          <Text className="text-muted text-sm leading-5 py-6 text-center">
            Your first data points arrive with your first sessions.{'\n'}This is where
            you'll watch your baseline change.
          </Text>
        )}
        {baselineShift !== null && baselineShift > 0 && (
          <Text className="text-accent/80 text-xs mt-3 leading-4">
            Your recent control scores average {baselineShift.toFixed(1)} higher than your
            first week. That shift is your nervous system re-learning its baseline — not
            willpower, conditioning.
          </Text>
        )}
      </View>

      {/* Habit consistency */}
      <View className="mt-4 bg-surface border border-line rounded-2xl p-5">
        <Text className="text-body text-sm font-bold mb-4">Vitality Consistency</Text>
        <View className="gap-4">
          {HABIT_LABELS.map(({ key, label }) => {
            const pct = habitPct(key);
            return (
              <View key={key}>
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-body text-xs">{label}</Text>
                  <Text className="text-muted text-xs">{pct}%</Text>
                </View>
                <View className="h-1.5 bg-surface-deep rounded-full overflow-hidden">
                  <View
                    className="h-full bg-accent/70 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <Text className="text-faint text-xs text-center mt-6 leading-4 px-4">
        All of this data lives only on this device.
      </Text>
    </ScrollView>
  );
}
