import { colors, spacing, fontSize, fontWeight, borderRadius, ocean, gradients, brand } from '@campus/ui-components';

export const theme = {
  colors: {
    primary: ocean.teal,
    primaryCyan: ocean.cyan,
    primaryLight: ocean.ice,
    background: ocean.ice,
    surface: ocean.surfaceLowest,
    surfaceLow: ocean.surfaceLow,
    text: ocean.onSurface,
    textSecondary: ocean.onVariant,
    border: ocean.outlineVariant,
    outline: ocean.outline,
    success: ocean.status.resolved,
    warning: ocean.status.progress,
    danger: ocean.status.urgent,
    review: ocean.status.review,
    gradientStart: ocean.teal,
    gradientEnd: ocean.cyan,
  },
  gradients,
  brand,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
};

export type Theme = typeof theme;
