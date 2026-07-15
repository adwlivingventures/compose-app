// Post-purchase rating ask — reached from /recap only when the native
// review module is available and no prior ask engaged him (services/
// rating.ts). Either button lands on /consent; the path forward is
// identical, per the same no-pressure contract as the consent screen.

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import RatingAsk from '../components/RatingAsk';
import { markAsked } from '../services/rating';

export default function Rate() {
  const router = useRouter();
  useEffect(() => {
    markAsked(); // shown once, ever
  }, []);
  return <RatingAsk eyebrow="Before you begin" onDone={() => router.replace('/consent')} />;
}
