import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { currentStudent } from '@campus/mock-data';
import { logout } from '@/lib/auth';
import { theme } from '@/constants/theme';

type MenuDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

const navItems: Array<{
  label: string;
  icon: string;
  route: string;
}> = [
  { label: 'Home', icon: 'home-outline', route: '/(tabs)' },
  { label: 'My Issues', icon: 'document-text-outline', route: '/(tabs)/history' },
  { label: 'Report an Issue', icon: 'add-circle-outline', route: '/new-report' },
  { label: 'History', icon: 'time-outline', route: '/(tabs)/history' },
  { label: 'Public Map', icon: 'map-outline', route: '/public-map' },
  { label: 'Emergency', icon: 'call-outline', route: '/emergency' },
  {
    label: 'Notification Settings',
    icon: 'notifications-outline',
    route: '/notifications',
  },
  { label: 'Help & Support', icon: 'help-circle-outline', route: '/(tabs)/profile' },
];

export function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const router = useRouter();

  function go(route: string) {
    onClose();
    router.push(route as any);
  }

  async function onLogout() {
    // BACKEND TODO: wire to real auth/session teardown + navigation
    // reset to /login. Currently clears local AsyncStorage session only.
    try {
      await logout();
    } catch {}
    onClose();
    router.replace('/login' as any);
  }

  function confirmLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: onLogout },
    ]);
  }

  const initials = currentStudent.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <TouchableOpacity
            onPress={() => go('/(tabs)/profile')}
            style={styles.profile}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{currentStudent.name}</Text>
              <Text style={styles.profileEmail}>{currentStudent.email}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {navItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => go(item.route)}
              style={styles.row}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={theme.colors.primary}
              />
              <Text style={styles.rowLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={confirmLogout}
            style={[styles.row, styles.logoutRow]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={theme.colors.danger}
            />
            <Text style={[styles.rowLabel, styles.logoutLabel]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  scrim: { flex: 1, backgroundColor: 'rgba(10,60,88,0.4)' },
  sheet: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: theme.colors.background,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcebef',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  profileText: { flex: 1 },
  profileName: { fontWeight: '600', color: theme.colors.text },
  profileEmail: { color: theme.colors.textSecondary, fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  rowLabel: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
  logoutRow: { borderColor: 'rgba(239,68,68,0.3)', marginTop: 8 },
  logoutLabel: { color: theme.colors.danger, fontWeight: '600' },
});
