import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
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
  /**
   * Renders a grab handle and makes it live: drag follows the finger,
   * release past the threshold closes, otherwise springs back. Without it
   * no handle is drawn — an affordance that doesn't work is a broken
   * promise (founder review 2026-07-10).
   */
  draggable?: boolean;
  /** Scrim styling — pass an opaque class to fully hide the screen behind
   *  (e.g. the SOS sheet must never show the tab bar). */
  scrimClass?: string;
  /** The sheet panel itself — bring your own background/radius/padding. */
  children: React.ReactNode;
}

const CLOSE_DRAG_PX = 110;

export default function BottomSheet({
  visible,
  onClose,
  draggable = false,
  scrimClass = 'bg-scrim/80',
  children,
}: BottomSheetProps) {
  // Stay mounted through the exit animation.
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.setValue(0);
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_e, g) => {
        drag.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > CLOSE_DRAG_PX || g.vy > 1.1) {
          onClose();
          // Reset after the exit animation so the next open starts seated.
          setTimeout(() => drag.setValue(0), 260);
        } else {
          Animated.spring(drag, {
            toValue: 0,
            useNativeDriver: true,
            speed: 16,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Pressable className={`flex-1 ${scrimClass}`} onPress={onClose} />
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
                translateY: Animated.add(
                  progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [640, 0],
                  }),
                  drag,
                ),
              },
            ],
          }}
        >
          {draggable && (
            <View
              {...panResponder.panHandlers}
              // Generous invisible grab area over the sheet's top edge; the
              // visible handle is drawn by the sheet content underneath.
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 44,
                zIndex: 10,
              }}
            />
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
