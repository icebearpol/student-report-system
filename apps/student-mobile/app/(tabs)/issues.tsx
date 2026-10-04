import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useCampusStore } from '@campus/mock-data';
import { colors, getUrgencyColor, getStatusColor } from '@campus/ui-components';

export default function IssuesScreen() {
  const { tickets, meToo } = useCampusStore();
  const publicTickets = [...tickets]
    .filter((t) => t.status !== 'Resolved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Public Issues</Text>
      <Text style={styles.subheading}>
        Tap "Me Too" to stack your report without creating duplicates.
      </Text>

      {publicTickets.map((t) => (
        <View key={t.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.anonId}>{t.anonymousReporterId}</Text>
            <Text style={styles.date}>
              {new Date(t.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.tags}>
            <Tag label={t.urgency} color={getUrgencyColor(t.urgency)} />
            <Tag label={t.status} color={getStatusColor(t.status)} />
            <Tag label={t.category} color={colors.primary} />
          </View>
          <Text style={styles.location}>📍 {t.location}</Text>
          <Text style={styles.description}>{t.description}</Text>
          <Pressable style={styles.meTooBtn} onPress={() => meToo(t.id)}>
            <Text style={styles.meTooText}>👍 Me Too ({t.meTooCount})</Text>
          </Pressable>
        </View>
      ))}

      {publicTickets.length === 0 && (
        <Text style={styles.empty}>No open public issues right now.</Text>
      )}
    </ScrollView>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.primary },
  subheading: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  anonId: { fontFamily: 'monospace', fontSize: 12, color: colors.textMuted },
  date: { fontSize: 11, color: colors.textMuted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 10, fontWeight: '600' },
  location: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14, color: colors.text, lineHeight: 20 },
  meTooBtn: {
    marginTop: 12,
    backgroundColor: `${colors.accent}15`,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
  },
  meTooText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
