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
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: 'Create Account', headerShown: true }} />
        <Stack.Screen name="anonymous" options={{ headerShown: false }} />
        <Stack.Screen name="issues" options={{ title: 'Public Issues', headerTintColor: '#fff', headerStyle:{backgroundColor: theme.colors.gradientStart} as any }} />
        <Stack.Screen name="public-map" options={{ title: 'Public Map' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen
          name="emergency"
          options={{ title: 'Emergency', presentation: 'modal' }}
        />
        <Stack.Screen name="my-reports" options={{ title: 'My Reports' }} />
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
