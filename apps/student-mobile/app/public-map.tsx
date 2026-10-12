import { useEffect, useMemo, useState } from 'react';
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
import type {
  MapPin,
  ReportCategory,
  ReportStatus,
} from '@campus/shared-types';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { fetchMapPins } from '@campus/mock-data';
import { StatusBadge } from '@/components/Badge';
import { theme } from '@/constants/theme';

const categoryFilters: Array<ReportCategory | 'all'> = [
  'all',
  'maintenance',
  'safety',
  'facilities',
  'it_support',
  'other',
];

const statusFilters: Array<ReportStatus | 'all'> = [
  'all',
  'pending',
  'in_review',
  'resolved',
];

export default function PublicMapScreen() {
  const router = useRouter();
  // BACKEND SEAM: pins load through fetchMapPins() only — never touch
  // mock-data arrays directly. Swap the accessor body for
  // GET /api/map-pins when the backend lands; component logic stays.
  const [pins, setPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [status, setStatus] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    let mounted = true;
    // Simulated async: mock resolves immediately today; real fetch
    // will populate isLoading/error/data through this same branch.
    fetchMapPins()
      .then((data) => {
        if (mounted) {
          setPins(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Could not load map pins. Please try again.');
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      pins.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          (status === 'all' || p.status === status),
      ),
    [pins, category, status],
  );

  function retry() {
    setIsLoading(true);
    setError('');
    fetchMapPins()
      .then((data) => {
        setPins(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Could not load map pins. Please try again.');
        setIsLoading(false);
      });
  }

  return (
    <View style={styles.container}>
      {/* BACKEND/MAP TODO: Replace placeholder with react-native-maps
          (or Expo's MapView). Plot pins from getMapPins(). Needs
          Report.latitude/longitude populated server-side via geocoding. */}
      <View style={styles.mapPlaceholder}>
        <Ionicons
          name="map-outline"
          size={48}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.mapText}>Map View — Public issues plotted</Text>
        <Text style={styles.mapSub}>
          {isLoading ? 'Loading pins…' : `${filtered.length} pins`}
        </Text>
      </View>

      <View style={styles.filters}>
        <FlatList
          data={categoryFilters}
          horizontal
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setCategory(item)}
              style={[styles.chip, category === item && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === item && styles.chipTextActive,
                ]}
              >
                {item === 'all' ? 'All' : REPORT_CATEGORY_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          data={statusFilters}
          horizontal
          keyExtractor={(s) => s}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setStatus(item)}
              style={[styles.chip, status === item && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  status === item && styles.chipTextActive,
                ]}
              >
                {item === 'all'
                  ? 'Any status'
                  : item === 'in_review'
                    ? 'In Progress'
                    : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.centerText}>Loading public issues…</Text>
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
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="map-outline"
            size={48}
            color={theme.colors.border}
          />
          <Text style={styles.centerText}>
            No public issues match these filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/report/${item.id}` as any)}
              style={styles.pinCard}
              activeOpacity={0.8}
            >
              <View style={styles.pinHeader}>
                <Text style={styles.pinTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.pinMeta} numberOfLines={1}>
                {REPORT_CATEGORY_LABELS[item.category]} • {item.location}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    paddingVertical: 36,
    borderRadius: 16,
    backgroundColor: '#e7f6fa',
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  mapText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  mapSub: { color: theme.colors.textSecondary, fontSize: 12 },
  filters: { paddingTop: 12 },
  chipRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  centerText: { color: theme.colors.textSecondary, fontSize: 14 },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  pinCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcebef',
  },
  pinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pinTitle: { flex: 1, fontWeight: '600', color: theme.colors.text },
  pinMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
});
