import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { getAllReports, photoUrl, Report } from '@/lib/reports';
import { theme } from '@/constants/theme';

type Filter = 'all' | 'active' | 'resolved';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Submitted',
  in_review: 'Under Review',
  resolved: 'Resolved',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      try {
        const all = await getAllReports();
        setReports(all.filter((r) => r.authorId === currentUser.id));
      } catch {
        setReports([]);
      }
    } else {
      setReports([]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered =
    filter === 'all'
      ? reports
      : filter === 'active'
      ? reports.filter((r) => r.status !== 'resolved')
      : reports.filter((r) => r.status === 'resolved');

  const featured = filtered.find((r) => r.id === selectedId) || filtered[0];
  const others = filtered.filter((r) => r.id !== featured?.id);

  const pick = (reportId: string) => {
    setSelectedId(reportId);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="lock-closed-outline" size={40} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyText, { textAlign: 'center', marginTop: 12 }]}>
          Sign in to view your report history.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>My Reports</Text>
      <View style={styles.filters}>
        {(['all', 'active', 'resolved'] as Filter[]).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.fBtn, filter === f && styles.fActive]}>
            <Text style={[styles.fText, filter === f && styles.fTextActive]}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Resolved'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={40} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No reports in this filter</Text>
        </View>
      )}

      {featured && (
        <View style={styles.card}>
          <View style={styles.summary}>
            <View style={styles.thumb}>
              {featured.imageUrl ? (
                <Image source={{ uri: photoUrl(featured.imageUrl) as string }} style={styles.thumbImage} />
              ) : (
                <Ionicons name="image-outline" size={24} color={theme.colors.textSecondary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{featured.title}</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.loc}>{featured.location || 'No location'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.line} />
            <View style={styles.nodeRow}>
              <View style={[styles.dot, { backgroundColor: theme.colors.success }]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
              <View>
                <Text style={[styles.nodeTitle, { color: theme.colors.success }]}>Submitted</Text>
                <Text style={styles.nodeSub}>{formatDate(featured.createdAt)}</Text>
              </View>
            </View>

            <View style={[styles.nodeRow, featured.status === 'pending' && { opacity: 0.5 }]}>
              <View style={[styles.dot, { backgroundColor: featured.status === 'pending' ? '#d6e5e9' : theme.colors.review }]}>
                <Ionicons name="eye-outline" size={12} color="#fff" />
              </View>
              <View>
                <Text style={[styles.nodeTitle, { color: featured.status === 'pending' ? theme.colors.textSecondary : theme.colors.review }]}>
                  Under Review
                </Text>
                <Text style={styles.nodeSub}>{featured.status === 'pending' ? 'Pending' : formatDate(featured.updatedAt)}</Text>
              </View>
            </View>

            <View style={[styles.nodeRow, featured.status !== 'resolved' && { opacity: 0.5 }]}>
              <View style={[styles.dot, { backgroundColor: featured.status === 'resolved' ? theme.colors.success : '#d6e5e9' }]}>
                <Ionicons name="checkmark-done-outline" size={12} color="#fff" />
              </View>
              <View>
                <Text style={[styles.nodeTitle, { color: featured.status === 'resolved' ? theme.colors.success : theme.colors.textSecondary }]}>
                  Resolved
                </Text>
                <Text style={styles.nodeSub}>{featured.status === 'resolved' ? formatDate(featured.updatedAt) : 'Pending'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity activeOpacity={0.9} style={{ flex: 1.15 }} onPress={() => router.push(`/chat/${featured.id}` as any)}>
              <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chatBtn}>
                <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                <Text style={styles.chatText}>Chat with Admin</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.fullBtn} onPress={() => router.push(`/report/${featured.id}` as any)}>
              <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.fullText}>Full report</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {others.length > 0 && <Text style={styles.sectionHint}>Tap a report to see its progress</Text>}

      {others.map((r) => (
        <TouchableOpacity key={r.id} onPress={() => pick(r.id)} style={styles.listItem}>
          <Text style={styles.listTitle}>{r.title}</Text>
          <Text style={styles.listSub}>{r.location || 'No location'} • {STATUS_LABEL[r.status]}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  filters: { flexDirection: 'row', gap: 8, marginTop: 12 },
  fBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcebef' },
  fActive: { backgroundColor: '#6ee4fd', borderColor: '#6ee4fd' },
  fText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary }, fTextActive: { color: '#004e5a' },
  empty: { alignItems: 'center', padding: 24 }, emptyText: { color: theme.colors.textSecondary, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#dcebef', shadowColor: '#0A3C58', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  summary: { flexDirection: 'row', gap: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#dcebef', paddingBottom: 12 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#e7f6fa', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  cardTitle: { fontWeight: '600', color: theme.colors.primary, fontSize: 14 }, loc: { fontSize: 12, color: theme.colors.textSecondary },
  timeline: { marginTop: 12, paddingLeft: 16, gap: 16, position: 'relative' },
  line: { position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, backgroundColor: '#d6e5e9' },
  nodeRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginLeft: -16, borderWidth: 2, borderColor: '#fff' },
  nodeTitle: { fontWeight: '600', fontSize: 13 }, nodeSub: { fontSize: 11, color: theme.colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  chatBtn: { height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chatText: { color: '#fff', fontWeight: '600', fontSize: 13.5 },
  fullBtn: { flex: 1, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: theme.colors.primary, backgroundColor: '#fff' },
  fullText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13.5 },
  sectionHint: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 18, marginBottom: -2 },
  listItem: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#dcebef' },
  listTitle: { fontWeight: '600', color: theme.colors.text }, listSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
});