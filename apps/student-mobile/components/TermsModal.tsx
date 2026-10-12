import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export function TermsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms & Privacy Policy</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator>
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
            <Text style={styles.body}>
              CampusFix collects the information you provide when creating an account (school email, username, optional
              student ID) and the reports you submit. Reports marked anonymous hide your name from other students, but
              administrators can still see which account sent a report so false or abusive reports can be addressed. Guest
              reports have no account attached. Photos and report text are automatically screened by an AI service to
              detect inappropriate or unrelated submissions, and an administrator makes the final decision. Calls to campus
              staff made through the app are logged with your account. Report locations are positions on the campus
              reference map, not your device's live location.
            </Text>
            <Text style={styles.sectionTitle}>Terms of Service</Text>
            <Text style={styles.body}>
              CampusFix is provided for reporting and tracking campus maintenance, safety, and
              IT issues. Reports should be submitted in good faith. Misuse of the reporting
              system, including knowingly false reports, may result in account restrictions.
              This is a student capstone project and is provided as-is.
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(16,30,33,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginTop: 10, marginBottom: 4 },
  body: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 19 },
  closeBtn: { marginTop: 16, backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});