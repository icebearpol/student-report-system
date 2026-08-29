import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { currentStudent, getReportsByUser } from '@campus/mock-data';
import { ReportCard } from '@/components/ReportCard';
import { theme } from '@/constants/theme';
import { fabShadow } from '@/constants/platformShadow';

export default function HomeScreen() {
  const router = useRouter();
  const reports = getReportsByUser(currentStudent.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {currentStudent.name.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>
            {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
          </Text>
        </View>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push('/new-report')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {reports.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={theme.colors.border}
          />
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button to submit your first campus report
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportCard report={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...fabShadow(theme.colors.primary),
  },
  list: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
