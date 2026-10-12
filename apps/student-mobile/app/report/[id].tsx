import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReportById, ReportDetail, hasUpvoted, markUpvoted, deleteReport, getAnonymousReportIds, photoUrl } from '@/lib/reports';
import { upvoteReport, getCurrentUser, AuthUser } from '@/lib/auth';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { formatDateTime } from '@campus/ui-components';
import { StatusBadge, PriorityBadge } from '@/components/Badge';
import { theme } from '@/constants/theme';
import { PinnedMap } from '@/components/PinnedMap';
import { MessageAdminCard } from '@/components/MessageAdminCard';

export default function ReportDetailScreen() {
  const [isMyAnonymousReport, setIsMyAnonymousReport] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [alreadyUpvoted, setAlreadyUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      getAnonymousReportIds().then((ids) => setIsMyAnonymousReport(ids.includes(id)));
      getCurrentUser().then((u) => { if (!cancelled) setCurrentUser(u); });
      hasUpvoted(id).then((v) => { if (!cancelled) setAlreadyUpvoted(v); });
      getReportById(id)
        .then((r) => {
          if (!cancelled) setReport(r);
        })
        .catch((e) => {
          if (!cancelled) setError(e?.message || 'Could not load this report.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  const handleUpvote = async () => {
    if (!report) return;
    setUpvoting(true);
    try {
      await upvoteReport(report.id);
      await markUpvoted(report.id);
      setAlreadyUpvoted(true);
      setLocalUpvotes((report.upvotes || 0) + 1);
    } catch (e: any) {
      Alert.alert('Could not upvote', e?.message || 'Please sign in to upvote.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete this report?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteReport(report!.id);
              router.replace('/(tabs)');
            } catch (e: any) {
              Alert.alert('Could not delete', e?.message || 'Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Report not found'}</Text>
      </View>
    );
  }

  const categoryLabel = report.category && REPORT_CATEGORY_LABELS[report.category as keyof typeof REPORT_CATEGORY_LABELS]
    ? REPORT_CATEGORY_LABELS[report.category as keyof typeof REPORT_CATEGORY_LABELS]
    : report.category || 'General';

  const isOwner = (!!currentUser && !!report && report.authorId === currentUser.id) || isMyAnonymousReport;
  const upvoteDisabled = upvoting || alreadyUpvoted || isOwner;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgeRow}>
        <StatusBadge status={report.status} />
        {report.priority && <PriorityBadge priority={report.priority as any} />}
      </View>

      <Text style={styles.title}>{report.title}</Text>

      {currentUser && report.authorId === currentUser.id && <MessageAdminCard reportId={report.id} />}

      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{report.location || 'No location given'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="grid-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{categoryLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{formatDateTime(report.createdAt)}</Text>
        </View>
        {report.imageUrl && (
          <Image
            source={{ uri: photoUrl(report.imageUrl) as string }}
            style={{ width: '100%', height: 220, borderRadius: 16, marginBottom: 12, backgroundColor: '#e7f6fa' }}
          />
        )}
        {!report.anonymous && report.author && (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{(report.author as any).username || report.author.fullName}</Text>
          </View>
        )}
        {report.anonymous && (
          <View style={styles.metaRow}>
            <Ionicons name="eye-off-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>Submitted anonymously</Text>
          </View>
        )}
      </View>

      {report.mapX != null && report.mapY != null && (
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={styles.sectionTitle}>Location on Map</Text>
          <PinnedMap x={report.mapX} y={report.mapY} />
        </View>
      )}

      <TouchableOpacity onPress={handleUpvote} disabled={upvoteDisabled} activeOpacity={0.85} style={[styles.upvoteBtn, upvoteDisabled && styles.upvoteBtnDisabled]}>
        <View style={[styles.upvoteIconWrap, upvoteDisabled && styles.upvoteIconWrapDisabled]}>
          <Ionicons name={alreadyUpvoted ? 'thumbs-up' : 'thumbs-up-outline'} size={20} color={upvoteDisabled ? theme.colors.textSecondary : '#fff'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.upvoteText, upvoteDisabled && styles.upvoteTextDisabled]}>
            {isOwner
              ? "You submitted this report"
              : upvoting
              ? 'Upvoting...'
              : alreadyUpvoted
              ? 'You upvoted this'
              : 'Upvote this issue'}
          </Text>
          <Text style={styles.upvoteCount}>
            {localUpvotes ?? report.upvotes ?? 0} {(localUpvotes ?? report.upvotes ?? 0) === 1 ? 'upvote' : 'upvotes'}
          </Text>
        </View>
      </TouchableOpacity>

      {isOwner && (
        <TouchableOpacity onPress={handleDelete} disabled={deleting} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          <Text style={styles.deleteText}>{deleting ? 'Deleting...' : 'Delete this report'}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{report.description}</Text>

      {report.comments && report.comments.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Comments</Text>
          {report.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentDate}>{formatDateTime(comment.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{comment.body}</Text>
            </View>
          ))}
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
    marginBottom: theme.spacing.sm,
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
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginTop: 4,
    marginBottom: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  upvoteBtnDisabled: {
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  upvoteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvoteIconWrapDisabled: {
    backgroundColor: theme.colors.surface,
  },
  upvoteText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  upvoteCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  upvoteTextDisabled: {
    color: theme.colors.textSecondary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: theme.spacing.lg,
  },
  deleteText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.danger,
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