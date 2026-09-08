import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Notification, NotificationType } from '@campus/shared-types';
import {
  currentStudent,
  fetchNotificationsByUser,
  markAllNotificationsRead,
} from '@campus/mock-data';
import { formatRelativeDate } from '@campus/ui-components';
import { theme } from '@/constants/theme';

const typeIcon: Record<NotificationType, string> = {
  status_change: 'sync-outline',
  comment: 'chatbubble-outline',
  system: 'megaphone-outline',
  emergency: 'warning-outline',
};

const typeTint: Record<NotificationType, string> = {
  status_change: theme.colors.review,
  comment: theme.colors.primaryCyan,
  system: theme.colors.textSecondary,
  emergency: theme.colors.danger,
};

export default function NotificationsScreen() {
  const router = useRouter();
  // BACKEND SEAM: notifications load through fetchNotificationsByUser()
  // only. Swap the accessor body for GET /api/notifications?userId=
  // when the backend lands; component logic stays.
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // BACKEND TODO: persist read-state server-side
  // (e.g. PATCH /api/notifications/read). Currently local only and
  // resets on reload.
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    // Simulated async: mock resolves immediately today; real fetch
    // will populate isLoading/error/data through this same branch.
    fetchNotificationsByUser(currentStudent.id)
      .then((data) => {
        if (!mounted) return;
        setItems(data);
        setReadIds(new Set(data.filter((n) => n.read).map((n) => n.id)));
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Could not load notifications. Please try again.');
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function isRead(n: Notification) {
    return n.read || readIds.has(n.id);
  }

  function openNotification(n: Notification) {
    setReadIds((prev) => new Set(prev).add(n.id));
    // BACKEND TODO: persist single-read server-side
    // (e.g. PATCH /api/notifications/:id { read: true }).
    if (n.reportId) router.push(`/report/${n.reportId}` as any);
  }

  function markAllRead() {
    // BACKEND TODO: persist server-side via markAllNotificationsRead()
    // (PATCH /api/notifications/read). Currently updates local state only.
    markAllNotificationsRead(currentStudent.id).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setReadIds(new Set(items.map((n) => n.id)));
  }

  function retry() {
    setIsLoading(true);
    setError('');
    fetchNotificationsByUser(currentStudent.id)
      .then((data) => {
        setItems(data);
        setReadIds(new Set(data.filter((n) => n.read).map((n) => n.id)));
        setIsLoading(false);
      })
      .catch(() => {
        setError('Could not load notifications. Please try again.');
        setIsLoading(false);
      });
  }

  const unread = items.filter((n) => !isRead(n)).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notifications{unread > 0 ? ` (${unread} new)` : ''}
        </Text>
        {items.length > 0 && unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.centerText}>Loading notifications…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={theme.colors.danger}
          />
          <Text style={styles.centerText}>{error}</Text>
          <TouchableOpacity onPress={retry} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="notifications-outline"
            size={48}
            color={theme.colors.border}
          />
          <Text style={styles.centerText}>You&apos;re all caught up.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const read = isRead(item);
            return (
              <TouchableOpacity
                onPress={() => openNotification(item)}
                style={[styles.card, !read && styles.cardUnread]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${typeTint[item.type]}1A` },
                  ]}
                >
                  <Ionicons
                    name={typeIcon[item.type] as any}
                    size={20}
                    color={typeTint[item.type]}
                  />
                </View>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.message} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.time}>
                    {formatRelativeDate(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  markAll: {
    color: theme.colors.primaryCyan,
    fontWeight: '600',
    fontSize: 13,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  centerText: { color: theme.colors.textSecondary, fontSize: 14 },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  cardUnread: { borderColor: theme.colors.primaryCyan, borderWidth: 1.5 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontWeight: '600', color: theme.colors.text },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryCyan,
  },
  message: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
  time: { color: '#72787e', fontSize: 11, marginTop: 4 },
});
