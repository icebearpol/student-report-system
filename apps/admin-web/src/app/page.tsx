'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsGrid, CategoryBreakdown } from '@/components/StatsCards';
import { ReportMiniList } from '@/components/ReportMiniList';
import { getAllReports, getAuditLog, Report, AuditEntry } from '@/lib/reports';
import { PriorityQueue, reportScore } from '@/lib/priorityQueue';

type MainTab = 'review' | 'queue' | 'resolved';
type SideTab = 'removed' | 'activity';

const AUDIT_LABELS: Record<string, string> = {
  emergency_contact: 'Contacted campus staff',
  ai_blocked_report: 'Report blocked by AI',
  urgent_downgraded: 'Urgent claim downgraded',
  alert_published: 'Campus alert published',
  strikes_reset: 'Strikes reset',
  report_removed: 'Report removed',
  report_restored: 'Report restored',
  report_deleted_permanently: 'Report deleted permanently',
  reports_purged: 'Old removed reports deleted automatically',
};

const MAIN_HINTS: Record<MainTab, string> = {
  review: 'Flagged by the AI, or an urgent claim waiting for your confirmation.',
  queue: 'Ranked by priority, capped community upvotes, and age so older reports eventually rise.',
  resolved: 'The most recently resolved reports.',
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === t.id ? 'bg-white text-[#0A3C58] shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                value === t.id ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [all, setAll] = useState<Report[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainTab, setMainTab] = useState<MainTab | null>(null);
  const [sideTab, setSideTab] = useState<SideTab>('removed');

  useEffect(() => {
    const load = () => {
      getAllReports(true)
        .then((r) => {
          setAll(r);
          setError('');
        })
        .catch((e) => setError(e.message || 'Could not load reports.'))
        .finally(() => setLoading(false));
      getAuditLog(15)
        .then(setAudit)
        .catch((e) => {
          if (e.message === 'SESSION_EXPIRED') router.push('/login');
        });
    };
    load();
    const interval = setInterval(load, 10000);
    window.addEventListener('focus', load);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', load);
    };
  }, [router]);

  const reports = useMemo(() => all.filter((r) => !r.removedAt), [all]);
  const removed = useMemo(
    () =>
      all
        .filter((r) => r.removedAt)
        .sort((a, b) => new Date(b.removedAt as string).getTime() - new Date(a.removedAt as string).getTime()),
    [all]
  );

  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    inReviewReports: reports.filter((r) => r.status === 'in_review').length,
    resolvedReports: reports.filter((r) => r.status === 'resolved').length,
  };

  const needsReview = useMemo(
    () =>
      reports
        .filter((r) => r.status !== 'resolved' && (r.flagged || r.priorityReview))
        .sort((a, b) => reportScore(b) - reportScore(a)),
    [reports]
  );

  const queue = useMemo(() => {
    const pq = new PriorityQueue<Report>();
    reports.filter((r) => r.status !== 'resolved').forEach((r) => pq.push(r, reportScore(r)));
    const top: Report[] = [];
    while (top.length < 8 && pq.size > 0) {
      top.push(pq.pop() as Report);
    }
    return top;
  }, [reports]);

  const resolved = useMemo(
    () =>
      reports
        .filter((r) => r.status === 'resolved')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8),
    [reports]
  );

  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    const key = r.category || 'other';
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  const activeMain: MainTab = mainTab ?? (needsReview.length > 0 ? 'review' : 'queue');
  const mainList = activeMain === 'review' ? needsReview.slice(0, 8) : activeMain === 'queue' ? queue : resolved;
  const mainEmpty =
    activeMain === 'review'
      ? 'Nothing needs review right now.'
      : activeMain === 'queue'
      ? 'Nothing pending — all caught up.'
      : 'No resolved reports yet.';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3C58]">Dashboard</h1>
          <p className="mt-1 text-[#42474d]">Triage and activity — open "Reports" for the full list</p>
        </div>

        {error && <div className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{error}</div>}

        {loading ? (
          <p className="text-[#72787e]">Loading...</p>
        ) : (
          <>
            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-[#c2c7ce] bg-white p-5 shadow-[0_-4px_20px_0_rgba(10,60,88,0.08)] lg:col-span-2">
                <Tabs
                  tabs={[
                    { id: 'review' as MainTab, label: 'Needs Review', count: needsReview.length },
                    { id: 'queue' as MainTab, label: 'Priority Queue', count: queue.length },
                    { id: 'resolved' as MainTab, label: 'Resolved' },
                  ]}
                  value={activeMain}
                  onChange={setMainTab}
                />
                <p className="mb-4 mt-3 text-xs text-slate-500">{MAIN_HINTS[activeMain]}</p>
                <div className="max-h-[34rem] overflow-y-auto pr-1">
                  <ReportMiniList reports={mainList} emptyText={mainEmpty} />
                </div>
              </div>

              <div className="space-y-6">
                <CategoryBreakdown categoryCounts={categoryCounts} total={reports.length} />

                <div className="rounded-xl border border-[#c2c7ce] bg-white p-5 shadow-[0_-4px_20px_0_rgba(10,60,88,0.08)]">
                  <Tabs
                    tabs={[
                      { id: 'removed' as SideTab, label: 'Removed', count: removed.length },
                      { id: 'activity' as SideTab, label: 'Activity' },
                    ]}
                    value={sideTab}
                    onChange={setSideTab}
                  />

                  <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                    {sideTab === 'removed' && (
                      <>
                        {removed.length === 0 && <p className="text-sm text-[#72787e]">Nothing removed.</p>}
                        {removed.map((r) => (
                          <Link
                            key={r.id}
                            href={`/reports/${r.id}`}
                            className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                          >
                            <p className="truncate text-sm font-medium text-slate-800">{r.title}</p>
                            <p className="truncate text-xs text-slate-500">
                              {r.removedReason}
                              {r.removedAt ? ` • ${timeLabel(r.removedAt)}` : ''}
                            </p>
                          </Link>
                        ))}
                        <Link href="/trash" className="block pt-1 text-xs font-medium text-primary-700 hover:underline">
                          Manage removed reports (restore or delete) →
                        </Link>
                      </>
                    )}

                    {sideTab === 'activity' && (
                      <>
                        {audit.length === 0 && <p className="text-sm text-[#72787e]">No activity yet.</p>}
                        {audit.map((a) => (
                          <div key={a.id} className="rounded-lg border border-slate-100 px-3 py-2">
                            <p className="text-sm font-medium text-slate-800">{AUDIT_LABELS[a.action] || a.action}</p>
                            <p className="truncate text-xs text-slate-500">
                              {a.user ? a.user.username || a.user.email : 'System'}
                              {a.detail ? ` • ${a.detail}` : ''}
                            </p>
                            <p className="text-[11px] text-slate-400">{timeLabel(a.createdAt)}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}