import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCampusStore } from '@campus/mock-data';
import { colors } from '@campus/ui-components';

interface Props {
  ticketId: string;
}

export function ChatPanel({ ticketId }: Props) {
  const { chatMessages, addChatMessage } = useCampusStore();
  const messages = chatMessages.filter((m) => m.ticketId === ticketId);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    addChatMessage(ticketId, 'User', text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Anonymous Chat</Text>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && (
          <Text style={styles.empty}>No messages yet. Staff will respond here.</Text>
        )}
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.senderRole === 'User' ? styles.userBubble : styles.adminBubble,
            ]}
          >
            <Text style={styles.role}>{m.senderRole}</Text>
            <Text
              style={[
                styles.bubbleText,
                m.senderRole === 'Admin' && { color: '#fff' },
              ]}
            >
              {m.text}
            </Text>
            <Text
              style={[
                styles.time,
                m.senderRole === 'Admin' && { color: 'rgba(255,255,255,0.6)' },
              ]}
            >
              {new Date(m.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message staff anonymously..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={send}
        />
        <Pressable style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontWeight: '700', color: colors.primary, marginBottom: 8 },
  messages: {
    maxHeight: 200,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messagesContent: { padding: 10, gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: 12, padding: 16 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 10,
    alignSelf: 'flex-start',
  },
  userBubble: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  adminBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  role: { fontSize: 10, opacity: 0.6, marginBottom: 2 },
  bubbleText: { fontSize: 13 },
  time: { fontSize: 10, opacity: 0.5, marginTop: 4 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
