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
    <div className="rounded-xl border border-[#c2c7ce] bg-white p-6 shadow-[0_-4px_20px_0_rgba(10,60,88,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#42474d]">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[#0A3C58]">{value}</p>
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
        color="#0A3C58"
      />
      <StatCard
        title="Pending"
        value={stats.pendingReports}
        icon={<Clock className="h-6 w-6" />}
        color="#F59E0B"
      />
      <StatCard
        title="In Review"
        value={stats.inReviewReports}
        icon={<Eye className="h-6 w-6" />}
        color="#3B82F6"
      />
      <StatCard
        title="Resolved"
        value={stats.resolvedReports}
        icon={<CheckCircle2 className="h-6 w-6" />}
        color="#10B981"
      />
      <StatCard
        title="Rejected"
        value={stats.rejectedReports}
        icon={<XCircle className="h-6 w-6" />}
        color="#EF4444"
      />
    </div>
  );
}

export function CategoryBreakdown({ stats }: { stats: DashboardStats }) {
  return (
    <div className="rounded-xl border border-[#c2c7ce] bg-white p-6 shadow-[0_-4px_20px_0_rgba(10,60,88,0.08)]">
      <h3 className="text-lg font-semibold text-[#0A3C58]">
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
                <span className="font-medium text-[#42474d]">
                  {REPORT_CATEGORY_LABELS[category]}
                </span>
                <span className="text-[#72787e]">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e7f6fa]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0A3C58] to-[#46C3DB] transition-all"
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
