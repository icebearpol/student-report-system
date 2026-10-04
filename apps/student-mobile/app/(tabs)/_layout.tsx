import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '@campus/ui-components';

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
          }}
        />
        <Tabs.Screen
          name="issues"
          options={{
            title: 'Public Issues',
            tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} />,
          }}
        />
        <Tabs.Screen
          name="tracking"
          options={{
            title: 'My Reports',
            tabBarIcon: ({ color }) => <TabIcon emoji="📍" color={color} />,
          }}
        />
      </Tabs>

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/create-report')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
