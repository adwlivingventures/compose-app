import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { LocalStore } from '../services/storage';
import { rewireForDay } from '../content/rewires';
import { REWIRE_COPY } from '../content/restructure';

/**
 * Daily Rewire — hold to cross out (extracted from the Restructure tab,
 * founder ruling 2026-07-15: the Rewire is now the daily session's own
 * stage, one deliberate rep inside the loop rather than a separate visit).
 *
 * The mechanics are unchanged: press-and-hold crosses out the old script
 * (embodied defusion + commitment gesture — a tap is ignorable, a 1.2s
 * hold is a decision), then the truth is read at a paced line (repetition
 * delivered feeling-paired; never skimmed).
 *
 * Completion persists under the same key the tab used, so a day is never
 * asked for two reps.
 */

const REWIRE_DONE_KEY = '@daily_rewire_done';

type RewireStage = 'hold' | 'read' | 'done';

export default function DailyRewire({
  day,
  onComplete,
}: {
  day: number;
  /** Fires when today's rep completes fresh (never on a revisit). */
  onComplete?: () => void;
}) {
  const rewire = rewireForDay(day);
  const [stage, setStage] = useState<RewireStage>('hold');
  const holdProgress = useRef(new Animated.Value(0)).current;
  const readProgress = useRef(new Animated.Value(0)).current;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Already done today: show the done state, but do NOT fire onComplete —
    // a revisit must not auto-advance the session past this stage.
    LocalStore.getItem<number>(REWIRE_DONE_KEY).then((d) => {
      if (d === day) setStage('done');
    });
  }, [day]);

  const complete = useCallback(async () => {
    setStage('done');
    await LocalStore.setItem(REWIRE_DONE_KEY, day);
    onCompleteRef.current?.();
  }, [day]);

  const beginRead = useCallback(() => {
    setStage('read');
    Animated.timing(readProgress, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) complete();
    });
  }, [readProgress, complete]);

  const onPressIn = () => {
    if (stage !== 'hold') return;
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) beginRead();
    });
  };

  const onPressOut = () => {
    if (stage !== 'hold') return;
    holdProgress.stopAnimation(() => {
      Animated.timing(holdProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const crossedOut = stage !== 'hold';

  return (
    <View className="bg-surface border border-line rounded-2xl p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-accent text-xs font-bold uppercase tracking-widest">
          Daily Rewire
        </Text>
        {stage === 'done' ? (
          <CheckCircle2 color="#C89B6D" size={16} />
        ) : (
          <Text className="text-dim text-[10px] font-semibold tracking-[0.08em]">
            Rep {day} of 75
          </Text>
        )}
      </View>

      <Text className="text-muted text-xs mt-3 mb-1.5 font-bold uppercase tracking-wider">
        The old script
      </Text>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={crossedOut}>
        <Text
          className={`text-[15px] leading-6 font-serif-italic ${
            crossedOut ? 'text-dim' : 'text-muted'
          }`}
          style={{ textDecorationLine: crossedOut ? 'line-through' : 'none' }}
        >
          “{rewire.oldScript}”
        </Text>
      </Pressable>

      {stage === 'hold' && (
        <>
          <Text className="text-dim text-[11px] mt-3">{REWIRE_COPY.holdHint}</Text>
          <View className="h-[2px] bg-line-soft rounded-full overflow-hidden mt-2">
            {/* Animated fills use inline style — NativeWind className
                interop on Animated components isn't guaranteed; the color
                is the Ember accent token. */}
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 9999,
                backgroundColor: '#C89B6D',
                width: holdProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </>
      )}

      {crossedOut && (
        <>
          <Text className="text-accent text-xs mt-4 mb-1.5 font-bold uppercase tracking-wider">
            {REWIRE_COPY.truthLabel}
          </Text>
          <Text className="text-ink text-[15px] leading-6 font-serif-regular">
            {rewire.truth}
          </Text>

          {stage === 'read' && (
            <>
              <Text className="text-muted text-xs mt-4">{REWIRE_COPY.readInstruction}</Text>
              <View className="h-[2px] bg-line-soft rounded-full overflow-hidden mt-2">
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 9999,
                    backgroundColor: '#C89B6D',
                    width: readProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>
            </>
          )}

          {stage === 'done' && (
            <View className="border-t border-line-soft mt-4 pt-3">
              <Text className="text-faint text-xs">{REWIRE_COPY.doneLine}</Text>
              <Text className="text-accent-soft text-xs font-serif-italic mt-1">
                {day === 1
                  ? 'The first deliberate rep against the old belief system.'
                  : `${day} deliberate reps against the old belief system.`}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
