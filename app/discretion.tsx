import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authenticate, biometricsEnrolled, biometricsPresent } from '../services/biometrics';
import {
  disableDailyReminder,
  enableDailyReminder,
  getReminderTimes,
  notificationsPresent,
  personalReminderBody,
  SHIELDED_REMINDER_BODY,
} from '../services/notifications';
import { ChevronLeft } from 'lucide-react-native';
import { useDiscreet, type DiscretionLevel } from '../context/DiscreetContext';
import { LocalStore } from '../services/storage';

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
 * Live now: the discretion LEVEL (Personal / Shielded — 2026-08-03, build
 * order 1.3, per the CLAUDE.md §6 rewrite) + Face ID gate + app-switcher
 * cover + the daily-reminder toggle. The level is asked HERE and nowhere
 * else, because this is the only screen where he can answer with real
 * information in front of him: the live lock-screen preview above the
 * choice renders exactly what each level shows a stranger. Never silently
 * defaulted — in intro mode "Begin Day 1" waits for the choice; until a
 * choice exists every surface behaves Shielded (the pre-ruling behavior).
 * The three toggles sit underneath the level and stay independently
 * controllable at either setting.
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

// E18's 44×26 toggle. Deepwater role ruling (safety surface): the ON state is
// a settled guarantee, not a next action — it absorbs to ink/ground instead of
// lighting aqua. Three lit toggles would put the "current" everywhere on a
// screen whose whole job is matte calm; accent is reserved for the single
// forward CTA (intro mode's "Begin Day 1").
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
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled: !!disabled }}
      style={{ width: 44, height: 26, borderRadius: 999, padding: 3 }}
      className={on ? 'bg-ink' : 'bg-line'}
    >
      <View
        style={{ width: 20, height: 20, borderRadius: 999 }}
        className={`${on ? 'bg-ground self-end' : 'bg-faint self-start'}`}
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
  const {
    faceId,
    hideSwitcher,
    notifications,
    level,
    setFaceId,
    setHideSwitcher,
    setNotifications,
    setLevel,
  } = useDiscreet();
  const [firstName, setFirstName] = useState<string | null>(null);
  useEffect(() => {
    LocalStore.getItem<string>('@user_first_name').then(setFirstName);
  }, []);

  // The preview renders the level under consideration; before any choice it
  // shows Shielded — the exact behavior an unchosen level produces.
  const previewLevel: DiscretionLevel = level ?? 'shielded';
  const previewBody =
    previewLevel === 'personal'
      ? personalReminderBody(new Date().getDay() + 1, firstName)
      : SHIELDED_REMINDER_BODY;

  const chooseLevel = async (next: DiscretionLevel) => {
    if (next === level) return;
    await setLevel(next); // persists before any reschedule reads it
    // A live schedule must speak at the new level immediately — reschedule
    // with the times he already chose.
    if (notifications) {
      const times = await getReminderTimes();
      if (times && times.length > 0) await enableDailyReminder(times);
    }
  };

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
    // Re-enabling reuses the time(s) Day 1 set; a user who never opted in
    // gets the current hour — the moment he's in the app is his hour.
    const now = new Date();
    const times = (await getReminderTimes()) ?? [
      { hour: now.getHours(), minute: now.getMinutes() },
    ];
    const result = await enableDailyReminder(times);
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
          <ChevronLeft size={16} color="#6E8090" />
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
      )}

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Discretion
      </Text>
      <Text className="text-ink text-[26px] font-serif-regular mt-1.5">
        Unreadable at a glance
      </Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        How Compose appears on your home screen, lock screen, and anywhere outside the app.
      </Text>

      {/* LIVE preview of the daily reminder — rendered exactly like an iOS
          lock-screen banner (icon · title · body · "now") and driven by the
          same copy functions the scheduler uses (personalReminderBody /
          SHIELDED_REMINDER_BODY), so preview and delivery can never drift.
          Showing the banner before asking is the whole trick: he answers the
          level question with the stranger's view in front of him. Matte. */}
      <SectionLabel>On your lock screen</SectionLabel>
      <View className="bg-surface border border-line rounded-[20px] px-3.5 py-3 flex-row items-center gap-3">
        <View className="w-[38px] h-[38px] rounded-[9px] bg-tab border border-line items-center justify-center">
          <Text className="text-muted text-[16px] font-serif-regular">C</Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink text-[13px] font-semibold">Compose</Text>
          <Text className="text-body text-[13px] leading-[17px]">{previewBody}</Text>
        </View>
        <Text className="text-faint text-[11px] self-start">now</Text>
      </View>
      <Text className="text-dim text-[11px] leading-4 mt-2.5">
        {previewLevel === 'personal'
          ? 'One line like this, once a day, at times you choose. Never urgency, never more than this.'
          : 'This is the only notification Compose sends. Never more than this.'}
      </Text>

      {/* The level — asked once, here, with the preview in view. Two cards,
          no pre-selection (never silently defaulted, §6). The selected
          border is the screen's one selection-state accent use. */}
      <SectionLabel>How Compose speaks to you</SectionLabel>
      <View style={{ gap: 10 }}>
        <TouchableOpacity
          onPress={() => chooseLevel('personal')}
          activeOpacity={0.85}
          accessibilityRole="radio"
          accessibilityState={{ selected: level === 'personal' }}
          className={`rounded-2xl px-4 py-[14px] border ${
            level === 'personal' ? 'bg-surface border-accent' : 'bg-surface border-line'
          }`}
        >
          <Text className="text-ink text-sm font-bold">Personal</Text>
          <Text className="text-muted text-[11.5px] mt-1 leading-4">
            The day’s line, with your first name. A real reason to come back — for the man whose
            phone is his own.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => chooseLevel('shielded')}
          activeOpacity={0.85}
          accessibilityRole="radio"
          accessibilityState={{ selected: level === 'shielded' }}
          className={`rounded-2xl px-4 py-[14px] border ${
            level === 'shielded' ? 'bg-surface border-accent' : 'bg-surface border-line'
          }`}
        >
          <Text className="text-ink text-sm font-bold">Shielded</Text>
          <Text className="text-muted text-[11.5px] mt-1 leading-4">
            Neutral and nameless — unremarkable to anyone who glances at your lock screen. You can
            change this any time.
          </Text>
        </TouchableOpacity>
      </View>

      <SectionLabel>Surfaces</SectionLabel>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden">
        <SurfaceRow
          title="Daily reminder"
          subtitle="Exactly as previewed above, at times you choose."
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
        // Deepwater: the forward action (aqua use 2 of ≤4 with the level
        // selection state above). Gated on the level choice — the one
        // question this screen must not let pass unanswered, because every
        // external surface renders from it (never silently defaulted, §6).
        <>
          <TouchableOpacity
            onPress={() => level && router.replace('/(tabs)')}
            disabled={!level}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Begin Day 1"
            accessibilityState={{ disabled: !level }}
            className={`rounded-2xl py-[19px] items-center mt-9 ${level ? 'bg-accent' : 'bg-line'}`}
          >
            <Text className={`font-bold text-base ${level ? 'text-on-accent' : 'text-faint'}`}>
              Begin Day 1
            </Text>
          </TouchableOpacity>
          {!level && (
            <Text className="text-faint text-xs text-center mt-3 leading-4">
              Choose how Compose speaks to you above — then your first session is one tap away.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
