import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { timeAgo } from '@/lib/format';
import { getAllReports, getAnonymousReportIds, Report } from '@/lib/reports';
import { NotificationBell } from '@/components/notificationBell';
import { SideDrawer } from '@/components/SideDrawer';
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

function categoryLabel(category?: string | null) {
  if (!category) return 'General';
  return REPORT_CATEGORY_LABELS[category as keyof typeof REPORT_CATEGORY_LABELS] || category;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [anonIds, setAnonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

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

  const myReports = user
    ? reports.filter((r) => r.authorId === user.id)
    : reports.filter((r) => anonIds.includes(r.id));
  const open = reports.filter((r) => r.status === 'pending').length;
  const progress = reports.filter((r) => r.status === 'in_review').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;
  const recent = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const displayName = user ? (user.username || user.name) : 'Welcome to Campus Fix';

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.topBar}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)} hitSlop={10}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>CampusFix</Text>
          <NotificationBell />
        </LinearGradient>

        <View style={styles.heroWrap}>
          <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.hero}>
            <Text style={styles.heroHello}>Hello, {displayName}!</Text>
            <Text style={styles.heroSub}>Here&apos;s your campus overview today.</Text>
            <View style={styles.chips}>
              <View style={styles.chip}><View style={[styles.dot, { backgroundColor: theme.colors.danger }]} /><Text style={styles.chipText}>Open: {open}</Text></View>
              <View style={styles.chip}><View style={[styles.dot, { backgroundColor: theme.colors.warning }]} /><Text style={styles.chipText}>In Progress: {progress}</Text></View>
              <View style={styles.chip}><View style={[styles.dot, { backgroundColor: theme.colors.success }]} /><Text style={styles.chipText}>Resolved: {resolved}</Text></View>
            </View>
            <TouchableOpacity onPress={() => router.push('/new-report')} activeOpacity={0.9} style={styles.heroBtn}>
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.heroBtnText}>Report an Issue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            <TouchableOpacity onPress={() => router.push('/new-report')} style={styles.actionCard}>
              <View style={styles.actionIcon}><Ionicons name="camera-outline" size={26} color={theme.colors.primary} /></View>
              <Text style={styles.actionText}>Camera / Report</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/campus-map' as any)} style={styles.actionCard}>
              <View style={styles.actionIcon}><Ionicons name="map-outline" size={26} color={theme.colors.primary} /></View>
              <Text style={styles.actionText}>View Public Map</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)} style={styles.actionCard}>
              <View style={styles.actionIcon}><Ionicons name="time-outline" size={26} color={theme.colors.primary} /></View>
              <Text style={styles.actionText}>My History</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/emergency' as any)} style={[styles.actionCard, { borderColor: 'rgba(239,68,68,0.2)' }]}>
              <View style={[styles.actionIcon, { backgroundColor: '#ffdad6' }]}><Ionicons name="call" size={22} color={theme.colors.danger} /></View>
              <Text style={styles.actionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.feedHeader}>
            <Text style={styles.sectionTitle}>Recent Issues</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/issues' as any)}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={40} color={theme.colors.border} />
              <Text style={styles.emptyText}>No campus activity yet</Text>
            </View>
          ) : (
            <View style={styles.feedCard}>
              {recent.map((r, i) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => router.push(`/report/${r.id}` as any)}
                  style={[styles.feedItem, i < recent.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#dcebef' }]}
                >
                  <View style={styles.feedThumb}><Ionicons name="image-outline" size={22} color={theme.colors.textSecondary} /></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.feedTitle} numberOfLines={1}>{r.title}</Text>
                      <View style={[styles.badge, { backgroundColor: STATUS_COLOR[r.status] }]}>
                        <Text style={styles.badgeText}>{STATUS_LABEL[r.status]}</Text>
                      </View>
                    </View>
                    <Text style={styles.feedDesc} numberOfLines={1}>{r.description}</Text>
                    <Text style={styles.feedMeta}>{categoryLabel(r.category)} • {r.location || 'No location'} • {timeAgo(r.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Reports</Text>
          {myReports.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>Tap + to submit your first report</Text>
            </View>
          ) : (
            myReports.map((r) => (
              <TouchableOpacity key={r.id} onPress={() => router.push(`/report/${r.id}` as any)} style={styles.myReportRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={styles.feedMeta}>{categoryLabel(r.category)} • {r.location || 'No location'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[r.status] }]}>
                  <Text style={styles.badgeText}>{STATUS_LABEL[r.status]}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: theme.colors.gradientStart },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroWrap: { paddingHorizontal: 16, marginTop: 12 },
  hero: { borderRadius: 16, padding: 16, overflow: 'hidden' },
  heroHello: { fontSize: 28, fontWeight: '700', color: '#fff' },
  heroSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  heroBtn: { backgroundColor: '#fff', borderRadius: 28, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 },
  heroBtnText: { color: theme.colors.primary, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  actionCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#dcebef', shadowColor: '#0A3C58', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#dcebef', alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { color: theme.colors.primaryCyan, fontSize: 12, fontWeight: '600' },
  feedCard: { backgroundColor: '#fff', borderRadius: 16, marginTop: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#dcebef' },
  feedItem: { flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center' },
  feedThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#dcebef', alignItems: 'center', justifyContent: 'center' },
  feedTitle: { flex: 1, fontWeight: '600', color: theme.colors.text, fontSize: 13 },
  feedDesc: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  feedMeta: { color: '#72787e', fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 16, marginTop: 8, borderWidth: 1, borderColor: '#dcebef' },
  emptyText: { color: theme.colors.textSecondary, marginTop: 8, fontSize: 12 },
  myReportRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#dcebef' },
});