import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { currentStudent } from '@campus/mock-data';
import { theme } from '@/constants/theme';

export default function ProfileScreen() {
  const initials = currentStudent.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <Text style={styles.name}>{currentStudent.name}</Text>
      <Text style={styles.email}>{currentStudent.email}</Text>

      {currentStudent.studentId && (
        <View style={styles.infoCard}>
          <Ionicons name="school-outline" size={20} color={theme.colors.primary} />
          <View>
            <Text style={styles.infoLabel}>Student ID</Text>
            <Text style={styles.infoValue}>{currentStudent.studentId}</Text>
          </View>
        </View>
      )}

      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
        <View>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>Student</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: theme.spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginTop: 2,
  },
});
