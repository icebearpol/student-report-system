'use client';
import { AdminChat } from '@/components/AdminChat';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  UserCheck,
  MessageSquare,
  Sparkles,
  Megaphone,
  ShieldCheck,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge, PriorityBadge } from '@/components/Badge';
import {
  getReportById,
  updateReport,
  removeReport,
  restoreReport,
  publishAlert,
  retractAlert,
  resetStrikes,
  Report,
  Priority,
} from '@/lib/reports';

const FILE_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/api$/, '');

const CATEGORY_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  safety: 'Safety',
  facilities: 'Facilities',
  it_support: 'IT Support',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  resolved: 'Resolved',
};

const PRIORITY_LABELS: Record<string, string> = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };
const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, urgent: 3 };

const AI_LABELS: Record<string, { text: string; style: string }> = {
  clean: { text: 'Looks like a genuine report', style: 'bg-green-50 text-green-700' },
  needs_review: { text: 'Flagged for review', style: 'bg-amber-50 text-amber-700' },
  unchecked: { text: 'Not checked by AI', style: 'bg-slate-100 text-slate-600' },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ title: '', message: '', severity: 'warning', hours: '72' });
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState('');

  useEffect(() => {
    getReportById(params.id)
      .then((r) => {
        setReport(r);
        setAssigneeInput(r.assignedTo || '');
      })
      .catch((e) => setError(e.message || 'Could not load this report.'))
      .finally(() => setLoading(false));
  }, [params.id]);



  const handleError = (e: any) => {
    if (e?.message === 'SESSION_EXPIRED') {
      setError('Your session has expired. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } else {
      setError(e?.message || 'Something went wrong.');
    }
  };

  const run = async (action: () => Promise<Report>) => {
    setUpdating(true);
    setError('');
    try {
      const next = await action();
      setReport(next);
      setAssigneeInput(next.assignedTo || '');
    } catch (e: any) {
      handleError(e);
    } finally {
      setUpdating(false);
    }
  };

  const changePriority = (value: Priority) => {
    if (!report) return;
    const strikeWarning =
      report.reportedPriority === 'urgent' && PRIORITY_RANK[value] < PRIORITY_RANK.urgent && !!report.authorId;
    if (strikeWarning) {
      const ok = window.confirm(
        'The reporter marked this as Urgent. Setting a lower priority adds one strike to their account, and three strikes turn off their Urgent option. Continue?'
      );
      if (!ok) return;
    }
    run(() => updateReport(report.id, { priority: value }));
  };

  const openAlertForm = () => {
    if (!report) return;
    const where = report.location ? `${report.location}: ` : '';
    setAlertForm({
      title: report.title.slice(0, 80),
      message: `${where}${report.description}`.slice(0, 280),
      severity: 'warning',
      hours: '72',
    });
    setAlertOpen(true);
  };

  const handlePublish = () => {
    if (!report) return;
    run(async () => {
      await publishAlert(report.id, {
        title: alertForm.title,
        message: alertForm.message,
        severity: alertForm.severity,
        hours: Number(alertForm.hours),
      });
      setAlertOpen(false);
      return getReportById(report.id);
    });
  };

  const handleRetract = () => {
    if (!report) return;
    run(async () => {
      await retractAlert(report.id);
      return getReportById(report.id);
    });
  };

  const handleResetStrikes = () => {
    if (!report?.author) return;
    const authorId = report.author.id;
    run(async () => {
      await resetStrikes(authorId);
      return getReportById(report.id);
    });
  };

  const handleRemove = () => {
    if (!report) return;
    const reason = removeReason.trim();
    if (reason.length < 3) {
      setError('Please give a short reason for removing this report.');
      return;
    }
    run(async () => {
      const next = await removeReport(report.id, reason);
      setRemoveOpen(false);
      setRemoveReason('');
      return next;
    });
  };

  const handleRestore = () => {
    if (!report) return;
    run(() => restoreReport(report.id));
  };


  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  if (error && !report) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
          <div className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) return null;

  const ai = AI_LABELS[report.aiStatus || 'unchecked'] || AI_LABELS.unchecked;
  const author = report.author;
  const removed = !!report.removedAt;
  const inputClass =
    'w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {removed && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">This report was removed and is hidden from students.</p>
              <p className="mt-1">Reason: {report.removedReason}</p>
              {report.removedAt && <p className="mt-1 text-xs">{formatDateTime(report.removedAt)}</p>}
              <button
                type="button"
                disabled={updating}
                onClick={handleRestore}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore report
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
              <p className="mt-1 text-sm text-slate-500">Report #{report.id}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={report.status} />
              {report.priority && <PriorityBadge priority={report.priority as any} />}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Location</p>
                <p className="text-sm font-medium text-slate-900">{report.location || 'No location given'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Submitted</p>
                <p className="text-sm font-medium text-slate-900">{formatDateTime(report.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Submitted By</p>
                <p className="text-sm font-medium text-slate-900">
                  {author ? author.username || author.fullName : 'Guest (no account)'}
                  {report.anonymous && author ? ' (anonymous to students)' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <div className="flex h-5 w-5 items-center justify-center text-xs font-bold text-slate-400">#</div>
              <div>
                <p className="text-xs font-medium text-slate-500">Category</p>
                <p className="text-sm font-medium text-slate-900">
                  {CATEGORY_LABELS[report.category || 'other'] || report.category}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-2 leading-relaxed text-slate-700">{report.description}</p>
          </div>

          {report.imageUrl && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">Photo Evidence</h2>
              <img
                src={`${FILE_BASE}${report.imageUrl}`}
                alt="Report evidence"
                className="mt-3 max-h-96 rounded-lg border border-slate-200"
              />
            </div>
          )}

          <div className="mt-8 rounded-lg border border-slate-200 p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-5 w-5 text-slate-400" />
              AI Review
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${ai.style}`}>{ai.text}</span>
              {report.aiSuggestedPriority && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  AI suggests: {PRIORITY_LABELS[report.aiSuggestedPriority] || report.aiSuggestedPriority}
                </span>
              )}
            </div>
            {report.aiSummary && <p className="mt-3 text-sm text-slate-600">{report.aiSummary}</p>}
            {report.flagged && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <p>{report.flagReason || 'This report was flagged for manual review.'}</p>
                <p className="mt-1 text-xs">Other students cannot see this report until you dismiss the flag.</p>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => run(() => updateReport(report.id, { dismissFlag: true }))}
                  className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                  Looks fine — dismiss flag
                </button>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400">
              The AI is a first-pass filter and can be wrong. You make the final call.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-slate-400" />
              Priority
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Reporter chose: {PRIORITY_LABELS[report.reportedPriority || report.priority || 'medium']} • Current:{' '}
              {PRIORITY_LABELS[report.priority || 'medium']}
            </p>
            {report.priorityReview && (
              <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                This priority needs your confirmation. Pick the level you believe is correct.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={updating || (report.priority === p && !report.priorityReview)}
                  onClick={() => changePriority(p)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    report.priority === p && !report.priorityReview
                      ? 'cursor-default bg-primary-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                  }`}
                >
                  {report.priority === p && report.priorityReview ? `Confirm ${PRIORITY_LABELS[p]}` : PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <User className="h-5 w-5 text-slate-400" />
              Reporter
              <span className="text-xs font-normal text-slate-400">visible to administrators only</span>
            </h2>
            {author ? (
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Name:</span> {author.fullName}
                  {author.username ? ` (@${author.username})` : ''}
                </p>
                <p><span className="font-medium">Email:</span> {author.email}</p>
                <p><span className="font-medium">Student ID:</span> {author.studentId || 'Not provided'}</p>
                <p>
                  <span className="font-medium">School email verified:</span> {author.emailVerified ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-medium">Urgent strikes:</span> {author.urgentStrikes ?? 0}
                  {author.urgentBlocked ? ' — Urgent option is turned off for this user' : ''}
                </p>
                {((author.urgentStrikes ?? 0) > 0 || author.urgentBlocked) && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleResetStrikes}
                    className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Reset strikes
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                This report was submitted as a guest, so there is no account to identify.
              </p>
            )}
          </div>

          {report.mapX != null && report.mapY != null ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Location on Map</h2>
              <div className="relative mt-3 w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200">
                <img src="/campus-map.png" alt="Campus map" className="h-auto w-full" />
                <div
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${report.mapX * 100}%`, top: `${report.mapY * 100}%` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-lg ring-4 ring-white">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Location on Map</h2>
              <p className="mt-2 text-sm text-slate-400">This report wasn't submitted with a pinned location.</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <UserCheck className="h-5 w-5 text-slate-400" />
              Assigned To
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Who is responsible for resolving this issue (a technician, teacher, or department).
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                placeholder="e.g. IT Department, Mr. Santos"
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => run(() => updateReport(report.id, { assignedTo: assigneeInput.trim() }))}
                disabled={updating}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {report.assignedTo && (
              <p className="mt-2 text-sm text-slate-600">
                Currently assigned to: <span className="font-medium">{report.assignedTo}</span>
              </p>
            )}
          </div>

          {!removed && (
            <div className="mt-8 rounded-lg border border-slate-200 p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Megaphone className="h-5 w-5 text-slate-400" />
                Campus Alert
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Nothing is sent to students until you publish it here. Check that the report is genuine first.
              </p>

              {report.alert ? (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <p className="font-medium">Published: {report.alert.title}</p>
                  <p className="mt-1">{report.alert.body}</p>
                  <p className="mt-1 text-xs">
                    {report.alert.expiresAt ? `Expires ${formatDateTime(report.alert.expiresAt)}` : 'No expiry'}
                  </p>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleRetract}
                    className="mt-2 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100 disabled:opacity-50"
                  >
                    Retract alert
                  </button>
                </div>
              ) : alertOpen ? (
                <div className="mt-3 space-y-3">
                  {report.flagged && (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                      This report is flagged. Review it before publishing.
                    </p>
                  )}
                  <input
                    type="text"
                    value={alertForm.title}
                    onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                    placeholder="Alert title"
                    maxLength={80}
                    className={inputClass}
                  />
                  <textarea
                    value={alertForm.message}
                    onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                    placeholder="What should students know?"
                    maxLength={300}
                    rows={3}
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={alertForm.severity}
                      onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                    </select>
                    <select
                      value={alertForm.hours}
                      onChange={(e) => setAlertForm({ ...alertForm, hours: e.target.value })}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="24">Expires in 24 hours</option>
                      <option value="72">Expires in 3 days</option>
                      <option value="168">Expires in 7 days</option>
                      <option value="0">No expiry</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handlePublish}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      Publish to all students
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlertOpen(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openAlertForm}
                  className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Publish as campus alert
                </button>
              )}
            </div>
          )}

{report.authorId ? (
  <AdminChat reportId={report.id} />
) : (
  <p className="mt-8 text-sm text-slate-400">
    This report was submitted without an account, so there is no one to message.
  </p>
)}

          {error && <div className="mt-6 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{error}</div>}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {(['pending', 'in_review', 'resolved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                disabled={report.status === status || updating}
                onClick={() => run(() => updateReport(report.id, { status }))}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  report.status === status
                    ? 'cursor-default bg-primary-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {!removed && (
            <div className="mt-8 rounded-lg border border-red-200 p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-red-700">
                <Trash2 className="h-5 w-5" />
                Remove report
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                For false or abusive reports. It's hidden from students, any campus alert is retracted, the reporter is
                notified with your reason, and you can restore it later.
              </p>
              {removeOpen ? (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value)}
                    placeholder="Reason (shown to the reporter), e.g. Not a campus issue"
                    maxLength={200}
                    rows={2}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handleRemove}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove report
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveOpen(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRemoveOpen(true)}
                  className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Remove this report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}