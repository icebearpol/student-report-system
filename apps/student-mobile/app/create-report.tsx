import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCampusStore, CAMPUS_LOCATIONS, findSimilarTickets } from '@campus/mock-data';
import { colors } from '@campus/ui-components';
import { CATEGORIES, URGENCY_LEVELS } from '@campus/shared-types';
import type { TicketCategory, TicketUrgency } from '@campus/shared-types';
import { SimilarReportModal } from '../components/SimilarReportModal';
import { CampusMap } from '../components/CampusMap';
import type { Ticket } from '@campus/shared-types';

export default function CreateReportScreen() {
  const router = useRouter();
  const { addTicket, meToo, tickets } = useCampusStore();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Infrastructure');
  const [urgency, setUrgency] = useState<TicketUrgency>('Moderate');
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0].name);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [similarTicket, setSimilarTicket] = useState<Ticket | null>(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<{ mapX: number; mapY: number } | null>(null);
  const [pendingTicket, setPendingTicket] = useState<Omit<
    Ticket,
    'id' | 'anonymousReporterId' | 'meTooCount' | 'status' | 'assignedDepartment' | 'createdAt' | 'publishedToWallOfFame'
  > | null>(null);

  const loc = CAMPUS_LOCATIONS.find((l) => l.name === location);

  const buildPartial = () => ({
    category,
    location,
    description,
    urgency,
    mediaUrl: mediaType
      ? `https://picsum.photos/seed/new-${Date.now()}/400/300`
      : undefined,
    mapX: pickedPoint?.mapX ?? loc?.mapX,
    mapY: pickedPoint?.mapY ?? loc?.mapY,
  });

  const handleScanLocation = () => {
    const nearest =
      CAMPUS_LOCATIONS[Math.floor(Math.random() * CAMPUS_LOCATIONS.length)];
    setLocation(nearest.name);
    setPickedPoint(null);
    Alert.alert('Location Tag Scanned', `Detected: ${nearest.name} (${nearest.tag})`);
  };

  const handlePickLocation = (picked: { name: string; mapX: number; mapY: number }) => {
    setLocation(picked.name);
    setPickedPoint({ mapX: picked.mapX, mapY: picked.mapY });
    setShowMapPicker(false);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the issue.');
      return;
    }
    const partial = buildPartial();
    const similar = findSimilarTickets(description, location, tickets);

    if (similar) {
      setSimilarTicket(similar);
      setPendingTicket(partial);
      setShowSimilar(true);
      return;
    }

    const { ticket } = addTicket(partial);
    Alert.alert('Report Submitted', `Ticket ${ticket.id} created.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleMeToo = () => {
    if (similarTicket) meToo(similarTicket.id);
    setShowSimilar(false);
    Alert.alert('Me Too Added', 'Your voice has been stacked on the existing report.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleCreateNew = () => {
    setShowSimilar(false);
    if (pendingTicket) {
      const { ticket } = addTicket(pendingTicket);
      Alert.alert('Report Submitted', `Ticket ${ticket.id} created.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const urgencyIndex = URGENCY_LEVELS.indexOf(urgency);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.step}>Step 1 of 2 — Report Details</Text>

      <Text style={styles.label}>Media Upload</Text>
      <View style={styles.mediaRow}>
        <Pressable
          style={[styles.mediaBtn, mediaType === 'photo' && styles.mediaBtnActive]}
          onPress={() => setMediaType('photo')}
        >
          <Text style={styles.mediaEmoji}>📷</Text>
          <Text style={styles.mediaLabel}>Photo</Text>
        </Pressable>
        <Pressable
          style={[styles.mediaBtn, mediaType === 'video' && styles.mediaBtnActive]}
          onPress={() => setMediaType('video')}
        >
          <Text style={styles.mediaEmoji}>🎥</Text>
          <Text style={styles.mediaLabel}>5s Video</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Location</Text>
      <View style={styles.locationRow}>
        <TextInput
          style={styles.locationInput}
          value={location}
          onChangeText={(t) => {
            setLocation(t);
            setPickedPoint(null);
          }}
          placeholder="Auto-detected location"
        />
        <Pressable style={styles.scanBtn} onPress={handleScanLocation}>
          <Text style={styles.scanText}>Scan Tag</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.mapToggle, showMapPicker && styles.mapToggleActive]}
        onPress={() => setShowMapPicker((v) => !v)}
      >
        <Text style={[styles.mapToggleText, showMapPicker && styles.mapToggleTextActive]}>
          {showMapPicker ? 'Hide map ▲' : 'Pick on map ▼'}
          {pickedPoint ? ` — ${location} (${pickedPoint.mapX}, ${pickedPoint.mapY})` : ''}
        </Text>
      </Pressable>
      {showMapPicker && (
        <View style={styles.mapPickerWrap}>
          <CampusMap pickMode onPickLocation={handlePickLocation} />
        </View>
      )}

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.categoryChip, category === c && styles.categoryActive]}
            onPress={() => setCategory(c)}
          >
            <Text
              style={[
                styles.categoryText,
                category === c && styles.categoryTextActive,
              ]}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Urgency</Text>
      <View style={styles.urgencyRow}>
        {URGENCY_LEVELS.map((u, idx) => (
          <Pressable key={u} onPress={() => setUrgency(u)} style={styles.urgencyDot}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    idx <= urgencyIndex ? colors.primary : colors.border,
                  transform: [{ scale: idx === urgencyIndex ? 1.3 : 1 }],
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
      <Text style={styles.urgencyLabel}>{urgency}</Text>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textarea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the issue in detail..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report →</Text>
      </Pressable>

      <SimilarReportModal
        visible={showSimilar}
        similarTicket={similarTicket}
        onMeToo={handleMeToo}
        onCreateNew={handleCreateNew}
        onClose={() => setShowSimilar(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  step: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  mediaRow: { flexDirection: 'row', gap: 12 },
  mediaBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mediaBtnActive: { borderColor: colors.accent, backgroundColor: `${colors.accent}10` },
  mediaEmoji: { fontSize: 28 },
  mediaLabel: { fontSize: 13, marginTop: 4, color: colors.text },
  locationRow: { flexDirection: 'row', gap: 8 },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.surface,
  },
  scanBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  scanText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  mapToggle: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  mapToggleActive: { borderColor: colors.primary },
  mapToggleText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  mapToggleTextActive: { fontWeight: '700' },
  mapPickerWrap: { marginTop: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: 13, color: colors.text },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  urgencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  urgencyDot: { padding: 8 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  urgencyLabel: {
    textAlign: 'center',
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: colors.surface,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
