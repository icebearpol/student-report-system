import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsGrid, CategoryBreakdown } from '@/components/StatsCards';
import { ReportTable } from '@/components/ReportTable';
import { mockDashboardStats, mockReports } from '@campus/mock-data';

export default function DashboardPage() {
  const recentReports = [...mockReports]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-[#0A3C58]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#42474d]">
            Overview of campus report activity and status
          </p>
        </div>

        <StatsGrid stats={mockDashboardStats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0A3C58]">
                Recent Reports
              </h2>
            </div>
            <ReportTable reports={recentReports} />
          </div>
          <CategoryBreakdown stats={mockDashboardStats} />
        </div>
      </div>
    </DashboardLayout>
  );
}
