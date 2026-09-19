import { Redirect } from 'expo-router';
// Separate anonymous entry per user choice — initial route is /anonymous
export default function Index() {
  return <Redirect href="/anonymous" />;
}
