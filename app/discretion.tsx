import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authenticate, biometricsEnrolled, biometricsPresent } from '../services/biometrics';
import {
  disableDailyReminder,
  enableDailyReminder,
  getReminderTime,
  notificationsPresent,
} from '../services/notifications';
import { ChevronLeft } from 'lucide-react-native';
import { useDiscreet } from '../context/DiscreetContext';

/**
 * Discreet Mode (E18) — "churn insurance," not a settings page.
 *
 * The core user fear is exposure (§3 "lock screen shame"); a user who feels
 * exposed doesn't complain, he silently deletes the app. Every control here
 * converts that fear into a felt guarantee. Surfaced once right after
 * purchase (intro mode) because the moment after paying for a product like
 * this is the moment the exposure fear peaks — buyer's remorse here is
 * privacy panic, and this screen is the antidote.
 *
 * Live now: Face ID gate + app-switcher cover + the daily-reminder toggle.
 * The notifications row governs SCHEDULING only — neutrality itself is not a
 * setting: CLAUDE.md §6 makes the copy a binding rule, so the sub-copy states
 * it as a guarantee whether the reminder is on or off.
 *
 * Founder ruling 2026-07-10: alternate icons are NOT on the roadmap — the
 * icon/name preview section was removed so this screen promises only what
 * ships. The surfaces (notifications, Face ID, app switcher) are the whole
 * pitch.
 */

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-7 mb-3">
      {children}
    </Text>
  );
}

// E18's 44×26 toggle — copper when on, per token spec.
function Toggle({
  on,
  disabled,
  onPress,
}: {
  on: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{ width: 44, height: 26, borderRadius: 999, padding: 3 }}
      className={on ? 'bg-accent' : 'bg-line'}
    >
      <View
        style={{ width: 20, height: 20, borderRadius: 999 }}
        className={`${on ? 'bg-on-accent self-end' : 'bg-faint self-start'}`}
      />
    </TouchableOpacity>
  );
}

function SurfaceRow({
  title,
  subtitle,
  on,
  disabled,
  onToggle,
  last,
}: {
  title: string;
  subtitle: string;
  on: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  last?: boolean;
}) {
  return (
    <View
      className={`px-4 py-[15px] flex-row items-center justify-between ${
        last ? '' : 'border-b border-line-soft'
      }`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-ink text-sm">{title}</Text>
        <Text className="text-muted text-[11.5px] mt-0.5 leading-4">{subtitle}</Text>
      </View>
      <Toggle on={on} disabled={disabled} onPress={onToggle} />
    </View>
  );
}

export default function DiscretionScreen() {
  const router = useRouter();
  const { intro } = useLocalSearchParams<{ intro?: string }>();
  const isIntro = intro === '1';
  const { faceId, hideSwitcher, notifications, setFaceId, setHideSwitcher, setNotifications } =
    useDiscreet();

  const toggleNotifications = async () => {
    if (notifications) {
      await disableDailyReminder();
      setNotifications(false);
      return;
    }
    if (!notificationsPresent) {
      Alert.alert(
        'Reminders Unavailable',
        'Notification support is missing from this build. Update the app and try again.',
      );
      return;
    }
    // Re-enabling reuses the hour Day 1 set; a user who never opted in
    // gets the current hour — the moment he's in the app is his hour.
    const now = new Date();
    const time = (await getReminderTime()) ?? { hour: now.getHours(), minute: now.getMinutes() };
    const result = await enableDailyReminder(time);
    if (result === 'scheduled') {
      setNotifications(true);
    } else if (result === 'denied') {
      Alert.alert(
        'Notifications Are Off for Compose',
        'Allow notifications in your phone settings, then return here.',
      );
    }
  };

  const toggleFaceId = async () => {
    if (faceId) {
      setFaceId(false);
      return;
    }
    if (!biometricsPresent) {
      Alert.alert(
        'Face ID Unavailable',
        'Biometric support is missing from this build. Update the app and try again.',
      );
      return;
    }
    if (!(await biometricsEnrolled())) {
      Alert.alert(
        'Face ID Unavailable',
        'This device has no enrolled Face ID or Touch ID. Set one up in your phone settings, then return here.',
      );
      return;
    }
    // Confirm once before arming the gate — the toggle should never enable
    // a lock the user can't immediately pass.
    if ((await authenticate('Confirm to enable Face ID lock')) === 'success') {
      setFaceId(true);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: isIntro ? 72 : 56, paddingBottom: 48 }}
    >
      {!isIntro && (
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 mb-5 self-start"
        >
          <ChevronLeft size={16} color="#6B7280" />
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
      )}

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Discretion
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">
        Unreadable at a glance
      </Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        How Compose appears on your home screen, lock screen, and anywhere outside the app.
      </Text>

      <SectionLabel>Surfaces</SectionLabel>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden">
        <SurfaceRow
          title="Neutral notifications"
          subtitle={'"Today’s session is ready." Never more.'}
          on={notifications}
          onToggle={toggleNotifications}
        />
        <SurfaceRow
          title="Face ID to open"
          subtitle="A handed-over phone shows nothing."
          on={faceId}
          onToggle={toggleFaceId}
        />
        <SurfaceRow
          title="Hide from app switcher"
          subtitle="Covers the preview card when you switch apps."
          on={hideSwitcher}
          onToggle={() => setHideSwitcher(!hideSwitcher)}
          last
        />
      </View>

      <Text className="text-dim text-xs leading-[17px] mt-3.5">
        Billing is handled by Apple. Your card statement shows Apple — never this app's name.
      </Text>

      {isIntro && (
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
          className="bg-accent rounded-2xl py-[19px] items-center mt-9"
        >
          <Text className="text-on-accent font-bold text-base">Begin Day 1</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
