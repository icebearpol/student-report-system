import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: once you have real auth state, check it here and
  // redirect to '/(tabs)' if the user is already logged in.
  return <Redirect href="/login" />;
}