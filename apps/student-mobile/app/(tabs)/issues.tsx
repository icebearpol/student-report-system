import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllReports, getAnonymousReportIds, Report } from '@/lib/reports';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { timeAgo } from '@/lib/format';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { theme } from '@/constants/theme';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Open',
  in_review: 'In Progress',
  resolved: 'Resolved',
};

const STATUS_COLOR: Record<string, string> = {
  pending: theme.colors.danger,
  in_review: theme.colors.warning,
  resolved: theme.colors.success,
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Open' },
  { value: 'in_review', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

type SortValue = 'smart' | 'newest' | 'oldest' | 'most_upvoted';

const SORT_OPTIONS: { value: SortValue; label: string; hint?: string }[] = [
  { value: 'smart', label: 'Smart', hint: 'Open urgent first, then newest' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'most_upvoted', label: 'Most upvoted' },
];

function categoryLabel(category?: string | null) {
  if (!category) return 'General';
  return REPORT_CATEGORY_LABELS[category as keyof typeof REPORT_CATEGORY_LABELS] || category;
}

function smartRank(report: Report) {
  if (report.status === 'resolved') return 2;
  if (report.priority === 'urgent') return 0;
  return 1;
}

function createdTime(report: Report) {
  return new Date(report.createdAt).getTime();
}

export default function IssuesScreen() {
  const router = useRouter();
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortValue>('smart');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [anonIds, setAnonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const load = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (!currentUser) {
      const ids = await getAnonymousReportIds();
      setAnonIds(ids);
    }
    try {
      const all = await getAllReports();
      setReports(all);
    } catch {
      setReports([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const data = useMemo(() => {
    let result =
      scope === 'mine'
        ? reports.filter((r) => (user ? r.authorId === user.id : anonIds.includes(r.id)))
        : reports;

    result = filter === 'all' ? result : result.filter((r) => r.status === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          (r.location || '').toLowerCase().includes(q) ||
          categoryLabel(r.category).toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'smart') {
        const rank = smartRank(a) - smartRank(b);
        return rank !== 0 ? rank : createdTime(b) - createdTime(a);
      }
      if (sortBy === 'most_upvoted') return (b.upvotes || 0) - (a.upvotes || 0);
      return sortBy === 'oldest' ? createdTime(a) - createdTime(b) : createdTime(b) - createdTime(a);
    });
  }, [reports, scope, filter, search, sortBy, user, anonIds]);

  return (
    <View style={styles.container}>
      <View style={styles.scopeRow}>
        <TouchableOpacity
          onPress={() => setScope('all')}
          style={[styles.scopeBtn, scope === 'all' && styles.scopeActive]}
        >
          <Text style={[styles.scopeText, scope === 'all' && styles.scopeTextActive]}>All Issues</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setScope('mine')}
          style={[styles.scopeBtn, scope === 'mine' && styles.scopeActive]}
        >
          <Text style={[styles.scopeText, scope === 'mine' && styles.scopeTextActive]}>My Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggle}>
          <View style={[styles.toggleBtn, styles.toggleActive]}>
            <Text style={[styles.toggleText, styles.toggleTextActive]}>List View</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/campus-map', params: { scope } } as any)}
            style={[styles.toggleBtn, styles.toggleMap]}
          >
            <Ionicons name="map-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.toggleText}>Map View</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="filter" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search issues..."
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.placeholder}>
          <ActivityIndicator />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.placeholder}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.placeholderText}>
            {search
              ? 'No matching issues found'
              : scope === 'mine'
              ? "You haven't submitted any reports yet"
              : 'No reports yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const open = item.status !== 'resolved';
            const tag = open && (item.priority === 'urgent' || item.priority === 'high') ? item.priority : null;
            return (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/report/${item.id}` as any)}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
                    <Text style={styles.badgeText}>{STATUS_LABEL[item.status]}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaLeft}>
                    {tag && (
                      <View style={[styles.priorityTag, tag === 'urgent' ? styles.tagUrgent : styles.tagHigh]}>
                        <Text style={[styles.priorityTagText, tag === 'urgent' ? styles.tagUrgentText : styles.tagHighText]}>
                          {tag === 'urgent' ? 'URGENT' : 'HIGH'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.cardMeta} numberOfLines={1}>
                      {categoryLabel(item.category)} • {item.location || 'No location'}
                    </Text>
                  </View>
                  <View style={styles.upvoteRow}>
                    <Ionicons name="thumbs-up-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.cardMeta}>{item.upvotes || 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Status</Text>
            <View style={styles.modalChipRow}>
              {STATUS_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.modalChip, filter === f.value && styles.modalChipActive]}
                  onPress={() => setFilter(f.value)}
                >
                  <Text style={[styles.modalChipText, filter === f.value && styles.modalChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalTitle, { marginTop: 16 }]}>Sort by</Text>
            {SORT_OPTIONS.map((s) => (
              <TouchableOpacity key={s.value} style={styles.sortRow} onPress={() => setSortBy(s.value)}>
                <Ionicons
                  name={sortBy === s.value ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={sortBy === s.value ? theme.colors.primary : theme.colors.textSecondary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sortLabel}>{s.label}</Text>
                  {!!s.hint && <Text style={styles.sortHint}>{s.hint}</Text>}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalDone} onPress={() => setSortModalVisible(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scopeRow: { flexDirection: 'row', gap: 20, paddingHorizontal: 16, paddingTop: 14, borderBottomWidth: 1, borderBottomColor: '#dcebef' },
  scopeBtn: { paddingBottom: 10 },
  scopeActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  scopeText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  scopeTextActive: { color: theme.colors.primary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  toggle: { flexDirection: 'row', backgroundColor: '#dcebef', borderRadius: 20, padding: 4, gap: 4 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  toggleMap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#0A3C58', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  toggleText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  toggleTextActive: { color: theme.colors.primary },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e7f6fa', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcebef', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.text },
  list: { padding: 16, paddingTop: 0 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  placeholderText: { color: theme.colors.textSecondary, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#dcebef' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, fontWeight: '600', color: theme.colors.text, fontSize: 14 },
  cardTime: { fontSize: 11, color: '#72787e', marginLeft: 8 },
  cardDesc: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  metaLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
  upvoteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMeta: { color: '#72787e', fontSize: 10, letterSpacing: 0.5, flexShrink: 1 },
  priorityTag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  priorityTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  tagUrgent: { backgroundColor: '#ffdad6' },
  tagUrgentText: { color: '#93000a' },
  tagHigh: { backgroundColor: '#fff0cf' },
  tagHighText: { color: '#8a5a00' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(16,30,33,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  modalTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, marginBottom: 10 },
  modalChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dcebef', backgroundColor: '#f7fbfc' },
  modalChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  modalChipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  modalChipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  sortLabel: { fontSize: 14, color: theme.colors.text },
  sortHint: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  modalDone: { marginTop: 16, backgroundColor: theme.colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  modalDoneText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});