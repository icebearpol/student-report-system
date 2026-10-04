import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { useCampusStore, CAMPUS_LOCATIONS } from '@campus/mock-data';
import {
  colors,
  getPinColor,
  getBuildingStats,
  BUILDING_FOOTPRINTS,
} from '@campus/ui-components';
import { BroadcastBannerRN } from './BroadcastBannerRN';

const { width } = Dimensions.get('window');

type StatusFilter = 'All' | 'Submitted' | 'In Progress';

interface CampusMapProps {
  /** When true, tapping a building calls onPickLocation instead of opening details */
  pickMode?: boolean;
  onPickLocation?: (loc: { name: string; mapX: number; mapY: number }) => void;
  selectedBuilding?: string | null;
  onSelectBuilding?: (name: string | null) => void;
}

function bbox(polygon: { x: number; y: number }[]) {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const w = Math.max(...xs) - left;
  const h = Math.max(...ys) - top;
  return { left, top, w, h };
}

export function CampusMap({
  pickMode,
  onPickLocation,
  selectedBuilding: controlled,
  onSelectBuilding,
}: CampusMapProps = {}) {
  const { tickets } = useCampusStore();
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [zoom, setZoom] = useState(1);
  const [detailVisible, setDetailVisible] = useState(false);
  const [legendVisible, setLegendVisible] = useState(false);

  const selectedBuilding = controlled !== undefined ? controlled : internalSelected;
  const setSelected = (name: string | null) => {
    if (controlled === undefined) setInternalSelected(name);
    onSelectBuilding?.(name);
  };

  const stats = useMemo(() => getBuildingStats(tickets), [tickets]);

  const filteredTickets = tickets.filter((t) => {
    if (t.status === 'Resolved') return false;
    if (filter === 'All') return true;
    if (filter === 'Submitted')
      return t.status === 'Submitted' || t.assignedDepartment === 'Unassigned';
    return t.status === 'In Progress' || t.status === 'Under Review' || t.status === 'Awaiting Input';
  });

  const selectedTickets = selectedBuilding
    ? filteredTickets.filter((t) => t.location === selectedBuilding)
    : [];
  const selectedStat = stats.find((s) => s.name === selectedBuilding);

  const handleBuildingPress = (name: string) => {
    if (pickMode && onPickLocation) {
      const loc = CAMPUS_LOCATIONS.find((l) => l.name === name);
      const st = stats.find((s) => s.name === name);
      const mapX = loc?.mapX ?? st?.x ?? 50;
      const mapY = loc?.mapY ?? st?.y ?? 50;
      onPickLocation({ name, mapX, mapY });
      return;
    }
    setSelected(selectedBuilding === name ? null : name);
    if (selectedBuilding !== name) setDetailVisible(true);
  };

  const handlePinPress = (location: string) => {
    handleBuildingPress(location);
  };

  return (
    <View>
      {/* Filter chips + zoom */}
      <View style={styles.toolbar}>
        {(['All', 'Submitted', 'In Progress'] as StatusFilter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
        <View style={styles.zoomRow}>
          <Pressable onPress={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} style={styles.zoomBtn}>
            <Text style={styles.zoomText}>−</Text>
          </Pressable>
          <Pressable onPress={() => setZoom(1)} style={styles.zoomBtn}>
            <Text style={styles.zoomTextSmall}>{Math.round(zoom * 100)}%</Text>
          </Pressable>
          <Pressable
            onPress={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))} style={styles.zoomBtn}>
            <Text style={styles.zoomText}>+</Text>
          </Pressable>
          <Pressable
            onPress={() => setLegendVisible((v) => !v)}
            style={[styles.chip, legendVisible && styles.chipActive]}
          >
            <Text style={[styles.chipText, legendVisible && styles.chipTextActive]}>
              🗺 Legend
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.container}>
        <View style={[styles.zoomInner, { transform: [{ scale: zoom }] }]}>
          <Image
            // @ts-ignore — bundled campus image (SMC Tagum transparent PNG)
            source={require('../assets/campmap.png')}
            style={styles.mapImage}
            resizeMode="stretch"
          />
          {/* Building footprints (bounding-box overlay — aligns with % coords) */}
          {BUILDING_FOOTPRINTS.map((b) => {
            const box = bbox(b.polygon);
            const st = stats.find((s) => s.name === b.name);
            const isSelected = selectedBuilding === b.name;
            return (
              <Pressable
                key={b.name}
                onPress={() => handleBuildingPress(b.name)}
                style={[
                  styles.building,
                  {
                    left: `${box.left}%`,
                    top: `${box.top}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    backgroundColor: st?.openCount
                      ? `${st.worstColor}55`
                      : 'rgba(27,67,50,0.18)',
                    borderColor: isSelected ? '#111' : st?.worstColor ?? colors.primary,
                    borderWidth: isSelected ? 2.5 : 1.5,
                  },
                ]}
              >
                <Text style={styles.buildingLabel} numberOfLines={1}>
                  {b.name}
                  {st?.openCount ? ` (${st.openCount})` : ''}
                </Text>
              </Pressable>
            );
          })}
          {/* Pins */}
          {filteredTickets.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => handlePinPress(t.location)}
              hitSlop={12}
              style={[
                styles.pinTouch,
                {
                  left: `${t.mapX ?? 50}%`,
                  top: `${t.mapY ?? 50}%`,
                },
              ]}
            >
              <View
                style={[
                  styles.pin,
                  { backgroundColor: getPinColor(t.status, t.assignedDepartment) },
                ]}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.legend}>
          <LegendDot color={colors.pinRed} label="Unassigned" />
          <LegendDot color={colors.pinYellow} label="In Progress" />
          <LegendDot color={colors.pinGreen} label="Fixed" />
        </View>
        {pickMode && (
          <View style={styles.pickHint}>
            <Text style={styles.pickHintText}>Tap a building to set location</Text>
          </View>
        )}
      </View>

      {/* Building detail sheet */}
      <Modal
        visible={detailVisible && !!selectedBuilding && !pickMode}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDetailVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{selectedBuilding}</Text>
            <Text style={styles.sheetSub}>
              {selectedStat?.openCount ?? 0} open issue
              {(selectedStat?.openCount ?? 0) !== 1 ? 's' : ''}
              {selectedStat && selectedStat.openCount > 0
                ? ` — ${Object.entries(selectedStat.byStatus).map(([s, n]) => `${s}: ${n}`).join(', ')}`
                : ' — all clear 🎉'}
            </Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {selectedTickets.map((t) => (
                <View key={t.id} style={styles.ticketRow}>
                  <View
                    style={[
                      styles.ticketDot,
                      { backgroundColor: getPinColor(t.status, t.assignedDepartment) },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketDesc} numberOfLines={2}>
                      {t.description}
                    </Text>
                    <Text style={styles.ticketMeta}>
                      {t.id} · {t.status} · 👍 {t.meTooCount}
                    </Text>
                  </View>
                </View>
              ))}
              {selectedTickets.length === 0 && (
                <Text style={styles.emptyText}>No open issues in this filter.</Text>
              )}
            </ScrollView>
            <Pressable style={styles.closeBtn} onPress={() => setDetailVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Toggleable legend viewer */}
      <Modal
        visible={legendVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLegendVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLegendVisible(false)}>
          <Pressable style={styles.legendSheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Campus Map Legend</Text>
            <Image
              // @ts-ignore — bundled legend image
              source={require('../assets/campus-map-with-legend.png')}
              style={styles.legendImage}
              resizeMode="contain"
            />
            <Pressable style={styles.closeBtn} onPress={() => setLegendVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

export function WallOfFameCarousel() {
  const { getWallOfFameTickets } = useCampusStore();
  const items = getWallOfFameTickets();

  if (items.length === 0) {
    return (
      <View style={styles.emptyWall}>
        <Text style={styles.emptyText}>No fixes published yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {items.map((t) => (
        <View key={t.id} style={styles.carouselItem}>
          <Text style={styles.carouselTitle}>{t.location}</Text>
          <View style={styles.beforeAfter}>
            {t.mediaUrl && (
              <View style={styles.photoCol}>
                <Text style={styles.photoLabel}>Before</Text>
                <Image source={{ uri: t.mediaUrl }} style={styles.photo} />
              </View>
            )}
            {t.proofOfFixUrl && (
              <View style={styles.photoCol}>
                <Text style={styles.photoLabel}>After</Text>
                <Image source={{ uri: t.proofOfFixUrl }} style={styles.photo} />
              </View>
            )}
          </View>
          <Text style={styles.carouselDesc} numberOfLines={2}>
            {t.description}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  zoomRow: { marginLeft: 'auto', flexDirection: 'row', gap: 4, alignItems: 'center' },
  zoomBtn: {
    minWidth: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  zoomText: { fontSize: 16, fontWeight: '700', color: colors.text },
  zoomTextSmall: { fontSize: 11, color: colors.text },
  container: {
    height: 260,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoomInner: { flex: 1 },
  mapImage: { position: 'absolute', width: '100%', height: '100%' },
  building: {
    position: 'absolute',
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 2,
  },
  buildingLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#111',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  pinTouch: {
    position: 'absolute',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legend: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.textMuted },
  pickHint: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pickHintText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.primary },
  sheetSub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  ticketRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-start',
  },
  ticketDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  ticketDesc: { fontSize: 13, color: colors.text },
  ticketMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  closeBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontWeight: '700' },
  legendSheet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    padding: 16,
    alignItems: 'center',
  },
  legendImage: {
    width: '100%',
    height: 300,
    marginTop: 12,
    borderRadius: 8,
  },
  carousel: { marginTop: 4 },
  carouselItem: {
    width: width * 0.75,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  carouselTitle: { fontWeight: '700', color: colors.primary, marginBottom: 8 },
  beforeAfter: { flexDirection: 'row', gap: 8 },
  photoCol: { flex: 1 },
  photoLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  photo: { width: '100%', height: 90, borderRadius: 8 },
  carouselDesc: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
  emptyWall: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textMuted, fontSize: 13 },
});
