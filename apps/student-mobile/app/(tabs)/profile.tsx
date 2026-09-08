import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// BACKEND NOTE: profile is display-only. No editing UI is in scope.
// A real PATCH /api/users/:id endpoint would be needed for editable
// fields (see HANDOFF.md gap list).
import { currentStudent, getReportsByUser } from '@campus/mock-data';
import { logout } from '@/lib/auth';
import { theme } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  // Existing mock-data pattern — no new contract needed for stats.
  const reports = getReportsByUser(currentStudent.id);
  const open = reports.filter((r) => r.status === 'pending').length;
  const inProgress = reports.filter((r) => r.status === 'in_review').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;

  const initials = currentStudent.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  async function onLogout() {
    // BACKEND TODO: wire to real auth/session teardown + navigation
    // reset to /login. Currently clears local AsyncStorage session only.
    try {
      await logout();
    } catch {}
    router.replace('/login' as any);
  }

  function confirmLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: onLogout },
    ]);
  }

  const actions: Array<{
    label: string;
    sub: string;
    icon: string;
    route?: string;
  }> = [
    {
      label: 'My Reports',
      sub: `${reports.length} submitted`,
      icon: 'document-text-outline',
      route: '/(tabs)/history',
    },
    {
      label: 'Notification Preferences',
      sub: 'Status, comments, emergency',
      icon: 'notifications-outline',
      route: '/notifications',
    },
    {
      label: 'Privacy & Anonymous Mode',
      sub: 'Report without an account',
      icon: 'eye-off-outline',
      route: '/anonymous',
    },
    {
      label: 'Help & Support',
      sub: 'FAQs and contact',
      icon: 'help-circle-outline',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.hero}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{currentStudent.name}</Text>
        <Text style={styles.email}>{currentStudent.email}</Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{open}</Text>
            <Text style={styles.chipLabel}>Open</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{inProgress}</Text>
            <Text style={styles.chipLabel}>In Progress</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{resolved}</Text>
            <Text style={styles.chipLabel}>Resolved</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {currentStudent.studentId && (
          <View style={styles.infoCard}>
            <Ionicons name="school-outline" size={20} color={theme.colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{currentStudent.studentId}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
          <View>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>Student</Text>
          </View>
        </View>

        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={() => a.route && router.push(a.route as any)}
            style={styles.actionRow}
            activeOpacity={0.7}
          >
            <Ionicons
              name={a.icon as any}
              size={22}
              color={theme.colors.primary}
            />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionSub}>{a.sub}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={confirmLogout}
          style={[styles.actionRow, styles.logoutRow]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={theme.colors.danger}
          />
          <View style={styles.actionText}>
            <Text style={[styles.actionLabel, styles.logoutLabel]}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 16 },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  chipNum: { color: '#fff', fontSize: 18, fontWeight: '700' },
  chipLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },
  body: { padding: 16, gap: 10 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
  actionSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  logoutRow: { borderColor: 'rgba(239,68,68,0.3)' },
  logoutLabel: { color: theme.colors.danger, fontWeight: '600' },
});
