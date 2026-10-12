import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { theme } from '@/constants/theme';

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  professor: 'Professor',
  admin: 'Admin',
  prefer_not_to_say: 'Prefer not to say',
};

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
        <Text style={styles.name}>Campus Fix</Text>
        <Text style={styles.email}>You're browsing anonymously</Text>
      </View>
    );
  }

  const displayName = user.username || user.name;
  const initial = (displayName[0] || '?').toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.infoCard}>
        <Ionicons name="school-outline" size={20} color={theme.colors.primary} />
        <View>
          <Text style={styles.infoLabel}>Student ID</Text>
          <Text style={styles.infoValue}>{user.studentId || ' '}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
        <View>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{roleLabel}</Text>
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