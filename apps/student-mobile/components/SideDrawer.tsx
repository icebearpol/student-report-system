import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { getCurrentUser, logout } from '@/lib/auth';
import { useEffect, useState } from 'react';

const ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; route?: string }[] = [
  { icon: 'person-outline', label: 'Profile', route: '/(tabs)/profile' },
  { icon: 'time-outline', label: 'My History', route: '/(tabs)/history' },
  { icon: 'list-outline', label: 'All Issues', route: '/(tabs)/issues' },
  { icon: 'settings-outline', label: 'Settings' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

export function SideDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('Guest');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (visible) {
      getCurrentUser().then((u) => {
        setName(u?.name || 'Guest');
        setEmail(u?.email || '');
      });
    }
  }, [visible]);

  const handleLogout = async () => {
    await logout();
    onClose();
    router.replace('/login');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name[0]?.toUpperCase() || 'G'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              {!!email && <Text style={styles.email} numberOfLines={1}>{email}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.items}>
            {ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.item}
                onPress={() => {
                  onClose();
                  if (item.route) router.push(item.route as any);
                }}
              >
                <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(16,30,33,0.45)', flexDirection: 'row' },
  panel: { width: '78%', maxWidth: 320, height: '100%', backgroundColor: '#fff', paddingTop: 56, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eef2f3' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
  name: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  email: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  items: { paddingTop: 12, gap: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 },
  itemText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  logoutBtn: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#eef2f3', paddingTop: 16 },
  logoutText: { fontSize: 14, fontWeight: '700', color: theme.colors.danger },
});