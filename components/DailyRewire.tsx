import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { LocalStore } from '../services/storage';
import { rewireForDay } from '../content/rewires';
import { REWIRE_COPY } from '../content/restructure';
import { quoteForDay, statementsForDay } from '../content/rewireDaily';

/**
 * Daily Rewire — hold to cross out (extracted from the Restructure tab,
 * founder ruling 2026-07-15: the Rewire is now the daily session's own
 * stage, one deliberate rep inside the loop rather than a separate visit).
 *
 * Extended 2026-07-18 (founder direction): the stage now carries three
 * voices, in a deliberate order —
 *
 *   1. The day's word — one verbatim Napoleon Hill line (public-domain 1937
 *      text; content/rewireDaily.ts). Borrowed authority: an external voice
 *      with zero clinical shame-load frames the rep before it starts.
 *   2. The rep — press-and-hold crosses out the old script (embodied
 *      defusion + commitment gesture; a tap is ignorable, a 1.2s hold is a
 *      decision), then the truth is read at a paced line.
 *   3. His own voice — the day's three “I am” statements, revealed one at a
 *      time, advanced by tap. One tap per statement is the commitment
 *      device: each line gets its own reading (generation effect), never a
 *      skimmed block. Fixed triads recur once per 25-day phase — by the
 *      second encounter he has ~25 days of behavioral evidence behind the
 *      sentence, which is what turns rehearsal into recognition.
 *
 * Completion (and the training item, via onComplete) fires only after the
 * third statement — the identity claim is part of the rep, not decoration.
 * Completion persists under the same key the tab used, so a day is never
 * asked for two reps.
 */

const REWIRE_DONE_KEY = '@daily_rewire_done';

type RewireStage = 'hold' | 'read' | 'affirm' | 'done';

export default function DailyRewire({
  day,
  onComplete,
  persist = true,
}: {
  day: number;
  /** Fires when today's rep completes fresh (never on a revisit). */
  onComplete?: () => void;
  /** false in replay mode (app/session.tsx): the rep can be redone, but
   *  nothing is written — a replayed day never touches stored state. */
  persist?: boolean;
}) {
  const rewire = rewireForDay(day);
  const quote = quoteForDay(day);
  const statements = statementsForDay(day);
  const [stage, setStage] = useState<RewireStage>('hold');
  const [affirmIndex, setAffirmIndex] = useState(0);
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
    if (persist) await LocalStore.setItem(REWIRE_DONE_KEY, day);
    onCompleteRef.current?.();
  }, [day, persist]);

  const beginRead = useCallback(() => {
    setStage('read');
    Animated.timing(readProgress, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      // The paced read now hands off to the statements rather than closing
      // the stage — the rep ends in his own voice, not the app's.
      if (finished) setStage('affirm');
    });
  }, [readProgress]);

  const advanceAffirm = useCallback(() => {
    if (affirmIndex < statements.length - 1) {
      setAffirmIndex(affirmIndex + 1);
    } else {
      complete();
    }
  }, [affirmIndex, statements.length, complete]);

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
    <View>
      {/* The day's word — unboxed epigraph (accent scarcity §6: the quote
          absorbs; the interactive card below carries the emphasis). */}
      <View className="px-1 mb-5">
        <Text className="text-muted text-[10px] font-bold uppercase tracking-widest">
          Today's word
        </Text>
        {/* Attribution deliberately not rendered (founder ruling 2026-07-18):
            the line lands as the app's own voice; provenance stays documented
            in content/rewireDaily.ts and docs/research/HILL-QUOTE-LIBRARY.md. */}
        <Text className="text-ink text-[15px] leading-6 font-serif-regular mt-2">
          “{quote.text}”
        </Text>
      </View>

      <View className="bg-surface border border-line rounded-2xl p-5">
        <View className="flex-row items-center justify-between">
          {/* Accent unification (founder ruling 2026-07-25): one accent only —
              the Rewire's chrome runs muted; progress and the done check run
              the aqua current. */}
          <Text className="text-muted text-xs font-bold uppercase tracking-widest">
            Daily Rewire
          </Text>
          {stage === 'done' ? (
            <CheckCircle2 color="#5FD4C1" size={16} />
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
                  is the aqua accent token. */}
              <Animated.View
                style={{
                  height: '100%',
                  borderRadius: 9999,
                  backgroundColor: '#5FD4C1',
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
            <Text className="text-muted text-xs mt-4 mb-1.5 font-bold uppercase tracking-wider">
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
                      backgroundColor: '#5FD4C1',
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
                <Text className="text-ink text-xs font-serif-italic mt-1">
                  {day === 1
                    ? 'The first deliberate rep against the old belief system.'
                    : `${day} deliberate reps against the old belief system.`}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* His own voice — one statement at a time; the tap is the rep. */}
      {stage === 'affirm' && (
        <Pressable onPress={advanceAffirm}>
          <View className="bg-surface border border-line rounded-2xl p-5 mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted text-xs font-bold uppercase tracking-widest">
                In your own voice
              </Text>
              <Text className="text-dim text-[10px] font-semibold tracking-[0.08em]">
                {affirmIndex + 1} of {statements.length}
              </Text>
            </View>
            <Text className="text-ink text-[17px] leading-7 font-serif-italic mt-3.5">
              {statements[affirmIndex].text}
            </Text>
            <Text className="text-dim text-[11px] mt-4">
              Say it to yourself — slowly, like you mean it — then tap.
            </Text>
            <View className="flex-row gap-1.5 mt-3">
              {statements.map((s, i) => (
                <View
                  key={s.id}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i <= affirmIndex ? 'bg-accent' : 'bg-surface-deep'
                  }`}
                />
              ))}
            </View>
          </View>
        </Pressable>
      )}

      {/* Revisit: the triad stands as a quiet record, no re-run demanded. */}
      {stage === 'done' && (
        <View className="px-1 mt-4">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Today, in your own voice
          </Text>
          {statements.map((s) => (
            <Text
              key={s.id}
              className="text-body text-[13px] leading-5 font-serif-italic mt-1"
            >
              {s.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
