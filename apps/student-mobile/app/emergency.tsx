import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { EmergencyContact } from '@campus/shared-types';
import { fetchEmergencyContacts } from '@campus/mock-data';
import { theme } from '@/constants/theme';

export default function EmergencyScreen() {
  const router = useRouter();
  // BACKEND SEAM: contacts load through fetchEmergencyContacts() only.
  // Swap the accessor body for GET /api/emergency-contacts when the
  // backend lands; component logic stays.
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    // Simulated async: mock resolves immediately today; real fetch
    // will populate isLoading/error/data through this same branch.
    fetchEmergencyContacts()
      .then((data) => {
        if (!mounted) return;
        setContacts(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Could not load emergency contacts. Please try again.');
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function callContact(contact: EmergencyContact) {
    // BACKEND TODO: consider dispatch/logging endpoint so emergency
    // calls are recorded server-side (e.g. POST /api/emergency-log
    // { contactId, userId, timestamp }). Currently direct tel: link
    // with no backend dispatch system assumed.
    Linking.openURL(`tel:${contact.phone}`).catch(() => {
      Alert.alert('Call failed', `Could not place a call to ${contact.name}.`);
    });
  }

  function submitUrgentReport() {
    // Reuses the existing submitReport flow: new-report reads the
    // priority param and pre-sets urgent. Backend may need priority
    // alerting / notify-admin logic for urgent reports (see HANDOFF.md).
    router.push('/new-report?priority=urgent' as any);
  }

  const primary = contacts[0];

  return (
    <View style={styles.container}>
      <View style={styles.alertCard}>
        <View style={styles.alertIcon}>
          <Ionicons name="warning" size={32} color="#fff" />
        </View>
        <Text style={styles.alertTitle}>Emergency Help</Text>
        <Text style={styles.alertSub}>
          For immediate danger, call Campus Security directly. For urgent
          campus issues, submit an urgent report.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.danger} />
          <Text style={styles.centerText}>Loading contacts…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={theme.colors.danger}
          />
          <Text style={styles.centerText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {contacts.map((c) => (
            <View key={c.id} style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={theme.colors.danger}
                />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactRole}>
                  {c.role} • {c.phone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => callContact(c)}
                style={styles.callBtn}
              >
                <Ionicons name="call" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.ctaWrap}>
        <TouchableOpacity
          onPress={() => primary && callContact(primary)}
          activeOpacity={0.9}
          disabled={!primary}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={['#BA1A1A', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.primaryText}>Call Campus Security</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={submitUrgentReport}
          style={styles.secondaryBtn}
          activeOpacity={0.8}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={theme.colors.danger}
          />
          <Text style={styles.secondaryText}>Submit Urgent Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.danger,
    marginTop: 12,
  },
  alertSub: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  center: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  centerText: { color: theme.colors.textSecondary, fontSize: 13 },
  list: { marginTop: 12, gap: 10 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: { flex: 1 },
  contactName: { fontWeight: '600', color: theme.colors.text },
  contactRole: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaWrap: { marginTop: 16, gap: 10 },
  ctaShadow: {
    shadowColor: '#BA1A1A',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
  },
  secondaryText: {
    color: theme.colors.danger,
    fontWeight: '600',
    fontSize: 15,
  },
});
