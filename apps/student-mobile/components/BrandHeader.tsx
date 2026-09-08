import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { brand } from '@campus/ui-components';

type BrandHeaderProps = {
  variant: 'mark' | 'header' | 'hero' | 'anonymous';
  title?: string;
};

/**
 * Uniform brand lockup for student-mobile.
 * Mirrors admin-web BrandLogo: same dimensions, title sizes and spacing.
 *
 * Auth spec (source of truth): anonymous/login/signup-hero share one
 * transparent/floating config — full lockup (240x212) directly on the
 * teal->cyan gradient, no white card/surface/shadow behind the mark.
 * Only the "Anonymous Mode Enabled" pill differentiates anonymous.
 */
export function BrandHeader({ variant, title }: BrandHeaderProps) {
  if (variant === 'mark') {
    return (
      <View style={styles.markRow}>
        <Image
          source={require('@/assets/icon.png')}
          style={styles.markImage}
          resizeMode="contain"
        />
        <Text style={styles.markTitle}>{title ?? 'CampusFix'}</Text>
      </View>
    );
  }

  if (variant === 'header') {
    return (
      <View style={styles.headerWrap}>
        <Image
          source={require('@/assets/campus-fix-logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (variant === 'hero') {
    return (
      <View style={styles.heroWrap}>
        <Image
          source={require('@/assets/campusfix-full-logo.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Anonymous: identical transparent/floating lockup as hero, plus the
  // "Anonymous Mode Enabled" pill as the sole differentiator.
  // No white card, no surface, no shadow behind the mark.
  return (
    <View style={styles.anonWrap}>
      <Image
        source={require('@/assets/campusfix-full-logo.png')}
        style={styles.authLogo}
        resizeMode="contain"
      />
      <View style={styles.badge}>
        <Ionicons name="eye-off-outline" size={14} color="#fff" />
        <Text style={styles.badgeText}>Anonymous Mode Enabled</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  markImage: { width: brand.mark, height: brand.mark },
  markTitle: { color: '#fff', fontSize: brand.appTitle, fontWeight: '600' },
  headerWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerLogo: { width: brand.headerWidth, height: brand.headerHeight },
  heroWrap: { alignItems: 'center', justifyContent: 'center' },
  heroLogo: { width: brand.heroWidth, height: brand.heroHeight, alignSelf: 'center' },
  anonWrap: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  authLogo: {
    width: brand.authMarkWidth,
    height: brand.authMarkHeight,
    alignSelf: 'center',
  },
  badge: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
});
