import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllReports, getAnonymousReportIds, Report } from '@/lib/reports';
import { getCurrentUser } from '@/lib/auth';
import {
  CAMPUS_MAP_SOURCE,
  IMAGE_ASPECT,
  MAP_ASPECT,
  MAP_CROP,
  clusterByPixels,
  worstStatus,
} from '@/lib/campusMap';
import { BuildingGuide } from '@/components/BuildingGuide';
import { theme } from '@/constants/theme';

const HEADER_H = 52;
const MAX_ZOOM = 4;
const CLUSTER_RADIUS = 34;

const STATUS_COLOR: Record<string, string> = {
  pending: theme.colors.danger,
  in_review: theme.colors.warning,
  resolved: theme.colors.success,
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Open',
  in_review: 'In Progress',
  resolved: 'Resolved',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Open' },
  { value: 'in_review', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function CampusMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scope } = useLocalSearchParams<{ scope?: string }>();
  const { width: winW, height: winH } = useWindowDimensions();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Report[] | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  const load = useCallback(async () => {
    const user = await getCurrentUser();
    const anonIds = user ? [] : await getAnonymousReportIds();
    try {
      const all = await getAllReports();
      setReports(
        scope === 'mine'
          ? all.filter((r) => (user ? r.authorId === user.id : anonIds.includes(r.id)))
          : all
      );
    } catch {
      setReports([]);
    }
    setLoading(false);
  }, [scope]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(
    () => (statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter)),
    [reports, statusFilter]
  );

  const availH = Math.max(winH - HEADER_H, 200);
  const baseW = Math.min(winW, availH * MAP_ASPECT);
  const contentW = baseW * zoom;
  const contentH = contentW / MAP_ASPECT;
  const imageH = contentW / IMAGE_ASPECT;

  const clusters = useMemo(
    () => clusterByPixels(visible, contentW, contentH, CLUSTER_RADIUS),
    [visible, contentW, contentH]
  );

  const withPin = visible.filter((r) => r.mapX != null && r.mapY != null);
  const withoutPin = visible.length - withPin.length;

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.5).toFixed(1)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)));

  const openReport = (id: string) => router.push(`/report/${id}` as any);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingLeft: Math.max(insets.left, 12), paddingRight: Math.max(insets.right, 12) },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ marginRight: 8 }}>
          <Text style={styles.title}>Campus Map</Text>
          <Text style={styles.subtitle}>
            {withPin.length} pinned{withoutPin > 0 ? ` • ${withoutPin} without a pin` : ''}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 6, alignItems: 'center' }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => {
                setStatusFilter(f.value);
                setSelected(null);
              }}
              style={[styles.chip, statusFilter === f.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, statusFilter === f.value && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.zoomGroup}>
          <TouchableOpacity onPress={zoomOut} disabled={zoom <= 1} style={styles.zoomBtn} hitSlop={6}>
            <Ionicons name="remove" size={18} color={zoom <= 1 ? theme.colors.border : theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          <TouchableOpacity onPress={zoomIn} disabled={zoom >= MAX_ZOOM} style={styles.zoomBtn} hitSlop={6}>
            <Ionicons
              name="add"
              size={18}
              color={zoom >= MAX_ZOOM ? theme.colors.border : theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setGuideOpen(true)} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="list" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ width: winW, height: availH, backgroundColor: '#eaf4f7' }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ minWidth: winW, alignItems: 'center' }}
          >
            <ScrollView
              bounces={false}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={{ width: contentW, height: availH }}
              contentContainerStyle={{ minHeight: availH, justifyContent: 'center' }}
            >
              <Pressable
                onPress={() => setSelected(null)}
                style={{ width: contentW, height: contentH, overflow: 'hidden' }}
              >
                <Image
                  source={CAMPUS_MAP_SOURCE}
                  style={{ width: contentW, height: imageH }}
                  resizeMode="stretch"
                  
                />

                {clusters.map((c, i) => {
                  const color = STATUS_COLOR[worstStatus(c.reports)];
                  const isCluster = c.reports.length > 1;
                  const isSelected =
                    !!selected && c.reports.some((r) => selected.some((s) => s.id === r.id));

                  if (!isCluster) {
                    return (
                      <Pressable
                        key={`${c.reports[0].id}-${i}`}
                        onPress={() => setSelected(c.reports)}
                        hitSlop={8}
                        style={[
                          styles.singleMarker,
                          { left: c.left, top: c.top },
                          isSelected && styles.selectedSingle,
                        ]}
                      >
                        <Ionicons name="location" size={isSelected ? 38 : 30} color={color} />
                      </Pressable>
                    );
                  }

                  return (
                    <Pressable
                      key={`cluster-${i}`}
                      onPress={() => setSelected(c.reports)}
                      hitSlop={8}
                      style={[styles.clusterMarker, { left: c.left, top: c.top }]}
                    >
                      <View
                        style={[
                          styles.clusterRing,
                          { borderColor: color },
                          isSelected && styles.clusterRingSelected,
                        ]}
                      >
                        <View style={[styles.clusterCore, { backgroundColor: color }]}>
                          <Text style={styles.clusterText}>{c.reports.length}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </Pressable>
            </ScrollView>
          </ScrollView>
        )}

        {!loading && withPin.length === 0 && (
          <View style={styles.emptyNote} pointerEvents="none">
            <Text style={styles.emptyNoteText}>No pinned issues match this filter yet.</Text>
          </View>
        )}

        {selected && (
          <View style={[styles.panel, { right: Math.max(insets.right, 8) }]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>
                {selected.length === 1 ? '1 issue here' : `${selected.length} issues here`}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} hitSlop={10}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selected.map((r) => (
                <TouchableOpacity key={r.id} style={styles.panelRow} onPress={() => openReport(r.id)}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[r.status] }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.panelRowTitle} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.panelRowMeta} numberOfLines={1}>
                      {STATUS_LABEL[r.status]} • {r.location || 'No location'} • {r.upvotes || 0} upvotes
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <BuildingGuide visible={guideOpen} onClose={() => setGuideOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eef6f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 10.5, color: theme.colors.textSecondary },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f2f7f8',
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 11.5, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#fff' },
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef6f8',
    borderRadius: 18,
    paddingHorizontal: 4,
  },
  zoomBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 11, fontWeight: '700', color: theme.colors.text, minWidth: 36, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  singleMarker: { position: 'absolute', marginLeft: -15, marginTop: -30 },
  selectedSingle: { marginLeft: -19, marginTop: -38 },
  clusterMarker: { position: 'absolute', marginLeft: -21, marginTop: -21 },
  clusterRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterRingSelected: { borderWidth: 3, backgroundColor: '#fff' },
  clusterCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  clusterText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  emptyNote: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(16,30,33,0.7)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  emptyNoteText: { color: '#fff', fontSize: 11.5 },
  panel: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 290,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  panelTitle: { fontSize: 13.5, fontWeight: '800', color: theme.colors.text },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef2f3',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  panelRowTitle: { fontSize: 12.5, fontWeight: '700', color: theme.colors.text },
  panelRowMeta: { fontSize: 10.5, color: theme.colors.textSecondary, marginTop: 2 },
});