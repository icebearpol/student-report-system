import React from 'react';
import { getStatusColor, getUrgencyColor, getSeverityColor, colors, radius, fontSize } from './tokens';

interface BadgeProps {
  label: string;
  color?: string;
  style?: React.CSSProperties;
}

function Badge({ label, color = colors.textMuted, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: radius.full,
        backgroundColor: `${color}18`,
        color,
        fontSize: fontSize.xs,
        fontWeight: 600,
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge label={status} color={getStatusColor(status)} />;
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  return <Badge label={urgency} color={getUrgencyColor(urgency)} />;
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <Badge label={severity} color={getSeverityColor(severity)} />;
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge
      label={category}
      color={colors.primary}
      style={{ backgroundColor: `${colors.primary}15` }}
    />
  );
}

export function MeTooBadge({ count }: { count: number }) {
  return (
    <Badge
      label={`Me Too · ${count}`}
      color={colors.accent}
      style={{ backgroundColor: `${colors.accent}20` }}
    />
  );
}
