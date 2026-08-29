import type { ReportPriority, ReportStatus } from '@campus/shared-types';
import { colors, ocean } from '../tokens';

// Deterministic mock duplicate detection: category + location token + title overlap ≤20m mock distance
export function tokenize(str: string): string[] {
  return str.toLowerCase().split(/[\s,\-]+/).filter(Boolean);
}
export function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a); const sb = new Set(b);
  const inter = [...sa].filter(x=>sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size;
  return union===0?0:inter/union;
}
export function locationTokensOverlap(a: string, b: string): number {
  return jaccard(tokenize(a), tokenize(b));
}
export function checkDuplicateMock(
  input: { category: string; location: string; title: string },
  reports: { id:string; category:string; location:string; title:string }[]
): { reportId: string; distanceM: number } | null {
  for (const r of reports) {
    if (r.category !== input.category) continue;
    const loc = locationTokensOverlap(r.location, input.location);
    const titleSim = jaccard(tokenize(r.title), tokenize(input.title));
    if (loc > 0.3 || titleSim > 0.4) {
      const hash = [...r.id].reduce((s,c)=>s+c.charCodeAt(0),0);
      return { reportId: r.id, distanceM: 5 + (hash % 16) };
    }
  }
  return null;
}

export interface StatusBadgeConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
}

export const statusBadgeConfig: Record<ReportStatus, StatusBadgeConfig> = {
  pending: {
    label: 'Pending',
    backgroundColor: colors.warning[50],
    textColor: colors.warning[700],
  },
  in_review: {
    label: 'In Review',
    backgroundColor: colors.primary[50],
    textColor: colors.primary[700],
  },
  resolved: {
    label: 'Resolved',
    backgroundColor: colors.success[50],
    textColor: colors.success[700],
  },
  rejected: {
    label: 'Rejected',
    backgroundColor: colors.danger[50],
    textColor: colors.danger[700],
  },
};

export const priorityBadgeConfig: Record<
  ReportPriority,
  StatusBadgeConfig
> = {
  low: {
    label: 'Low',
    backgroundColor: colors.neutral[100],
    textColor: colors.neutral[600],
  },
  medium: {
    label: 'Medium',
    backgroundColor: colors.primary[50],
    textColor: colors.primary[700],
  },
  high: {
    label: 'High',
    backgroundColor: colors.warning[50],
    textColor: colors.warning[700],
  },
  urgent: {
    label: 'Urgent',
    backgroundColor: colors.danger[50],
    textColor: colors.danger[700],
  },
};

export function getStatusBadge(status: ReportStatus): StatusBadgeConfig {
  return statusBadgeConfig[status];
}

export function getPriorityBadge(priority: ReportPriority): StatusBadgeConfig {
  return priorityBadgeConfig[priority];
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
