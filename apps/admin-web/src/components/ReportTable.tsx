import Link from 'next/link';
import type { Report } from '@campus/shared-types';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';
import { formatRelativeDate, truncateText } from '@campus/ui-components';
import { getUserById } from '@campus/mock-data';
import { StatusBadge, PriorityBadge } from './Badge';
import { MapPin, ChevronRight } from 'lucide-react';

interface ReportTableProps {
  reports: Report[];
}

export function ReportTable({ reports }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Report
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Submitted
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reports.map((report) => {
            const submitter = getUserById(report.submittedBy);

            return (
              <tr key={report.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {truncateText(report.title, 50)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </p>
                    {submitter && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        by {submitter.name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {REPORT_CATEGORY_LABELS[report.category]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={report.priority} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {formatRelativeDate(report.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/reports/${report.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
