import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge, PriorityBadge } from '@/components/Badge';
import {
  getReportById,
  getUserById,
  getCommentsByReport,
} from '@campus/mock-data';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
} from '@campus/shared-types';
import { formatDateTime } from '@campus/ui-components';

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id } = await params;
  const report = getReportById(id);

  if (!report) {
    notFound();
  }

  const submitter = getUserById(report.submittedBy);
  const assignee = report.assignedTo
    ? getUserById(report.assignedTo)
    : undefined;
  const comments = getCommentsByReport(report.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {report.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Report #{report.id}
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Location</p>
                <p className="text-sm font-medium text-slate-900">
                  {report.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Submitted</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDateTime(report.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Submitted By
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {submitter?.name ?? 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <div className="flex h-5 w-5 items-center justify-center text-xs font-bold text-slate-400">
                #
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Category</p>
                <p className="text-sm font-medium text-slate-900">
                  {REPORT_CATEGORY_LABELS[report.category]}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Description
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              {report.description}
            </p>
          </div>

          {report.adminNotes && (
            <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
              <h3 className="text-sm font-semibold text-primary-800">
                Admin Notes
              </h3>
              <p className="mt-1 text-sm text-primary-700">
                {report.adminNotes}
              </p>
              {assignee && (
                <p className="mt-2 text-xs text-primary-600">
                  Assigned to: {assignee.name}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {(['pending', 'in_review', 'resolved', 'rejected'] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  disabled={report.status === status}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    report.status === status
                      ? 'cursor-default bg-primary-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {REPORT_STATUS_LABELS[status]}
                </button>
              )
            )}
          </div>
        </div>

        {comments.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
            <div className="mt-4 space-y-4">
              {comments.map((comment) => {
                const author = getUserById(comment.authorId);
                return (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        {author?.name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
