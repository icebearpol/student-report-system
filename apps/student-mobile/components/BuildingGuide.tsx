import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BUILDINGS, GROUP_COLORS, GROUP_LABELS, BuildingGroup } from '@/lib/campusMap';
import { theme } from '@/constants/theme';

export function BuildingGuide({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { width: Math.min(width * 0.92, 720), maxHeight: height * 0.88 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Campus Buildings</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator>
            <View style={styles.groupRow}>
              {(Object.keys(GROUP_LABELS) as BuildingGroup[]).map((g) => (
                <View key={g} style={styles.groupItem}>
                  <View style={[styles.groupDot, { backgroundColor: GROUP_COLORS[g] }]} />
                  <Text style={styles.groupText}>{GROUP_LABELS[g]}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {BUILDINGS.map((b) => (
                <View key={b.n} style={styles.row}>
                  <View style={[styles.badge, { backgroundColor: GROUP_COLORS[b.group] }]}>
                    <Text style={styles.badgeText}>{b.n}</Text>
                  </View>
                  <Text style={styles.name} numberOfLines={2}>{b.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.note}>This list is a guide only. Pin the exact spot on the map.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(16,30,33,0.5)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  groupItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  groupDot: { width: 10, height: 10, borderRadius: 3 },
  groupText: { fontSize: 11, color: theme.colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingRight: 8 },
  badge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  name: { flex: 1, fontSize: 12.5, color: theme.colors.text },
  note: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 },
});