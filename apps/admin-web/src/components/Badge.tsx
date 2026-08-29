import type { ReportPriority, ReportStatus } from '@campus/shared-types';
import { getPriorityBadge, getStatusBadge } from '@campus/ui-components';

interface BadgeProps {
  label: string;
  backgroundColor: string;
  textColor: string;
}

function Badge({ label, backgroundColor, textColor }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor, color: textColor }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = getStatusBadge(status);
  return <Badge {...config} />;
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const config = getPriorityBadge(priority);
  return <Badge {...config} />;
}
