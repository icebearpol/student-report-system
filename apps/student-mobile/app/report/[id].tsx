import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReportById, getCommentsByReport, getUserById } from '@campus/mock-data';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { formatDateTime } from '@campus/ui-components';
import { StatusBadge, PriorityBadge } from '@/components/Badge';
import { theme } from '@/constants/theme';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = getReportById(id);

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  const comments = getCommentsByReport(report.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgeRow}>
        <StatusBadge status={report.status} />
        <PriorityBadge priority={report.priority} />
      </View>

      <Text style={styles.title}>{report.title}</Text>

      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{report.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="grid-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>
            {REPORT_CATEGORY_LABELS[report.category]}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{formatDateTime(report.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{report.description}</Text>

      {report.adminNotes && (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Admin Response</Text>
          <Text style={styles.notesText}>{report.adminNotes}</Text>
        </View>
      )}

      {comments.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Comments</Text>
          {comments.map((comment) => {
            const author = getUserById(comment.authorId);
            return (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {author?.name ?? 'Unknown'}
                  </Text>
                  <Text style={styles.commentDate}>
                    {formatDateTime(comment.createdAt)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  metaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  notesCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  notesTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  commentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  commentAuthor: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  commentDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  commentText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
