import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/constants/theme';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function RootLayout() {
  useEffect(() => {
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}, []);
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: 'Create Account', headerShown: true }} />
        <Stack.Screen name="anonymous" options={{ headerShown: false }} />
        <Stack.Screen name="issues" options={{ title: 'Public Issues', headerTintColor: '#fff', headerStyle:{backgroundColor: theme.colors.gradientStart} as any }} />
        <Stack.Screen name="my-reports" options={{ title: 'My Reports' }} />
        <Stack.Screen name="map-picker" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="campus-map" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="emergency" options={{ title: 'Emergency' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat with Admin' }} />
        <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
        <Stack.Screen
          name="report/[id]"
          options={{ title: 'Report Details', presentation: 'card' }}
        />
        <Stack.Screen
          name="new-report"
          options={{ title: 'New Report', presentation: 'modal', gestureEnabled: false, headerShown: false }}
        />
      </Stack>
    </>
  );
}
