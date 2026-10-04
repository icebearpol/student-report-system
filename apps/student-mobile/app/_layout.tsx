import { CampusProvider } from '@campus/mock-data';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <CampusProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create-report"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Create Report',
            headerStyle: { backgroundColor: '#1B4332' },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
    </CampusProvider>
  );
}
