// B-39/A-39 — Paywall. Layout truth: 3a reference. The offer price renders
// from the RevenueCat offering ONLY ({price} token) — when offerings haven't
// loaded, price copy simply doesn't render (silent retry upstream; no error
// state ever shows in onboarding). "$1,800+" is the therapy comparator, not
// our price. Testimonial row ships dark (gated upstream — nothing renders
// here until a real, consented quote exists).

import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import type { PaywallScreen as PaywallDescriptor } from '../../content/onboarding/types';
import type { ComposureResult } from '../../content/onboarding/composure';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { SecondaryLink } from './chrome';

export const LEGAL_URLS = {
  privacy: 'https://adwlivingventures.github.io/compose-legal/privacy-policy.html',
  terms: 'https://adwlivingventures.github.io/compose-legal/terms-of-use.html',
};

export interface PriceStrings {
  /** Localized, e.g. "$49.99" — from the RC offering's product. */
  price: string;
  /** Localized per-day breakdown, e.g. "$0.67" — derived from the same product. */
  pricePerDay: string | null;
}

export function PaywallFooter({
  onRestore,
  disabled,
}: {
  onRestore: () => void;
  disabled: boolean;
}) {
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 18, marginTop: 12 }}>
      <Pressable onPress={onRestore} disabled={disabled} hitSlop={10}>
        <Text className="text-faint" style={{ fontSize: 10, fontWeight: '300' }}>Restore</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL(LEGAL_URLS.privacy)} hitSlop={10}>
        <Text className="text-faint" style={{ fontSize: 10, fontWeight: '300' }}>Privacy</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL(LEGAL_URLS.terms)} hitSlop={10}>
        <Text className="text-faint" style={{ fontSize: 10, fontWeight: '300' }}>Terms</Text>
      </Pressable>
    </View>
  );
}

export default function Paywall({
  screen,
  result,
  goalEcho,
  prices,
  onContinue,
  onRestore,
  restoring,
  onBack,
  onDevSkip,
  onDevToggleVariant,
  onDevEmberDemo,
}: {
  screen: PaywallDescriptor;
  result: ComposureResult;
  goalEcho: string | null;
  prices: PriceStrings | null;
  onContinue: () => void;
  onRestore: () => void;
  restoring: boolean;
  onBack?: () => void;
  onDevSkip?: () => void;
  onDevToggleVariant?: () => void;
  onDevEmberDemo?: () => void;
}) {
  const recapBars = result.bars.slice(0, 2);
  const offerLabel = prices
    ? screen.offer.label.replace('{price}', prices.price)
    : null;

  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            hitSlop={14}
            className="absolute z-10"
            style={{ top: 58, left: 24 }}
          >
            <ChevronLeft size={17} color="#4B5563" strokeWidth={1.5} />
          </Pressable>
        )}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 62, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {goalEcho && (
            <Text className="font-serif-italic text-accent-deep" style={{ fontSize: 11.5 }}>
              {`${screen.goalEchoPrefix} "${goalEcho}"`}
            </Text>
          )}
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 24, lineHeight: 31, marginTop: 12 }}
          >
            {screen.headline}
          </Text>

          {/* Profile recap chips — the receipt, not the report. */}
          <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
            {recapBars.map((bar) => (
              <View
                key={bar.label}
                className="rounded-full bg-surface"
                style={{ paddingVertical: 4, paddingHorizontal: 10 }}
              >
                <Text className="text-body" style={{ fontSize: 10.5, fontWeight: '300' }}>
                  {`${bar.label} · ${bar.grade}`}
                </Text>
              </View>
            ))}
          </View>
          <Text className="mt-2 text-muted" style={{ fontSize: 10.5, fontWeight: '300' }}>
            {screen.profileRecap.caption}
          </Text>

          {/* Price anchor vs offer. */}
          <View className="mt-4 flex-row" style={{ gap: 10 }}>
            <View
              className="flex-1 rounded-2xl bg-surface"
              style={{ padding: 15, opacity: 0.55 }}
            >
              <Text className="text-muted" style={{ fontSize: 10, fontWeight: '300', letterSpacing: 1 }}>
                SEX THERAPY
              </Text>
              <Text
                className="font-serif-regular text-body"
                style={{ fontSize: 19, marginTop: 8, textDecorationLine: 'line-through' }}
              >
                $1,800+
              </Text>
              <Text className="text-muted" style={{ fontSize: 10.5, fontWeight: '300', marginTop: 4 }}>
                12 weeks
              </Text>
            </View>
            <View
              className="rounded-2xl bg-surface"
              style={{
                flex: 1.2,
                padding: 15,
                borderWidth: 1,
                borderColor: '#C89B6D',
                shadowColor: '#C89B6D',
                shadowOpacity: 0.18,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <Text
                className="text-accent-bright"
                style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1 }}
              >
                COMPOSE · 75 DAYS
              </Text>
              {offerLabel ? (
                <Text className="font-serif-regular text-ink" style={{ fontSize: 21, marginTop: 6 }}>
                  {prices!.price}
                  <Text className="text-accent-deep" style={{ fontSize: 12, fontWeight: '300' }}>
                    {'  once'}
                  </Text>
                </Text>
              ) : (
                <Text className="font-serif-regular text-ink" style={{ fontSize: 17, marginTop: 8 }}>
                  75 days, one payment
                </Text>
              )}
              <Text className="text-body" style={{ fontSize: 10.5, fontWeight: '300', marginTop: 4 }}>
                No subscription. Ever.
              </Text>
            </View>
          </View>

          {/* Risk reversal. */}
          <View className="mt-3 rounded-[14px] bg-surface" style={{ paddingVertical: 13, paddingHorizontal: 15 }}>
            <Text className="text-ink" style={{ fontSize: 12, fontWeight: '500' }}>
              {screen.riskReversal.title}
            </Text>
            <Text
              className="text-body"
              style={{ fontSize: 11, fontWeight: '300', lineHeight: 16.5, marginTop: 3 }}
            >
              {screen.riskReversal.body}
            </Text>
          </View>

          {/* Phase IV — locked (Zeigarnik block). */}
          <View className="mt-4">
            <Text
              className="text-muted"
              style={{ fontSize: 9.5, fontWeight: '600', letterSpacing: 1.5 }}
            >
              {screen.lockedBlock.heading}
            </Text>
            <Text
              className="text-body"
              style={{ fontSize: 11.5, fontWeight: '300', lineHeight: 17.5, marginTop: 6 }}
            >
              {screen.lockedBlock.body}
            </Text>
            <View className="mt-2" style={{ gap: 6 }}>
              {screen.lockedBlock.features.map((f) => (
                <View key={f.title} className="flex-row items-center" style={{ gap: 9 }}>
                  <Lock size={11} color="#4B5563" strokeWidth={1.5} />
                  <Text
                    className="flex-1 text-muted"
                    style={{ fontSize: 11.5, fontWeight: '300' }}
                  >
                    <Text style={{ fontWeight: '400' }}>{f.title}</Text>
                    {` — ${f.description}`}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="mt-2 text-faint" style={{ fontSize: 10.5, fontWeight: '300' }}>
              {screen.lockedBlock.footer}
            </Text>
          </View>

          <Text
            className="mt-4 font-serif-italic text-accent-deep"
            style={{ fontSize: 12 }}
          >
            {screen.positioningLine}
          </Text>
          <Text
            className="mt-3 text-muted"
            style={{ fontSize: 10.5, fontWeight: '300', lineHeight: 16 }}
          >
            {screen.trustCard}
          </Text>
        </ScrollView>

        <View className="px-6 pb-10" style={{ paddingTop: 12 }}>
          <EmissiveCTA label={screen.button} onPress={onContinue} paddingVertical={18} />
          <PaywallFooter onRestore={onRestore} disabled={restoring} />
          {__DEV__ && (onDevSkip || onDevToggleVariant || onDevEmberDemo) && (
            <View className="flex-row justify-center" style={{ gap: 20 }}>
              {onDevSkip && <SecondaryLink label="Skip paywall (dev)" onPress={onDevSkip} />}
              {onDevToggleVariant && (
                <SecondaryLink label="View other variant (dev)" onPress={onDevToggleVariant} />
              )}
              {onDevEmberDemo && (
                <SecondaryLink label="Ember demo (dev)" onPress={onDevEmberDemo} />
              )}
            </View>
          )}
        </View>
      </View>
    </ScreenFade>
  );
}
