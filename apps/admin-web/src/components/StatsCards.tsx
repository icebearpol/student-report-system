import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import type { DashboardStats } from '@campus/shared-types';
import { REPORT_CATEGORY_LABELS } from '@campus/shared-types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Reports"
        value={stats.totalReports}
        icon={<FileText className="h-6 w-6" />}
        color="#3b82f6"
      />
      <StatCard
        title="Pending"
        value={stats.pendingReports}
        icon={<Clock className="h-6 w-6" />}
        color="#f59e0b"
      />
      <StatCard
        title="In Review"
        value={stats.inReviewReports}
        icon={<Eye className="h-6 w-6" />}
        color="#6366f1"
      />
      <StatCard
        title="Resolved"
        value={stats.resolvedReports}
        icon={<CheckCircle2 className="h-6 w-6" />}
        color="#22c55e"
      />
      <StatCard
        title="Rejected"
        value={stats.rejectedReports}
        icon={<XCircle className="h-6 w-6" />}
        color="#ef4444"
      />
    </div>
  );
}

export function CategoryBreakdown({ stats }: { stats: DashboardStats }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Reports by Category
      </h3>
      <div className="mt-4 space-y-3">
        {(
          Object.entries(stats.reportsByCategory) as [
            keyof typeof stats.reportsByCategory,
            number,
          ][]
        ).map(([category, count]) => {
          const percentage =
            stats.totalReports > 0
              ? Math.round((count / stats.totalReports) * 100)
              : 0;

          return (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {REPORT_CATEGORY_LABELS[category]}
                </span>
                <span className="text-slate-500">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
