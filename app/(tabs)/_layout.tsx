import { Tabs } from 'expo-router';
import DeepwaterTabBar from '../../components/DeepwaterTabBar';

/**
 * Deepwater tab shell — five tabs, Today raised at center (founder ruling
 * 2026-07-25; spec: claude/DEEPWATER-FLOW-MAP.md §3).
 *
 * Order: Protocol · Steady · TODAY (center node) · Baseline · You.
 * The bar itself is components/DeepwaterTabBar.tsx — the center node is the
 * only luminous object in it, and it carries the day-state ring.
 */
export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <DeepwaterTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#0A0F16' },
      }}
    >
      <Tabs.Screen name="protocol" options={{ title: 'Protocol' }} />
      {/* Route name stays `cbst` (file unrenamed to avoid nav churn) — the
          surface is the Steady tab (docs/STEADY-TAB-SPEC.md). */}
      <Tabs.Screen name="cbst" options={{ title: 'Steady' }} />
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="progress" options={{ title: 'Baseline' }} />
      <Tabs.Screen name="profile" options={{ title: 'You' }} />
    </Tabs>
  );
}
