'use client';

import { useState } from 'react';
import { useCampusStore } from '@campus/mock-data';
import {
  StatusBadge,
  UrgencyBadge,
  CategoryBadge,
  MeTooBadge,
} from '@campus/ui-components';
import { DEPARTMENTS } from '@campus/shared-types';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const store = useCampusStore();
  const ticket = store.tickets.find((t) => t.id === ticketId);
  const messages = store.chatMessages.filter((m) => m.ticketId === ticketId);

  const [chatInput, setChatInput] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  if (!ticket) {
    return (
      <div className="p-6">
        <p>Ticket not found.</p>
        <Link href="/" className="text-campus-accent hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    store.addChatMessage(ticketId, 'Admin', chatInput.trim());
    setChatInput('');
  };

  const handleUploadProof = () => {
    const url = proofUrl || `https://picsum.photos/seed/proof-${ticketId}/400/300`;
    store.uploadProofOfFix(ticketId, url);
    setProofUrl('');
  };

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/" className="text-sm text-campus-accent hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-campus-primary">{ticket.id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Reported by {ticket.anonymousReporterId} ·{' '}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={ticket.status} />
            <UrgencyBadge urgency={ticket.urgency} />
            <CategoryBadge category={ticket.category} />
            <MeTooBadge count={ticket.meTooCount} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <Field label="Location" value={ticket.location} />
          <Field label="Department" value={ticket.assignedDepartment} />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Description
          </label>
          <p className="mt-1">{ticket.description}</p>
        </div>

        {ticket.mediaUrl && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Report Media
            </label>
            <img
              src={ticket.mediaUrl}
              alt="Report"
              className="mt-2 rounded-lg max-h-48 object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2 border-t">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Reassign Department
            </label>
            <select
              value={ticket.assignedDepartment}
              onChange={(e) =>
                store.reassignDepartment(ticketId, e.target.value as typeof ticket.assignedDepartment)
              }
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Update Status
            </label>
            <select
              value={ticket.status}
              onChange={(e) =>
                store.updateTicketStatus(ticketId, e.target.value as typeof ticket.status)
              }
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {['Submitted', 'Under Review', 'In Progress', 'Awaiting Input', 'Resolved'].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ticket.publishedToWallOfFame}
                onChange={() => store.toggleWallOfFame(ticketId)}
                className="rounded"
              />
              <span className="text-sm">Publish to Wall of Fame</span>
            </label>
          </div>
        </div>

        <div className="pt-2 border-t">
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
            Upload Proof of Fix
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Image URL (optional — demo uses placeholder)"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleUploadProof}
              className="bg-campus-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Upload Proof of Fix
            </button>
          </div>
          {ticket.proofOfFixUrl && (
            <img
              src={ticket.proofOfFixUrl}
              alt="Proof of fix"
              className="mt-3 rounded-lg max-h-48 object-cover"
            />
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-campus-primary mb-4">
          Anonymous Chat Console
        </h3>
        <div className="h-64 overflow-y-auto space-y-3 mb-4 bg-gray-50 rounded-lg p-4">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center">No messages yet.</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.senderRole === 'Admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                  m.senderRole === 'Admin'
                    ? 'bg-campus-primary text-white'
                    : 'bg-white border'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">{m.senderRole}</div>
                {m.text}
                <div className="text-xs opacity-50 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="Type a message to the reporter..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleSendChat}
            className="bg-campus-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
