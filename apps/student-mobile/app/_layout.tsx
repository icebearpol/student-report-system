import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="report/[id]"
          options={{ title: 'Report Details', presentation: 'card' }}
        />
        <Stack.Screen
          name="new-report"
          options={{ title: 'New Report', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
