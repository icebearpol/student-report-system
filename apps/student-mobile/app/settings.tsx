import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { getCurrentUser, refreshMe, logout, changePassword, deleteAccount, AuthUser } from '@/lib/auth';
import { getPrefs, savePrefs, NotificationPrefs } from '@/lib/notifications';
import { TermsModal } from '@/components/TermsModal';
import { theme } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  professor: 'Professor',
  admin: 'Administrator',
  prefer_not_to_say: 'Member',
};

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  last,
  right,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, !last && styles.rowBorder]}
    >
      <View style={[styles.rowIcon, danger && { backgroundColor: '#ffdad6' }]}>
        <Ionicons name={icon} size={18} color={danger ? theme.colors.danger : theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: theme.colors.danger }]}>{label}</Text>
        {!!value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} /> : null)}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<NotificationPrefs>({ status: true, reply: true });
  const [termsOpen, setTermsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setUser(await getCurrentUser());
    setPrefs(await getPrefs());
    setLoading(false);
    const fresh = await refreshMe();
    if (fresh) setUser(fresh);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const togglePref = async (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await savePrefs(next);
  };

  const closePasswordModal = () => {
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const submitPassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing fields', 'Please fill in every field.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'Your new password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Check your new password and the confirmation.');
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      closePasswordModal();
      Alert.alert('Password changed', 'Use your new password the next time you sign in.');
    } catch (e: any) {
      Alert.alert('Could not change password', e?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitDelete = async () => {
    if (!deletePassword) {
      Alert.alert('Password needed', 'Enter your password to confirm.');
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(deletePassword);
      await logout();
      setDeleteOpen(false);
      setDeletePassword('');
      Alert.alert('Account deleted', 'Your account has been deleted.', [
        { text: 'OK', onPress: () => router.replace('/login' as any) },
      ]);
    } catch (e: any) {
      Alert.alert('Could not delete account', e?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login' as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  const displayName = user ? user.username || user.name : 'Guest';
  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() || 'G'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{displayName}</Text>
          {user ? (
            <>
              <Text style={styles.profileSub}>{user.email}</Text>
              <Text style={styles.profileSub}>
                {ROLE_LABELS[user.role] || 'Member'}
                {user.studentId ? ` • ID ${user.studentId}` : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.profileSub}>Browsing without an account</Text>
          )}
        </View>
      </View>

      {user ? (
        <View style={[styles.verifyCard, user.emailVerified ? styles.verifyOk : styles.verifyWarn]}>
          <Ionicons
            name={user.emailVerified ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={user.emailVerified ? theme.colors.success : '#8a5a00'}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.verifyTitle}>{user.emailVerified ? 'School email verified' : 'Email not verified'}</Text>
            <Text style={styles.verifySub}>
              {user.emailVerified
                ? 'You can use Urgent priority and contact campus staff.'
                : 'Verify to use Urgent priority and contact campus staff.'}
            </Text>
          </View>
          {!user.emailVerified && (
            <TouchableOpacity onPress={() => router.push('/verify-email' as any)} style={styles.verifyBtn}>
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.9} style={styles.signInCard} onPress={() => router.push('/login' as any)}>
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <Text style={styles.signInText}>Sign in to manage your account</Text>
        </TouchableOpacity>
      )}

      {user && (
        <Section title="ACCOUNT">
          <Row icon="key-outline" label="Change password" onPress={() => setPasswordOpen(true)} last />
        </Section>
      )}

      <Section title="NOTIFICATIONS">
        <Row
          icon="refresh-circle-outline"
          label="Report updates"
          value="Status changes and removals on your reports"
          right={
            <Switch
              value={prefs.status}
              onValueChange={(v) => togglePref('status', v)}
              trackColor={{ false: '#c2c7ce', true: theme.colors.primaryCyan }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="chatbubble-ellipses-outline"
          label="Admin messages"
          value="Replies to your reports"
          right={
            <Switch
              value={prefs.reply}
              onValueChange={(v) => togglePref('reply', v)}
              trackColor={{ false: '#c2c7ce', true: theme.colors.primaryCyan }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="megaphone-outline"
          label="Campus alerts"
          value="Always on - these are safety messages"
          last
          right={<Ionicons name="lock-closed" size={16} color={theme.colors.textSecondary} />}
        />
      </Section>

      <Section title="PRIVACY & DATA">
        <Row
          icon="camera-outline"
          label="Camera & photo access"
          value="Open your phone's settings for CampusFix"
          onPress={() => Linking.openSettings()}
        />
        <Row
          icon="document-text-outline"
          label="Terms & Privacy Policy"
          onPress={() => setTermsOpen(true)}
          last={!user}
        />
        {user && (
          <Row icon="trash-outline" label="Delete my account" danger onPress={() => setDeleteOpen(true)} last />
        )}
      </Section>

      <Section title="ABOUT & SUPPORT">
        <Row icon="help-circle-outline" label="Help & FAQ" onPress={() => router.push('/help' as any)} />
        <Row icon="information-circle-outline" label="About CampusFix" onPress={() => router.push('/about' as any)} />
        <Row icon="phone-portrait-outline" label="App version" value={version} last />
      </Section>

      {user && (
        <TouchableOpacity activeOpacity={0.85} style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      )}

      <TermsModal visible={termsOpen} onClose={() => setTermsOpen(false)} />

      <Modal visible={passwordOpen} transparent animationType="fade" onRequestClose={closePasswordModal}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="New password (6+ characters)"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closePasswordModal} disabled={busy}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, busy && { opacity: 0.6 }]} onPress={submitPassword} disabled={busy}>
                <Text style={styles.primaryText}>{busy ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: theme.colors.danger }]}>Delete your account?</Text>
            <Text style={styles.modalBody}>
              This can't be undone. Your reports and messages stay in campus records but are no longer linked to you,
              and your notifications are removed.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password to confirm"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setDeleteOpen(false);
                  setDeletePassword('');
                }}
                disabled={busy}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.colors.danger }, busy && { opacity: 0.6 }]}
                onPress={submitDelete}
                disabled={busy}
              >
                <Text style={styles.primaryText}>{busy ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#dcebef' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileName: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  profileSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 2 },
  verifyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 14, marginTop: 12 },
  verifyOk: { backgroundColor: '#e6f7ee' },
  verifyWarn: { backgroundColor: '#fff0cf' },
  verifyTitle: { fontSize: 13.5, fontWeight: '700', color: theme.colors.text },
  verifySub: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 1, lineHeight: 16 },
  verifyBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  verifyBtnText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  signInCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, borderRadius: 16, paddingVertical: 14, marginTop: 12 },
  signInText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, color: theme.colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#dcebef', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#eef2f3' },
  rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e7f6fa', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14.5, fontWeight: '600', color: theme.colors.text },
  rowValue: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, marginTop: 22, borderWidth: 1, borderColor: '#ffdad6' },
  logoutText: { color: theme.colors.danger, fontSize: 15, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(16,30,33,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 10 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  modalBody: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
  input: { backgroundColor: '#f2f7f8', borderWidth: 1, borderColor: '#dcebef', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.colors.text },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#c2c7ce' },
  cancelText: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  primaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 13, alignItems: 'center', backgroundColor: theme.colors.primary },
  primaryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});