import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  AudioSource,
} from 'expo-audio';
import { Play, Pause } from 'lucide-react-native';

/**
 * Auditory Anchor player.
 *
 * Deliberately minimal: one play/pause control, a non-interactive progress
 * bar, time remaining. No scrubber — the anchor is designed to be experienced
 * linearly; letting an anxious user skip ahead invites the same
 * checking/controlling behavior the track exists to down-regulate.
 *
 * Background playback: audio continues when the screen locks or the app
 * backgrounds (shouldPlayInBackground + UIBackgroundModes in app.json).
 * playsInSilentMode is set because the iOS mute switch is commonly on —
 * without it, a first-time user hears nothing and assumes the app is broken.
 */

interface AudioPlayerProps {
  title: string;
  /** The day's clinical objective — shown before playback so the prefrontal
   *  cortex knows the target before the entrainment begins. */
  focus?: string;
  source: AudioSource;
  onComplete: () => void;
}

export default function AudioPlayer({ title, focus, source, onComplete }: AudioPlayerProps) {
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const completedRef = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (status.didJustFinish && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [status.didJustFinish]);

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View className="items-center w-full px-2">
      <Text className="text-ink text-2xl font-serif-regular text-center">{title}</Text>
      {focus ? (
        <Text className="text-muted text-sm text-center mt-2 leading-5 px-4">{focus}</Text>
      ) : null}

      {/* Play / Pause — the single control on screen */}
      <TouchableOpacity
        onPress={togglePlayback}
        disabled={!status.isLoaded}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pause the anchor' : 'Play the anchor'}
        accessibilityState={{ disabled: !status.isLoaded }}
        className="w-20 h-20 rounded-full bg-accent items-center justify-center mt-8"
      >
        {!status.isLoaded ? (
          <ActivityIndicator color="#171310" />
        ) : status.playing ? (
          <Pause color="#171310" size={30} fill="#171310" />
        ) : (
          <Play color="#171310" size={30} fill="#171310" style={{ marginLeft: 3 }} />
        )}
      </TouchableOpacity>

      {/* Progress — display only, not a scrubber. No numeric time: a
          countdown is a stopwatch, and clock-watching is the evaluation
          habit the anchor exists to down-regulate. The bar alone says
          "this is moving and it will end" without pricing the track. */}
      <View className="w-full mt-10">
        <View className="h-1.5 bg-surface-deep rounded-full overflow-hidden">
          <View
            className="h-full bg-accent rounded-full"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </View>
      </View>
    </View>
  );
}
