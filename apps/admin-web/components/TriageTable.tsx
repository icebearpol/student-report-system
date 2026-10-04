'use client';

import { useCampusStore } from '@campus/mock-data';
import {
  StatusBadge,
  UrgencyBadge,
  CategoryBadge,
  MeTooBadge,
} from '@campus/ui-components';
import Link from 'next/link';
import type { TicketStatus } from '@campus/shared-types';

const FILTER_TABS: (TicketStatus | 'Unassigned')[] = [
  'Unassigned',
  'In Progress',
  'Awaiting Input',
  'Resolved',
];

interface TriageTableProps {
  filter: TicketStatus | 'Unassigned' | 'All';
  onFilterChange: (f: TicketStatus | 'Unassigned' | 'All') => void;
  buildingFilter?: string | null;
}

export function TriageTable({ filter, onFilterChange, buildingFilter }: TriageTableProps) {
  const { tickets } = useCampusStore();

  const filtered = tickets
    .filter((t) => {
      if (buildingFilter && t.location !== buildingFilter) return false;
      if (filter === 'All') return true;
      if (filter === 'Unassigned') return t.assignedDepartment === 'Unassigned';
      return t.status === filter;
    })
    .sort((a, b) => {
      const urgencyOrder = [
        'Immediate Safety Risk',
        'High Priority',
        'Moderate',
        'Low Impact',
      ];
      return urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency);
    });

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterTab
          label="All"
          active={filter === 'All'}
          onClick={() => onFilterChange('All')}
        />
        {FILTER_TABS.map((tab) => (
          <FilterTab
            key={tab}
            label={tab}
            active={filter === tab}
            onClick={() => onFilterChange(tab)}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Me Too</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={t.urgency} />
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={t.category} />
                </td>
                <td className="px-4 py-3">{t.location}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <MeTooBadge count={t.meTooCount} />
                </td>
                <td className="px-4 py-3 text-gray-600">{t.assignedDepartment}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tickets/${t.id}`}
                    className="text-campus-accent font-medium hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No tickets match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-campus-primary text-white'
          : 'bg-white border text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
