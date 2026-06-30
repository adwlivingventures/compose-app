import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface AnimatedPacerProps {
  onCycleComplete?: (currentCycle: number) => void;
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
}

/**
 * AnimatedPacer runs an 8-second pacing cycle entirely on the device's
 * native UI thread using React Native Reanimated. This guarantees consistent,
 * smooth, 60fps animations to ensure zero loss of somatic focus.
 */
export const AnimatedPacer: React.FC<AnimatedPacerProps> = ({ 
  onCycleComplete, 
  isActive, 
  onToggleActive 
}) => {
  const [pacingLabel, setPacingLabel] = useState<'Prepare' | 'Drop & Expand' | 'Relax to Neutral'>('Prepare');
  const [cycleCount, setCycleCount] = useState<number>(0);
  
  // Shared animation values executed on UI Thread
  const animationScale = useSharedValue(0.75);
  const pulseOpacity = useSharedValue(0.4);

  // Native UI thread callback hooks to update JavaScript side states
  const updateLabelJS = (phase: 'expand' | 'contract') => {
    if (phase === 'expand') {
      setPacingLabel('Drop & Expand');
      setCycleCount(prev => prev + 1);
    } else {
      setPacingLabel('Relax to Neutral');
    }
  };

  const triggerCycleCallbackJS = () => {
    if (onCycleComplete) {
      onCycleComplete(cycleCount);
    }
  };

  useEffect(() => {
    if (isActive) {
      setPacingLabel('Drop & Expand');
      setCycleCount(1);

      // Loop expansion/contraction transitions smoothly (4s expand/inhale, 4s contract/exhale)
      animationScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { 
            duration: 4000, 
            easing: Easing.bezier(0.42, 0, 0.58, 1)
          }, (finished) => {
            if (finished) runOnJS(updateLabelJS)('contract');
          }),
          withTiming(0.75, { 
            duration: 4000, 
            easing: Easing.bezier(0.42, 0, 0.58, 1) 
          }, (finished) => {
            if (finished) {
              runOnJS(updateLabelJS)('expand');
              runOnJS(triggerCycleCallbackJS)();
            }
          })
        ),
        -1,
        false
      );

      // Smooth background aura glow animation
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      );
    } else {
      // Return parameters smoothly to default baseline values
      animationScale.value = withTiming(0.75, { duration: 500 });
      pulseOpacity.value = withTiming(0.4, { duration: 500 });
      setPacingLabel('Prepare');
    }
  }, [isActive]);

  const animatedOuterRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animationScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  const animatedCoreCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animationScale.value * 0.95 }],
    };
  });

  return (
    <View className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] w-full">
      <View className="relative w-44 h-44 flex items-center justify-center">
        {/* Animated Somatic Aura Background Circle */}
        <Animated.View 
          style={animatedOuterRingStyle}
          className="absolute w-36 h-36 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        />

        {/* Core Calibration Data Display */}
        <Animated.View 
          style={animatedCoreCircleStyle}
          className="absolute w-28 h-28 rounded-full bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center"
        >
          <Text className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            {isActive ? `CYCLE ${cycleCount}` : 'PACER IDLE'}
          </Text>
          <Text className="text-center font-sans font-bold text-sm text-white mt-1 h-10 px-2 flex items-center justify-center">
            {pacingLabel}
          </Text>
        </Animated.View>
      </View>

      <TouchableOpacity
        onPress={() => onToggleActive(!isActive)}
        activeOpacity={0.8}
        className={`mt-6 px-8 py-3 rounded-xl border font-sans font-bold text-xs transition-all tracking-wide ${
          isActive 
            ? 'bg-slate-950 border-slate-800 text-slate-400' 
            : 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/15'
        }`}
      >
        <Text style={styles.textInactive}>
          {isActive ? 'Pause Grounding Session' : 'Begin 5-Min Somatic Track'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textActive: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 12
  },
  textInactive: {
    color: '#020617',
    fontWeight: '800',
    fontSize: 12
  }
});
