import Link from 'next/link';
import { MapPin, Flag, AlertTriangle } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Badge';
import type { Report } from '@/lib/reports';

export function ReportMiniList({ reports, emptyText }: { reports: Report[]; emptyText: string }) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <Link
          key={r.id}
          href={`/reports/${r.id}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{r.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {r.location || 'No location'}
            </p>
            {(r.flagged || r.priorityReview) && (
              <div className="mt-1 flex flex-wrap gap-2">
                {r.flagged && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    <Flag className="h-3 w-3" /> Flagged by AI
                  </span>
                )}
                {r.priorityReview && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                    <AlertTriangle className="h-3 w-3" /> Confirm priority
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {r.priority && <PriorityBadge priority={r.priority as any} />}
            <StatusBadge status={r.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}