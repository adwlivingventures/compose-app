// Post-purchase telemetry consent (§7 exception) — founder ruling 2026-07-14:
// the ask moved out of the pre-paywall flow to here, between Day Zero's
// purchase and Discreet Mode setup. Asked once, plainly; decline is final and
// total (zero events, including everything buffered during onboarding), and
// the path forward is identical either way.
//
// Chain (2026-08): Day Zero → consent → discretion → Today. Attribution
// deferred to Day 3+ on the Today tab so the first session arrives faster.

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
        router.replace('/discretion?intro=1');
      }}
    />
  );
}
