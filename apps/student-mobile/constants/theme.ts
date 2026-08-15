import { colors, spacing, fontSize, fontWeight, borderRadius } from '@campus/ui-components';

export const theme = {
  colors: {
    primary: colors.primary[600],
    primaryLight: colors.primary[50],
    background: colors.neutral[50],
    surface: '#ffffff',
    text: colors.neutral[900],
    textSecondary: colors.neutral[500],
    border: colors.neutral[200],
    success: colors.success[500],
    warning: colors.warning[500],
    danger: colors.danger[500],
  },
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
};

export type Theme = typeof theme;
