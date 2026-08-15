import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { ReportCategory, ReportPriority } from '@campus/shared-types';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_PRIORITY_LABELS,
} from '@campus/shared-types';
import { theme } from '@/constants/theme';

const categories = Object.keys(REPORT_CATEGORY_LABELS) as ReportCategory[];
const priorities = Object.keys(REPORT_PRIORITY_LABELS) as ReportPriority[];

export default function NewReportScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ReportCategory>('maintenance');
  const [priority, setPriority] = useState<ReportPriority>('medium');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Your report has been submitted successfully. (Mock — no backend yet.)',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Brief summary of the issue"
        placeholderTextColor={theme.colors.textSecondary}
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the issue in detail"
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Building and room number"
        placeholderTextColor={theme.colors.textSecondary}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.chipText,
                category === cat && styles.chipTextActive,
              ]}
            >
              {REPORT_CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chipRow}>
        {priorities.map((pri) => (
          <TouchableOpacity
            key={pri}
            style={[styles.chip, priority === pri && styles.chipActive]}
            onPress={() => setPriority(pri)}
          >
            <Text
              style={[
                styles.chipText,
                priority === pri && styles.chipTextActive,
              ]}
            >
              {REPORT_PRIORITY_LABELS[pri]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm + 4,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: theme.fontWeight.medium,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  submitText: {
    color: '#fff',
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
});
