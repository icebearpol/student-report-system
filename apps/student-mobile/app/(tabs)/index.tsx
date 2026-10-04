import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useCampusStore } from '@campus/mock-data';
import { colors } from '@campus/ui-components';
import { BroadcastBannerRN } from '../../components/BroadcastBannerRN';
import { CampusMap, WallOfFameCarousel } from '../../components/CampusMap';

export default function DashboardScreen() {
  const { tickets } = useCampusStore();
  const openCount = tickets.filter((t) => t.status !== 'Resolved').length;

  return (
    <View style={styles.root}>
      <BroadcastBannerRN />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Awareness Hub</Text>
        <Text style={styles.subheading}>
          {openCount} open issue{openCount !== 1 ? 's' : ''} on campus
        </Text>

        <Text style={styles.sectionTitle}>Campus Map</Text>
        <CampusMap />

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Wall of Fame — Fixed Issues
        </Text>
        <WallOfFameCarousel />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.primary },
  subheading: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
});
