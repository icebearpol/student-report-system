import React from 'react';
import { getSeverityColor, colors, spacing, fontSize } from './tokens';
import type { AlertSeverity } from '@campus/shared-types';

interface BroadcastBannerProps {
  severity: AlertSeverity;
  message: string;
  targetLocation: string;
  onDismiss?: () => void;
}

export function BroadcastBanner({
  severity,
  message,
  targetLocation,
  onDismiss,
}: BroadcastBannerProps) {
  const bg = getSeverityColor(severity);

  return (
    <div
      style={{
        backgroundColor: bg,
        color: '#fff',
        padding: `${spacing.sm}px ${spacing.md}px`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing.sm,
        fontSize: fontSize.sm,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      <span style={{ fontSize: fontSize.lg, flexShrink: 0 }}>
        {severity === 'Critical Emergency' ? '🚨' : severity === 'Warning' ? '⚠️' : 'ℹ️'}
      </span>
      <div style={{ flex: 1 }}>
        <strong>{severity}</strong>
        <span style={{ opacity: 0.85 }}> · {targetLocation}</span>
        <div style={{ marginTop: 2 }}>{message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: fontSize.lg,
            padding: 0,
            lineHeight: 1,
          }}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export function StatCard({ label, value, color = colors.primary }: StatCardProps) {
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: spacing.md,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: fontSize.xxl, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
