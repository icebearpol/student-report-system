import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Badge';
import type { Report } from '@/lib/reports';

const CATEGORY_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  safety: 'Safety',
  facilities: 'Facilities',
  it_support: 'IT Support',
  other: 'Other',
};

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function relativeDate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ReportTable({ reports }: { reports: Report[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Report</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reports.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">No reports yet.</td>
            </tr>
          )}
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">{truncate(report.title, 50)}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {report.location || 'No location'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {report.anonymous ? 'Anonymous' : report.author?.username || report.author?.fullName || 'Unknown'}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-700">{CATEGORY_LABELS[report.category || 'other'] || report.category}</span>
              </td>
              <td className="px-6 py-4"><StatusBadge status={report.status} /></td>
              <td className="px-6 py-4">{report.priority && <PriorityBadge priority={report.priority as any} />}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{relativeDate(report.createdAt)}</td>
              <td className="px-6 py-4 text-right">
                <Link href={`/reports/${report.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                  View
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}