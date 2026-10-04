export const colors = {
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  accent: '#40916C',
  danger: '#D00000',
  warning: '#E85D04',
  notice: '#0077B6',
  success: '#2DC653',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212529',
  textMuted: '#6C757D',
  border: '#DEE2E6',
  pinRed: '#E63946',
  pinYellow: '#F4A261',
  pinGreen: '#2A9D8F',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Submitted':
    case 'Unassigned':
      return colors.pinRed;
    case 'Under Review':
    case 'Awaiting Input':
      return colors.pinYellow;
    case 'In Progress':
      return colors.warning;
    case 'Resolved':
      return colors.pinGreen;
    default:
      return colors.textMuted;
  }
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'Low Impact':
      return colors.notice;
    case 'Moderate':
      return colors.accent;
    case 'High Priority':
      return colors.warning;
    case 'Immediate Safety Risk':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Notice':
      return colors.notice;
    case 'Warning':
      return colors.warning;
    case 'Critical Emergency':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

export function getPinColor(status: string, department?: string): string {
  if (status === 'Resolved') return colors.pinGreen;
  if (status === 'In Progress' || status === 'Under Review' || status === 'Awaiting Input')
    return colors.pinYellow;
  if (department === 'Unassigned' || status === 'Submitted') return colors.pinRed;
  return colors.pinRed;
}
