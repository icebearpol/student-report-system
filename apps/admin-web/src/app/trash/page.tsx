'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, Clock, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getRemovedReports, restoreReport, deleteRemovedPermanently, RemovedReport } from '@/lib/reports';

const FILE_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/api$/, '');

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function countdownStyle(days: number) {
  if (days <= 3) return 'bg-red-50 text-red-700';
  if (days <= 7) return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

export default function RemovedReportsPage() {
  const router = useRouter();
  const [items, setItems] = useState<RemovedReport[]>([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    getRemovedReports()
      .then((data) => {
        setItems(data.items);
        setRetentionDays(data.retentionDays);
        setError('');
      })
      .catch((e) => {
        if (e.message === 'SESSION_EXPIRED') router.push('/login');
        else setError(e.message || 'Could not load removed reports.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRestore = async (report: RemovedReport) => {
    setBusyId(report.id);
    setError('');
    try {
      await restoreReport(report.id);
      setItems((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e: any) {
      setError(e?.message || 'Could not restore this report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (report: RemovedReport) => {
    const ok = window.confirm(
      `Permanently delete "${report.title}"?\n\nThe report, its photo and its messages will be gone for good. This cannot be undone.`
    );
    if (!ok) return;
    setBusyId(report.id);
    setError('');
    try {
      await deleteRemovedPermanently(report.id);
      setItems((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e: any) {
      setError(e?.message || 'Could not delete this report.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Removed Reports</h1>
          <p className="mt-1 text-slate-500">
            Removed reports are kept for {retentionDays} days, then deleted automatically. Until then you can restore
            them or delete them for good.
          </p>
        </div>

        {error && <div className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{error}</div>}

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
            Nothing here. Reports you remove will show up in this list.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                {r.imageUrl ? (
                  <img
                    src={`${FILE_BASE}${r.imageUrl}`}
                    alt=""
                    className="h-24 w-32 shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                    No photo
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/reports/${r.id}`} className="truncate font-semibold text-slate-900 hover:underline">
                      {r.title}
                    </Link>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${countdownStyle(r.daysLeft)}`}>
                      <Clock className="h-3 w-3" />
                      {r.daysLeft === 0 ? 'Deletes today' : `Deletes in ${r.daysLeft} day${r.daysLeft === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{r.description}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {r.location || 'No location'}
                    <span className="mx-1">•</span>
                    {r.author ? r.author.username || r.author.email : 'Guest'}
                  </p>
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-medium">Reason:</span> {r.removedReason}
                    <span className="ml-2 text-slate-400">{formatDateTime(r.removedAt)}</span>
                  </p>
                </div>

                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => handleRestore(r)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => handleDelete(r)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}