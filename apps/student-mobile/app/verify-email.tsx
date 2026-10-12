import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, verifyEmail, resendVerification } from '@/lib/auth';
import { theme } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    getCurrentUser().then((u) => setEmail(u?.email || ''));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const leave = () => {
    if (from === 'signup') {
      router.replace('/complete-profile');
    } else {
      router.back();
    }
  };

  const submit = async () => {
    if (code.length !== 6) {
      Alert.alert('Enter the code', 'Type the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    try {
      await verifyEmail(code);
      Alert.alert('Email verified', 'Your school account is verified.', [{ text: 'Continue', onPress: leave }]);
    } catch (e: any) {
      Alert.alert('Could not verify', e?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      const sent = await resendVerification();
      setCooldown(60);
      Alert.alert(
        sent ? 'Code sent' : 'Code generated',
        sent
          ? `We emailed a new code to ${email}.`
          : 'The server could not send the email. If you are testing, check the backend terminal for the code.'
      );
    } catch (e: any) {
      Alert.alert('Could not resend', e?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="mail-open-outline" size={34} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Verify your school email</Text>
      <Text style={styles.sub}>
        We sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{email || 'your email'}</Text>
      </Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        placeholder="000000"
        placeholderTextColor={theme.colors.border}
        maxLength={6}
      />

      <TouchableOpacity style={[styles.primaryBtn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        <Text style={styles.primaryText}>{busy ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resend} disabled={cooldown > 0} style={styles.linkBtn}>
        <Text style={[styles.linkText, cooldown > 0 && { color: theme.colors.textSecondary }]}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={leave} style={styles.linkBtn}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Unverified accounts can still report issues, but Urgent priority and campus emergency contacts need a verified email.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', padding: 28, paddingTop: 60 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e7f6fa', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginTop: 18 },
  sub: { fontSize: 13.5, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  email: { fontWeight: '700', color: theme.colors.primary },
  input: {
    marginTop: 26,
    width: '100%',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 10,
    color: theme.colors.text,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dcebef',
    paddingVertical: 14,
  },
  primaryBtn: { marginTop: 18, width: '100%', backgroundColor: theme.colors.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkBtn: { marginTop: 14 },
  linkText: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryCyan },
  skipText: { fontSize: 13, color: theme.colors.textSecondary },
  note: { marginTop: 26, fontSize: 11.5, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 17 },
});