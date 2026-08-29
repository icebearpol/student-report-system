import type { ReportPriority, ReportStatus } from '@campus/shared-types';
import { getPriorityBadge, getStatusBadge } from '@campus/ui-components';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface BadgeProps {
  label: string;
  backgroundColor: string;
  textColor: string;
}

function Badge({ label, backgroundColor, textColor }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = getStatusBadge(status);
  return <Badge {...config} />;
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const config = getPriorityBadge(priority);
  return <Badge {...config} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
});
