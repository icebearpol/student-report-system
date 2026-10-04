'use client';

import { useState } from 'react';
import { useCampusStore } from '@campus/mock-data';
import { StatCard } from '@campus/ui-components';
import { Heatmap } from '@/components/Heatmap';
import { TriageTable } from '@/components/TriageTable';
import type { TicketStatus } from '@campus/shared-types';

export default function DashboardPage() {
  const { tickets } = useCampusStore();
  const [filter, setFilter] = useState<TicketStatus | 'Unassigned' | 'All'>('All');
  const [building, setBuilding] = useState<string | null>(null);

  const openCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const unassigned = tickets.filter((t) => t.assignedDepartment === 'Unassigned').length;
  const safetyRisk = tickets.filter((t) => t.urgency === 'Immediate Safety Risk' && t.status !== 'Resolved').length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open Tickets" value={openCount} color="#1B4332" />
        <StatCard label="Unassigned" value={unassigned} color="#E63946" />
        <StatCard label="Safety Risks" value={safetyRisk} color="#D00000" />
        <StatCard label="Resolved" value={resolved} color="#2A9D8F" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Campus Issue Heatmap
          </h3>
          <Heatmap selectedBuilding={building} onSelectBuilding={setBuilding} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Priority Triage Queue
            </h3>
            {building && (
              <button
                onClick={() => setBuilding(null)}
                className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full hover:bg-emerald-200"
              >
                📍 {building} ✕
              </button>
            )}
          </div>
          <TriageTable
            filter={filter}
            onFilterChange={setFilter}
            buildingFilter={building}
          />
        </div>
      </div>
    </div>
  );
}
