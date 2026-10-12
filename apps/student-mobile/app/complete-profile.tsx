import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { completeProfile } from '@/lib/auth';

const ROLES = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Professor', value: 'PROFESSOR' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
  if (!username.trim()) {
    Alert.alert('Username required', 'Please choose a username to continue.');
    return;
  }
  setSubmitting(true);
  try {
      await completeProfile(username.trim(), studentId.trim(), role);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Could not save profile', error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Student ID (optional)"
        value={studentId}
        onChangeText={setStudentId}
      />

      <Text style={styles.label}>Role</Text>
      {ROLES.map((r) => (
        <TouchableOpacity
          key={r.value}
          style={[styles.roleOption, role === r.value && styles.roleSelected]}
          onPress={() => setRole(r.value)}
        >
          <Text style={role === r.value ? styles.roleTextSelected : styles.roleText}>{r.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 15 },
  label: { fontSize: 13, color: '#64748B', marginBottom: 8, marginTop: 8 },
  roleOption: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 14, marginBottom: 10 },
  roleSelected: { borderColor: '#0891B2', backgroundColor: '#ECFEFF' },
  roleText: { fontSize: 14, color: '#0F172A' },
  roleTextSelected: { fontSize: 14, color: '#0891B2', fontWeight: '700' },
  button: { backgroundColor: '#0891B2', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});