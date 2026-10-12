'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Search, List, Map } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ReportTable } from '@/components/ReportTable';
import { getAllReports, Report } from '@/lib/reports';
import { StatusBadge } from '@/components/Badge';
import { X } from 'lucide-react';
import Link from 'next/link';
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ReportsPage() {
  const [preview, setPreview] = useState<{ report: Report; left: number; top: number } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  useEffect(() => {
  const load = () => {
    getAllReports()
      .then(setReports)
      .catch((e) => setError(e.message || 'Could not load reports.'))
      .finally(() => setLoading(false));
  };
  load();
  const interval = setInterval(load, 10000);
  window.addEventListener('focus', load);
  return () => {
    clearInterval(interval);
    window.removeEventListener('focus', load);
  };
}, []);

  const filtered = useMemo(() => {
    let result = statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.location || '').toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, search, statusFilter]);

  const CATEGORY_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  safety: 'Safety',
  facilities: 'Facilities',
  it_support: 'IT Support',
  other: 'Other',
};
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Reports</h1>
            <p className="mt-1 text-slate-500">
              {loading ? 'Loading...' : `${filtered.length} of ${reports.length} reports`}
            </p>
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${view === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}
            >
              <List className="h-4 w-4" /> List
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${view === 'map' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}
            >
              <Map className="h-4 w-4" /> Map
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3">{error}</div>
        )}

        {view === 'list' && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 flex-1 min-w-[220px]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, description, or location..."
                  className="flex-1 border-none text-sm text-slate-900 outline-none"
                />
              </div>
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      statusFilter === f.value ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {!loading && <ReportTable reports={filtered} />}
          </>
        )}

        {view === 'map' && (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="mb-4 text-sm text-slate-500">
      Pins show reports that include a mapped location. Click a pin for a quick preview, or check the list view for reports without one.
    </p>
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200">
      <Image src="/campus-map.png" alt="Campus map" width={2459} height={1468} className="w-full h-auto" />
      {filtered
        .filter((r) => r.mapX != null && r.mapY != null)
        .map((r) => (
          <button
            key={r.id}
            onClick={() =>
              setPreview({ report: r, left: (r.mapX as number) * 100, top: (r.mapY as number) * 100 })
            }
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${(r.mapX as number) * 100}%`, top: `${(r.mapY as number) * 100}%` }}
            title={r.title}
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full shadow-lg ring-2 ring-white hover:scale-110 transition-transform ${
                r.status === 'resolved' ? 'bg-green-500' : r.status === 'in_review' ? 'bg-blue-500' : 'bg-red-500'
              }`}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          </button>
        ))}

      {preview && (
        <div
          className="absolute z-20"
          style={{
            left: `${Math.min(85, Math.max(15, preview.left))}%`,
            top: `${preview.top}%`,
            transform: 'translate(-50%, calc(-100% - 14px))',
          }}
        >
          <div className="relative w-64 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5">
            <button onClick={() => setPreview(null)} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start justify-between gap-2 pr-4">
              <h3 className="text-sm font-semibold text-slate-900">{preview.report.title}</h3>
              <StatusBadge status={preview.report.status} />
            </div>
            <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{preview.report.description}</p>
            <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
              <p>{preview.report.location || 'No location'} • {CATEGORY_LABELS[preview.report.category || 'other'] || preview.report.category}</p>
              <p>{preview.report.upvotes || 0} upvote{(preview.report.upvotes || 0) === 1 ? '' : 's'}</p>
            </div>
            <Link href={`/reports/${preview.report.id}`} className="mt-3 block rounded-lg bg-primary-600 py-1.5 text-center text-xs font-medium text-white hover:bg-primary-700">
              View Full Report
            </Link>
            <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 bg-white ring-1 ring-black/5" />
          </div>
        </div>
      )}
    </div>
  </div>
)}
      </div>
    </DashboardLayout>
  );
}