import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUnreadCount } from '@/lib/notifications';

export function NotificationBell({ color = '#fff' }: { color?: string }) {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = () => {
        getUnreadCount()
          .then((n) => {
            if (active) setCount(n);
          })
          .catch(() => {});
      };
      load();
      const timer = setInterval(load, 30000);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [])
  );

  return (
    <TouchableOpacity onPress={() => router.push('/notifications')} hitSlop={10}>
      <Ionicons name="notifications-outline" size={22} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#E5484D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});