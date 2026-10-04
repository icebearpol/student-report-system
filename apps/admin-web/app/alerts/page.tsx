'use client';

import { useState } from 'react';
import { useCampusStore } from '@campus/mock-data';
import { SeverityBadge } from '@campus/ui-components';
import type { AlertSeverity } from '@campus/shared-types';

export default function AlertsPage() {
  const { alerts, addAlert, deactivateAlert } = useCampusStore();
  const [severity, setSeverity] = useState<AlertSeverity>('Notice');
  const [targetLocation, setTargetLocation] = useState('Campus-wide');
  const [message, setMessage] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [pushNotification, setPushNotification] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addAlert({
      severity,
      targetLocation,
      message: message.trim(),
      expiresInHours,
      pushNotification,
    });
    setMessage('');
  };

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-campus-primary mb-1">
          Broadcast & Alert Manager
        </h2>
        <p className="text-sm text-gray-500">
          Create alerts that appear as the top banner on the student mobile app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          >
            <option value="Notice">Notice</option>
            <option value="Warning">Warning</option>
            <option value="Critical Emergency">Critical Emergency</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Target Location
          </label>
          <input
            type="text"
            value={targetLocation}
            onChange={(e) => setTargetLocation(e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Main Library, Campus-wide"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Custom Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Alert message for students..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Auto-expiration (hours)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(Number(e.target.value))}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotification}
                onChange={(e) => setPushNotification(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Push notification</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-campus-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          Publish Alert
        </button>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Alert History</h3>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-xl border p-4 ${a.active ? 'border-campus-accent ring-1 ring-campus-accent/30' : ''}`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={a.severity} />
                  {a.active && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      LIVE
                    </span>
                  )}
                </div>
                {a.active && (
                  <button
                    onClick={() => deactivateAlert(a.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm">{a.message}</p>
              <p className="mt-1 text-xs text-gray-400">
                {a.targetLocation} · Expires in {a.expiresInHours}h ·{' '}
                {a.pushNotification ? 'Push enabled' : 'No push'} ·{' '}
                {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
