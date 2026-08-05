import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useDiscreet } from '../context/DiscreetContext';
import {
  enableDailyReminder,
  getReminderTimes,
  notificationsPresent,
  SHIELDED_REMINDER_BODY,
  type ReminderTime,
} from '../services/notifications';
import { LocalStore } from '../services/storage';

const DISMISS_KEY = '@reminder_backstop_dismissed';

/**
 * Day 3+ nudge for users who skipped both reminder opt-ins (Discretion
 * toggle and Day-1 post-session ask). Matte card — no urgency framing.
 */

export function useReminderBackstop(activeDay: number) {
  const { notifications, setNotifications } = useDiscreet();
  const [needsNudge, setNeedsNudge] = useState(false);

  React.useEffect(() => {
    if (activeDay < 3 || notifications) {
      setNeedsNudge(false);
      return;
    }
    Promise.all([
      LocalStore.getItem<boolean>(DISMISS_KEY),
      getReminderTimes(),
    ]).then(([dismissed, times]) => {
      setNeedsNudge(!dismissed && (!times || times.length === 0));
    });
  }, [activeDay, notifications]);

  const dismiss = async () => {
    await LocalStore.setItem(DISMISS_KEY, true);
    setNeedsNudge(false);
  };

  return { show: needsNudge, dismiss, setNotifications };
}

export default function ReminderBackstopCard({
  onDismiss,
  onScheduled,
}: {
  onDismiss: () => void;
  onScheduled: () => void;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [reminderHours, setReminderHours] = useState<number[]>([20]);
  const [enabling, setEnabling] = useState(false);

  const chipHours = [8, 12, 18, 20, 21];
  const hourLabel = (h: number) =>
    h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

  const toggleHour = (hour: number) => {
    setReminderHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour],
    );
  };

  const schedule = async () => {
    if (enabling || reminderHours.length === 0 || !notificationsPresent) return;
    setEnabling(true);
    const times: ReminderTime[] = [...reminderHours]
      .sort((a, b) => a - b)
      .map((hour) => ({ hour, minute: 0 }));
    const result = await enableDailyReminder(times);
    if (result === 'scheduled') onScheduled();
    setEnabling(false);
    onDismiss();
  };

  return (
    <View className="bg-surface border border-line rounded-2xl px-[18px] py-4 mb-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
            Daily line
          </Text>
          <Text className="text-ink text-[15px] font-serif-regular mt-1">
            Want a quiet reminder when today's session is ready?
          </Text>
          <Text className="text-muted text-xs mt-1 leading-4">
            One line at a time you choose — never a streak warning.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Dismiss reminder suggestion"
        >
          <X color="#53626E" size={14} />
        </TouchableOpacity>
      </View>

      {!expanded ? (
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            onPress={() => setExpanded(true)}
            activeOpacity={0.85}
            className="flex-1 bg-surface-deep border border-line rounded-xl py-3 items-center"
          >
            <Text className="text-ink text-[13px] font-semibold">Pick a time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/discretion')}
            activeOpacity={0.7}
            className="flex-1 border border-line rounded-xl py-3 items-center"
          >
            <Text className="text-muted text-[13px] font-semibold">Discretion settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View className="bg-surface-deep border border-line rounded-[14px] px-4 py-3 mt-4">
            <Text className="text-ink text-[13px] font-bold">Compose</Text>
            <Text className="text-body text-[13px] mt-0.5">{SHIELDED_REMINDER_BODY}</Text>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-4">
            {chipHours.map((h) => {
              const on = reminderHours.includes(h);
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => toggleHour(h)}
                  activeOpacity={0.8}
                  className={`px-4 py-[9px] rounded-full border ${
                    on ? 'bg-accent border-accent' : 'bg-surface border-line'
                  }`}
                >
                  <Text
                    className={`text-[13px] font-semibold ${on ? 'text-on-accent' : 'text-muted'}`}
                  >
                    {hourLabel(h)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            onPress={schedule}
            disabled={enabling || reminderHours.length === 0}
            activeOpacity={0.85}
            className={`rounded-xl py-3 items-center mt-4 ${
              reminderHours.length === 0 ? 'bg-line' : 'bg-accent'
            }`}
          >
            {enabling ? (
              <ActivityIndicator color="#06232A" />
            ) : (
              <Text className="text-on-accent font-bold text-sm">Remind me</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
