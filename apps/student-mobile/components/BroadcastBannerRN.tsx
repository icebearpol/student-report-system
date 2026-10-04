import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useCampusStore } from '@campus/mock-data';
import { getSeverityColor, colors } from '@campus/ui-components';

export function BroadcastBannerRN() {
  const { getActiveAlert, deactivateAlert } = useCampusStore();
  const alert = getActiveAlert();

  if (!alert) return null;

  const bg = getSeverityColor(alert.severity);
  const icon =
    alert.severity === 'Critical Emergency'
      ? '🚨'
      : alert.severity === 'Warning'
        ? '⚠️'
        : 'ℹ️';

  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>
          {alert.severity} · {alert.targetLocation}
        </Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>
      <Pressable onPress={() => deactivateAlert(alert.id)} hitSlop={8}>
        <Text style={styles.dismiss}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 8,
  },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  title: { color: '#fff', fontWeight: '700', fontSize: 13 },
  message: { color: '#fff', fontSize: 12, marginTop: 2, opacity: 0.95 },
  dismiss: { color: '#fff', fontSize: 22, lineHeight: 22, paddingHorizontal: 4 },
});
