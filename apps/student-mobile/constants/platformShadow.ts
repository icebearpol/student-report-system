import { Platform, type ViewStyle } from 'react-native';

export function cardShadow(): ViewStyle {
  return Platform.select({
    web: { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  }) as ViewStyle;
}

export function fabShadow(color: string): ViewStyle {
  return Platform.select({
    web: { boxShadow: `0 4px 8px ${color}4D` },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as ViewStyle;
}
