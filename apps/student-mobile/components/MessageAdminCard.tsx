import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

export function MessageAdminCard({ reportId }: { reportId: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/chat/${reportId}` as any)}
      style={styles.wrap}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubbles" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Message an administrator</Text>
          <Text style={styles.sub}>Ask a question or add details to this report</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    borderRadius: 18,
    shadowColor: '#0A3C58',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
});