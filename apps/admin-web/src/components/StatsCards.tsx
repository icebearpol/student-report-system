import { Clock, Eye, CheckCircle2, FileText } from 'lucide-react';

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

interface DashboardStatsSimple {
  totalReports: number;
  pendingReports: number;
  inReviewReports: number;
  resolvedReports: number;
}

export function StatsGrid({ stats }: { stats: DashboardStatsSimple }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Reports" value={stats.totalReports} icon={<FileText className="h-6 w-6" />} color="#0A3C58" />
      <StatCard title="Pending" value={stats.pendingReports} icon={<Clock className="h-6 w-6" />} color="#F59E0B" />
      <StatCard title="In Review" value={stats.inReviewReports} icon={<Eye className="h-6 w-6" />} color="#3B82F6" />
      <StatCard title="Resolved" value={stats.resolvedReports} icon={<CheckCircle2 className="h-6 w-6" />} color="#10B981" />
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  safety: 'Safety',
  facilities: 'Facilities',
  it_support: 'IT Support',
  other: 'Other',
};

export function CategoryBreakdown({ categoryCounts, total }: { categoryCounts: Record<string, number>; total: number }) {
  const entries = Object.entries(categoryCounts);
  return (
    <div className="rounded-xl border border-[#c2c7ce] bg-white p-6 shadow-[0_-4px_20px_0_rgba(10,60,88,0.08)]">
      <h3 className="text-lg font-semibold text-[#0A3C58]">Reports by Category</h3>
      <div className="mt-4 space-y-3">
        {entries.length === 0 && <p className="text-sm text-[#72787e]">No reports yet.</p>}
        {entries.map(([category, count]) => {
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[#42474d]">{CATEGORY_LABELS[category] || category}</span>
                <span className="text-[#72787e]">{count} ({percentage}%)</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e7f6fa]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0A3C58] to-[#46C3DB] transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}