// Post-purchase telemetry consent (§7 exception) — founder ruling 2026-07-14:
// the ask moved out of the pre-paywall flow to here, between Day Zero's
// purchase and Discreet Mode setup. Asked once, plainly; decline is final and
// total (zero events, including everything buffered during onboarding), and
// the path forward is identical either way.
//
// 2026-08-03 (build order 1.2): the chain gained the attribution ask directly
// after this screen — consent decided first, so the attribution answer knows
// whether it may ride telemetry. Chain: Day Zero → consent → attribution →
// discretion → Today.

import { useRouter } from 'expo-router';
import ConsentScreenView from '../components/onboarding/ConsentScreen';
import { CONSENT_SCREEN } from '../content/onboarding/screens';
import { setTelemetryConsent } from '../services/analytics';

export default function Consent() {
  const router = useRouter();
  return (
    <ConsentScreenView
      screen={CONSENT_SCREEN}
      onDecision={(granted) => {
        setTelemetryConsent(granted);
        router.replace('/attribution');
      }}
    />
  );
}
