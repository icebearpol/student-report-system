import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getNotifications,
  markNotificationsSeen,
  dismissNotifications,
  AppNotification,
} from '@/lib/notifications';
import { theme } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function iconFor(n: AppNotification): { name: IconName; color: string; bg: string } {
  if (n.type === 'announcement') {
    if (n.severity === 'danger') return { name: 'warning', color: '#93000a', bg: '#ffdad6' };
    if (n.severity === 'warning') return { name: 'alert-circle', color: '#8a5a00', bg: '#fff0cf' };
    return { name: 'megaphone', color: theme.colors.primary, bg: '#e7f6fa' };
  }
  if (n.type === 'reply') return { name: 'chatbubble', color: theme.colors.primary, bg: '#e7f6fa' };
  return { name: 'refresh-circle', color: theme.colors.primary, bg: '#e7f6fa' };
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await getNotifications();
      setItems(data);
      setError(null);
      await markNotificationsSeen(data);
    } catch (e: any) {
      setError(e?.message || 'Could not load notifications.');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const allSelected = items.length > 0 && selected.length === items.length;

  const startSelecting = (id: string) => {
    setSelecting(true);
    setSelected([id]);
  };

  const exitSelecting = () => {
    setSelecting(false);
    setSelected([]);
  };

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : items.map((n) => n.id));
  };

  const open = (item: AppNotification) => {
    if (!item.reportId) return;
    router.push((item.type === 'reply' ? `/chat/${item.reportId}` : `/report/${item.reportId}`) as any);
  };

  const confirmDelete = () => {
    if (selected.length === 0) return;
    const count = selected.length;
    Alert.alert(
      `Delete ${count} notification${count === 1 ? '' : 's'}?`,
      'They will be removed from this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dismissNotifications(selected);
            setItems((prev) => prev.filter((n) => !selected.includes(n.id)));
            exitSelecting();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      {items.length > 0 && (
        <View style={styles.topBar}>
          {selecting ? (
            <>
              <TouchableOpacity onPress={exitSelecting} hitSlop={10}>
                <Text style={styles.barAction}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.barCount}>{selected.length} selected</Text>
              <TouchableOpacity onPress={toggleAll} hitSlop={10}>
                <Text style={styles.barAction}>{allSelected ? 'Clear' : 'Select all'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.barHint}>Hold a notification to select it</Text>
              <TouchableOpacity onPress={() => setSelecting(true)} hitSlop={10}>
                <Text style={styles.barAction}>Select</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <FlatList
        data={items}
        extraData={[selecting, selected]}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16, paddingBottom: selecting ? 100 : 24, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-outline" size={46} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>
              Campus alerts approved by administrators and updates on your own reports will show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = iconFor(item);
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              delayLongPress={350}
              onPress={() => (selecting ? toggle(item.id) : open(item))}
              onLongPress={() => {
                if (!selecting) startSelecting(item.id);
              }}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              {selecting && (
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isSelected ? theme.colors.primary : theme.colors.border}
                />
              )}
              <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name} size={20} color={icon.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>
                  {item.type === 'announcement' ? 'Campus alert' : 'Your report'} • {timeLabel(item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selecting && selected.length > 0 && (
        <View style={styles.deleteBar}>
          <TouchableOpacity activeOpacity={0.9} style={styles.deleteBtn} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deleteText}>Delete {selected.length}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  emptySub: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 19 },
  error: { color: '#93000a', backgroundColor: '#ffdad6', fontSize: 12, textAlign: 'center', padding: 8 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dcebef',
  },
  barAction: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryCyan },
  barCount: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  barHint: { fontSize: 12, color: theme.colors.textSecondary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  cardSelected: { borderColor: theme.colors.primary, backgroundColor: '#f0fafc' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  body: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 3, lineHeight: 18 },
  time: { fontSize: 10.5, color: '#72787e', marginTop: 6 },
  deleteBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#dcebef',
  },
  deleteBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5484D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});