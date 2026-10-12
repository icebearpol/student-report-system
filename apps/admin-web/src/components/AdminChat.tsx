'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { getMessages, sendMessage, editMessage, unsendMessage, ChatMessage } from '@/lib/reports';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AdminChat({ reportId }: { reportId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = () =>
      getMessages(reportId)
        .then((m) => {
          if (active) setMessages(m);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 6000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [reportId]);

  const handleError = (e: any) => {
    setError(e?.message === 'SESSION_EXPIRED' ? 'Your session has expired. Please log in again.' : e?.message || 'Something went wrong.');
  };

  const startEdit = (m: ChatMessage) => {
    setEditing(m);
    setDraft(m.body);
    setError('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      if (editing) {
        const updated = await editMessage(reportId, editing.id, body);
        setMessages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setEditing(null);
      } else {
        const created = await sendMessage(reportId, body);
        setMessages((prev) => [...prev, created]);
      }
      setDraft('');
    } catch (e: any) {
      handleError(e);
    } finally {
      setSending(false);
    }
  };

  const handleUnsend = async (m: ChatMessage) => {
    if (!window.confirm('Unsend this message? It will be removed from the conversation for everyone.')) return;
    try {
      await unsendMessage(reportId, m.id);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, deleted: true, body: '', canEdit: false } : x)));
      if (editing?.id === m.id) cancelEdit();
    } catch (e: any) {
      handleError(e);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <MessageSquare className="h-5 w-5 text-slate-400" />
        Conversation with Reporter
      </h2>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
        {messages.length === 0 && <p className="text-sm text-slate-400">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[70%]">
              <div
                className={`rounded-2xl px-3 py-2 text-sm ${
                  m.deleted
                    ? 'border border-slate-200 bg-slate-100 italic text-slate-500'
                    : m.fromAdmin
                    ? 'bg-primary-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-800'
                } ${editing?.id === m.id ? 'ring-2 ring-primary-400' : ''}`}
              >
                <p>{m.deleted ? 'Message unsent' : m.body}</p>
                <p className={`mt-1 text-[10px] ${m.fromAdmin && !m.deleted ? 'text-white/70' : 'text-slate-400'}`}>
                  {m.fromAdmin ? (m.mine ? 'You' : 'Admin') : 'Reporter'} • {formatDateTime(m.createdAt)}
                  {m.editedAt && !m.deleted ? ' • edited' : ''}
                </p>
              </div>
              {m.mine && !m.deleted && (
                <div className="mt-1 flex justify-end gap-3 text-[11px] text-slate-500">
                  {m.canEdit && (
                    <button type="button" onClick={() => startEdit(m)} className="hover:text-slate-800">
                      Edit
                    </button>
                  )}
                  <button type="button" onClick={() => handleUnsend(m)} className="hover:text-red-600">
                    Unsend
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700">
          <span>Editing message</span>
          <button type="button" onClick={cancelEdit} className="hover:text-primary-900">
            Cancel
          </button>
        </div>
      )}

      {error && <p className="mt-2 rounded-lg bg-[#ffdad6] px-3 py-2 text-xs text-[#93000a]">{error}</p>}

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={editing ? 'Edit your message...' : 'Write a reply...'}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {editing ? 'Save' : 'Send'}
        </button>
      </div>
    </div>
  );
}