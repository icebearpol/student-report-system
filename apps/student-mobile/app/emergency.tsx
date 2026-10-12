import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { refreshMe, logEmergencyCall } from '@/lib/auth';
import { theme } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Contact {
  id: string;
  label: string;
  description: string;
  number: string;
  icon: IconName;
  gated: boolean;
}

const CONTACTS: Contact[] = [
  {
    id: 'national',
    label: 'National Emergency Hotline',
    description: 'Police, fire, and medical emergencies anywhere in the Philippines',
    number: '911',
    icon: 'warning',
    gated: false,
  },
  { id: 'security', label: 'Campus Security', description: 'Guard House / Main Gate', number: '', icon: 'shield-checkmark', gated: true },
  { id: 'clinic', label: 'School Clinic', description: 'Medical assistance on campus', number: '', icon: 'medkit', gated: true },
  { id: 'admin', label: 'Administration Office', description: 'General campus concerns', number: '', icon: 'business', gated: true },
];

export default function EmergencyScreen() {
  const router = useRouter();

  const placeCall = async (contact: Contact) => {
    if (contact.gated) {
      const result = await logEmergencyCall(contact.label);
      if (!result.allowed) {
        Alert.alert('Cannot place call', result.message || 'Please try again.');
        return;
      }
    }
    Linking.openURL(`tel:${contact.number}`);
  };

  const confirmCall = (contact: Contact) => {
    Alert.alert(`Call ${contact.label}?`, contact.number, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => placeCall(contact) },
    ]);
  };

  const press = async (contact: Contact) => {
    if (!contact.number.trim()) return;
    if (!contact.gated) {
      confirmCall(contact);
      return;
    }

    const user = await refreshMe();
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Contacting campus staff needs a signed-in school account so false alarms can be traced.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/login') },
        ]
      );
      return;
    }
    if (!user.emailVerified) {
      Alert.alert('Verify your school email', 'Please verify your school email before contacting campus staff.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => router.push('/verify-email' as any) },
      ]);
      return;
    }
    confirmCall(contact);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.banner}>
        <Ionicons name="alert-circle" size={22} color={theme.colors.danger} />
        <Text style={styles.bannerText}>
          If someone is in immediate danger, call 911 first. The 911 button is always available, with no sign-in needed.
        </Text>
      </View>

      <View style={styles.noticeCard}>
        <Ionicons name="lock-closed-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.noticeText}>
          Campus staff contacts need a verified school account, and each call is logged with your account to prevent false alarms.
        </Text>
      </View>

      {CONTACTS.map((c) => {
        const hasNumber = c.number.trim().length > 0;
        return (
          <View key={c.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={c.icon} size={22} color={theme.colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{c.label}</Text>
              <Text style={styles.desc}>{c.description}</Text>
              <Text style={styles.number}>{hasNumber ? c.number : 'Number not set yet'}</Text>
            </View>
            <TouchableOpacity
              disabled={!hasNumber}
              onPress={() => press(c)}
              style={[styles.callBtn, !hasNumber && styles.callBtnDisabled]}
            >
              <Ionicons name="call" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>For a non-urgent campus issue, submit a report instead.</Text>
        <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/new-report')}>
          <Text style={styles.reportBtnText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  banner: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#ffdad6', borderRadius: 14, padding: 14, marginBottom: 10 },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#93000a', lineHeight: 18 },
  noticeCard: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#e7f6fa', borderRadius: 14, padding: 12, marginBottom: 14 },
  noticeText: { flex: 1, fontSize: 12, color: theme.colors.primary, lineHeight: 17 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#dcebef' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffdad6', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  desc: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 2 },
  number: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginTop: 4 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.success, alignItems: 'center', justifyContent: 'center' },
  callBtnDisabled: { backgroundColor: theme.colors.border },
  footer: { alignItems: 'center', marginTop: 20, gap: 10 },
  footerText: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' },
  reportBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  reportBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});