import { DashboardLayout } from '@/components/DashboardLayout';
import { ReportTable } from '@/components/ReportTable';
import { mockReports } from '@campus/mock-data';

export default function ReportsPage() {
  const sortedReports = [...mockReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Reports</h1>
          <p className="mt-1 text-slate-500">
            {sortedReports.length} total reports submitted
          </p>
        </div>
        <ReportTable reports={sortedReports} />
      </div>
    </DashboardLayout>
  );
}
