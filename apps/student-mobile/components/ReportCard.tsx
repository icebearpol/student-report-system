import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Report } from '@campus/shared-types';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { formatRelativeDate, truncateText } from '@campus/ui-components';
import { StatusBadge } from './Badge';
import { theme } from '@/constants/theme';
import { cardShadow } from '@/constants/platformShadow';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/report/${report.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {report.title}
        </Text>
        <StatusBadge status={report.status} />
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {truncateText(report.description, 100)}
      </Text>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {report.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.category}>
            {REPORT_CATEGORY_LABELS[report.category]}
          </Text>
          <Text style={styles.date}>
            {formatRelativeDate(report.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...cardShadow(),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    gap: theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
