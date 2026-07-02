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
  source: AudioSource;
  onComplete: () => void;
}

function formatTime(seconds: number): string {
  const totalSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function AudioPlayer({ title, source, onComplete }: AudioPlayerProps) {
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
  const remaining = status.duration - status.currentTime;

  return (
    <View className="items-center w-full px-2">
      <Text className="text-white text-xl font-bold text-center">{title}</Text>

      {/* Play / Pause — the single control on screen */}
      <TouchableOpacity
        onPress={togglePlayback}
        disabled={!status.isLoaded}
        activeOpacity={0.85}
        className="w-20 h-20 rounded-full bg-emerald-500 items-center justify-center mt-8 shadow-lg shadow-emerald-500/20"
      >
        {!status.isLoaded ? (
          <ActivityIndicator color="#020617" />
        ) : status.playing ? (
          <Pause color="#020617" size={30} fill="#020617" />
        ) : (
          <Play color="#020617" size={30} fill="#020617" style={{ marginLeft: 3 }} />
        )}
      </TouchableOpacity>

      {/* Progress — display only, not a scrubber */}
      <View className="w-full mt-10">
        <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-slate-600 text-xs">{formatTime(status.currentTime)}</Text>
          <Text className="text-slate-600 text-xs">
            {status.duration > 0 ? `−${formatTime(remaining)}` : '–:––'}
          </Text>
        </View>
      </View>
    </View>
  );
}
