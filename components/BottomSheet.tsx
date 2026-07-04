import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';

/**
 * BottomSheet — scrim fades in place while the panel slides up.
 *
 * RN's stock Modal animates its entire content as one unit, so a
 * transparent modal either slides its scrim up with the sheet (leaving the
 * top of the screen un-dimmed mid-animation) or fades the sheet in with no
 * slide at all. Native sheets do both at once: dim the room, then raise
 * the panel. This drives the two layers from one Animated.Value so they
 * always finish together, and defers unmount until the exit animation
 * lands so closing is as composed as opening.
 */

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The sheet panel itself — bring your own background/radius/padding. */
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  // Stay mounted through the exit animation.
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Pressable className="flex-1 bg-scrim/80" onPress={onClose} />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        className="flex-1 justify-end"
      >
        <Animated.View
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [640, 0],
                }),
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
