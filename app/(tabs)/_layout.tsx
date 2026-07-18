import { Tabs } from 'expo-router';
import { LayoutDashboard, Anchor, TrendingUp, UserRound } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#080A0F' },
        tabBarStyle: { backgroundColor: '#0C0F16', borderTopColor: '#1B2233' },
        tabBarActiveTintColor: '#C89B6D',
        tabBarInactiveTintColor: '#4B5563',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      {/* Route name stays `cbst` (file unrenamed to avoid nav churn) — the
          surface is the Steady tab (docs/STEADY-TAB-SPEC.md). */}
      <Tabs.Screen
        name="cbst"
        options={{
          title: 'Steady',
          tabBarIcon: ({ color, size }) => <Anchor color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Baseline',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
