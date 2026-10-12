import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMessages, sendMessage, editMessage, unsendMessage, ChatMessage } from '@/lib/reports';
import { theme } from '@/constants/theme';

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMessages(id);
      setMessages(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load messages.');
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, 5000);
      return () => clearInterval(timer);
    }, [load])
  );

  const startEdit = (m: ChatMessage) => {
    setEditing(m);
    setDraft(m.body);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
  };

  const confirmUnsend = (m: ChatMessage) => {
    Alert.alert('Unsend this message?', 'It will be removed from the conversation for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unsend',
        style: 'destructive',
        onPress: async () => {
          try {
            await unsendMessage(id, m.id);
            setMessages((prev) =>
              prev.map((x) => (x.id === m.id ? { ...x, deleted: true, body: '', canEdit: false } : x))
            );
            if (editing?.id === m.id) cancelEdit();
          } catch (e: any) {
            Alert.alert('Could not unsend', e?.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  const openActions = (m: ChatMessage) => {
    if (!m.mine || m.deleted) return;
    const buttons: any[] = [];
    if (m.canEdit) buttons.push({ text: 'Edit', onPress: () => startEdit(m) });
    buttons.push({ text: 'Unsend', style: 'destructive', onPress: () => confirmUnsend(m) });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(
      'Message options',
      m.canEdit ? 'You can edit this message for 20 minutes after sending it.' : 'The 20-minute edit window has passed.',
      buttons
    );
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      if (editing) {
        const updated = await editMessage(id, editing.id, body);
        setMessages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setEditing(null);
      } else {
        const created = await sendMessage(id, body);
        setMessages((prev) => [...prev, created]);
      }
      setDraft('');
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not send your message.');
      load();
    }
    setSending(false);
  };

  const hasOwn = messages.some((m) => m.mine && !m.deleted);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          extraData={editing}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            hasOwn ? (
              <Text style={styles.hint}>Hold one of your messages to edit it (within 20 minutes) or unsend it.</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={44} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>Send a message and an administrator will reply here.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const bubbleStyle = item.deleted
              ? styles.bubbleDeleted
              : item.mine
              ? styles.bubbleMine
              : styles.bubbleTheirs;
            const who = item.mine ? 'You' : item.fromAdmin ? 'Admin' : 'Reporter';
            return (
              <View style={[styles.row, item.mine ? styles.rowMine : styles.rowTheirs]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  delayLongPress={300}
                  disabled={!item.mine || !!item.deleted}
                  onLongPress={() => openActions(item)}
                  style={[styles.bubble, bubbleStyle, editing?.id === item.id && styles.bubbleEditing]}
                >
                  {item.deleted ? (
                    <Text style={styles.deletedText}>Message unsent</Text>
                  ) : (
                    <Text style={[styles.body, item.mine && { color: '#fff' }]}>{item.body}</Text>
                  )}
                  <Text style={[styles.meta, item.mine && !item.deleted && { color: 'rgba(255,255,255,0.75)' }]}>
                    {who} • {timeLabel(item.createdAt)}
                    {item.editedAt && !item.deleted ? ' • edited' : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {editing && (
        <View style={styles.editBanner}>
          <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.editText} numberOfLines={1}>Editing message</Text>
          <TouchableOpacity onPress={cancelEdit} hitSlop={10}>
            <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={editing ? 'Edit your message...' : 'Write a message...'}
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !draft.trim()}
          style={[styles.sendBtn, (sending || !draft.trim()) && { opacity: 0.45 }]}
        >
          <Ionicons name={editing ? 'checkmark' : 'send'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  emptySub: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
  hint: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 10 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMine: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcebef', borderBottomLeftRadius: 4 },
  bubbleDeleted: { backgroundColor: '#eef2f3', borderWidth: 1, borderColor: '#dcebef' },
  bubbleEditing: { borderWidth: 2, borderColor: theme.colors.primaryCyan },
  body: { fontSize: 14, color: theme.colors.text, lineHeight: 19 },
  deletedText: { fontSize: 13, fontStyle: 'italic', color: theme.colors.textSecondary },
  meta: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 4 },
  error: { color: '#93000a', backgroundColor: '#ffdad6', fontSize: 12, textAlign: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  editBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#e7f6fa', borderTopWidth: 1, borderTopColor: '#dcebef' },
  editText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: theme.colors.primary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#dcebef' },
  input: { flex: 1, maxHeight: 110, backgroundColor: '#f2f7f8', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: theme.colors.text },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
});