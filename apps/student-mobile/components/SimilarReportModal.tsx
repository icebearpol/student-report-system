import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { colors } from '@campus/ui-components';
import type { Ticket } from '@campus/shared-types';

interface Props {
  visible: boolean;
  similarTicket: Ticket | null;
  onMeToo: () => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export function SimilarReportModal({
  visible,
  similarTicket,
  onMeToo,
  onCreateNew,
  onClose,
}: Props) {
  if (!similarTicket) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>🤖</Text>
          <Text style={styles.title}>Similar Report Detected</Text>
          <Text style={styles.subtitle}>
            Our ML model found an 85%+ match with an existing report.
          </Text>
          <View style={styles.matchBox}>
            <Text style={styles.matchId}>{similarTicket.id}</Text>
            <Text style={styles.matchDesc} numberOfLines={2}>
              {similarTicket.description}
            </Text>
            <Text style={styles.matchMeta}>
              {similarTicket.location} · {similarTicket.meTooCount} Me Too
            </Text>
          </View>
          <Text style={styles.hint}>
            Tap "Me Too" to add your voice without creating a duplicate ticket.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={onMeToo}>
            <Text style={styles.primaryText}>Me Too (+1)</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onCreateNew}>
            <Text style={styles.secondaryText}>Create New Report Anyway</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  icon: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  matchBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchId: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: colors.textMuted },
  matchDesc: { fontSize: 14, marginTop: 4 },
  matchMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12 },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  secondaryText: { color: colors.text, fontSize: 14 },
  cancel: { color: colors.textMuted, marginTop: 12, fontSize: 13 },
});
