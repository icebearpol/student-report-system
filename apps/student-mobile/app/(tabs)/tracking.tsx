import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useCampusStore } from '@campus/mock-data';
import { colors, getStatusColor } from '@campus/ui-components';
import { StatusTimeline } from '../../components/StatusTimeline';
import { ChatPanel } from '../../components/ChatPanel';

export default function TrackingScreen() {
  const { getMyTickets } = useCampusStore();
  const myTickets = getMyTickets();
  const [selectedId, setSelectedId] = useState<string | null>(
    myTickets[0]?.id ?? null
  );

  const selected = myTickets.find((t) => t.id === selectedId);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>My Reports</Text>
      <Text style={styles.subheading}>Track status and chat with staff anonymously.</Text>

      {myTickets.length === 0 ? (
        <Text style={styles.empty}>
          You haven't submitted any reports yet. Tap + to create one.
        </Text>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {myTickets.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.tab, selectedId === t.id && styles.tabActive]}
                onPress={() => setSelectedId(t.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedId === t.id && styles.tabTextActive,
                  ]}
                >
                  {t.id}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {selected && (
            <View style={styles.detail}>
              <View style={styles.statusRow}>
                <Text style={styles.detailTitle}>{selected.location}</Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${getStatusColor(selected.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: getStatusColor(selected.status) },
                    ]}
                  >
                    {selected.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.desc}>{selected.description}</Text>

              <Text style={styles.sectionLabel}>Status Timeline</Text>
              <StatusTimeline currentStatus={selected.status} />

              {selected.proofOfFixUrl && (
                <>
                  <Text style={styles.sectionLabel}>Proof of Fix</Text>
                  <Image
                    source={{ uri: selected.proofOfFixUrl }}
                    style={styles.proofImage}
                  />
                </>
              )}

              <ChatPanel ticketId={selected.id} />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.primary },
  subheading: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, fontSize: 14 },
  tabs: { marginBottom: 16 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontFamily: 'monospace', color: colors.textMuted },
  tabTextActive: { color: '#fff' },
  detail: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  desc: { fontSize: 14, color: colors.text, lineHeight: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  proofImage: { width: '100%', height: 160, borderRadius: 10 },
});
