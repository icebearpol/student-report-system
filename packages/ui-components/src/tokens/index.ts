export const ocean = {
  teal: '#0A3C58',
  cyan: '#46C3DB',
  ice: '#E8F7FB',
  surfaceLowest: '#ffffff',
  surfaceLow: '#e7f6fa',
  surface: '#effcff',
  surfaceContainer: '#e2f1f4',
  surfaceContainerHigh: '#dcebef',
  surfaceVariant: '#d6e5e9',
  onSurface: '#101e21',
  onVariant: '#42474d',
  outline: '#72787e',
  outlineVariant: '#c2c7ce',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  status: {
    urgent: '#EF4444',
    progress: '#F59E0B',
    resolved: '#10B981',
    review: '#3B82F6',
  },
} as const;

export const gradients = {
  brand: 'linear-gradient(to right, #0A3C58, #46C3DB)',
  brandVertical: 'linear-gradient(to bottom, #0A3C58, #46C3DB)',
} as const;

export const colors = {
  primary: {
    50: '#e7f6fa',
    100: '#a5eeff',
    200: '#6ee4fd',
    300: '#5ed6ee',
    400: '#46C3DB',
    500: '#0A3C58',
    600: '#0A3C58',
    700: '#00263b',
    800: '#001e30',
    900: '#001e30',
  },
  success: {
    50: '#f0fdf4',
    500: '#10B981',
    700: '#0bb880',
  },
  warning: {
    50: '#fffbeb',
    500: '#F59E0B',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    500: '#EF4444',
    700: '#ba1a1a',
  },
  neutral: {
    50: '#E8F7FB',
    100: '#effcff',
    200: '#d6e5e9',
    300: '#c2c7ce',
    400: '#72787e',
    500: '#42474d',
    600: '#101e21',
    700: '#101e21',
    800: '#101e21',
    900: '#101e21',
  },
  ocean: {
    50: '#E8F7FB',
    100: '#e7f6fa',
    200: '#a2cbed',
    300: '#46C3DB',
    400: '#0A3C58',
    500: '#0A3C58',
    600: '#00263b',
    700: '#001e30',
    800: '#001e30',
    900: '#001e30',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  '2xl': 32,
  loginCard: 36,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
} as const;
