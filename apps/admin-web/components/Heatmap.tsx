'use client';

import { useMemo, useState } from 'react';
import { useCampusStore } from '@campus/mock-data';
import { getPinColor, getBuildingStats } from '@campus/ui-components';
import {
  CAMPUS_MAP_BUILDINGS,
  CAMPUS_MAP_VIEWBOX,
} from '@campus/shared-types';

interface HeatmapProps {
  selectedBuilding?: string | null;
  onSelectBuilding?: (name: string | null) => void;
}

export function Heatmap({ selectedBuilding, onSelectBuilding }: HeatmapProps) {
  const { tickets } = useCampusStore();
  const [showHeat, setShowHeat] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const stats = useMemo(() => getBuildingStats(tickets), [tickets]);
  const maxCount = Math.max(...stats.map((s) => s.openCount), 1);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCursorPos({ x, y });
  };

  const toggleBuilding = (name: string) => {
    onSelectBuilding?.(selectedBuilding === name ? null : name);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap items-center">
        <Toggle label="Heat" active={showHeat} onClick={() => setShowHeat((v) => !v)} />
        <Toggle label="Pins" active={showPins} onClick={() => setShowPins((v) => !v)} />
        <Toggle
          label="Buildings"
          active={showBuildings}
          onClick={() => setShowBuildings((v) => !v)}
        />
        <Toggle
          label="Legend"
          active={showLegend}
          onClick={() => setShowLegend((v) => !v)}
        />
        <div className="ml-auto flex gap-1 items-center">
          <button
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            className="px-2 py-1 border rounded bg-white text-sm"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            className="px-2 py-1 border rounded bg-white text-sm"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 border rounded bg-white text-xs text-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="relative bg-emerald-50 border rounded-xl overflow-hidden aspect-[1950/770] cursor-crosshair"
        onClick={handleMapClick}
      >
        <div
          className="absolute inset-0 transition-transform origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/campus-map.svg"
            alt="SMC Tagum campus map"
            className="absolute inset-0 w-full h-full object-fill"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          {/* Building footprints from campmap.json (same viewBox as artwork) */}
          {showBuildings && (
            <svg
              viewBox={CAMPUS_MAP_VIEWBOX}
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
            >
              {CAMPUS_MAP_BUILDINGS.map((b) => {
                const st = stats.find((s) => s.name === b.name);
                const openCount = st?.openCount ?? 0;
                const worstColor = st?.worstColor ?? '#1B4332';
                const isSelected = selectedBuilding === b.name;
                const isHovered = hovered === b.name;
                return (
                  <g key={b.slug}>
                    {b.paths.map((d, i) => (
                      <path
                        key={i}
                        d={d}
                        fill={openCount > 0 ? worstColor : '#1B4332'}
                        fillOpacity={
                          isSelected
                            ? 0.55
                            : isHovered
                              ? 0.45
                              : openCount > 0
                                ? 0.35
                                : 0.18
                        }
                        stroke={isSelected ? '#111' : worstColor}
                        strokeWidth={isSelected ? 10 : 5}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHovered(b.name)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBuilding(b.name);
                        }}
                      >
                        <title suppressHydrationWarning>
                          {b.name}: {openCount} open issue
                          {openCount !== 1 ? 's' : ''}
                        </title>
                      </path>
                    ))}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Heat density circles */}
          {showHeat &&
            stats.map((b) => {
              const intensity = b.openCount / maxCount;
              const size = 40 + intensity * 60;
              if (b.openCount === 0) return null;
              return (
                <div
                  key={`heat-${b.name}`}
                  className="absolute rounded-full flex items-center justify-center pointer-events-none"
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: size,
                    height: size,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: `rgba(214, 0, 0, ${0.15 + intensity * 0.4})`,
                    border: `2px solid rgba(214, 0, 0, ${0.3 + intensity * 0.5})`,
                  }}
                >
                  <span className="text-xs font-bold text-red-800">
                    {b.openCount}
                  </span>
                </div>
              );
            })}

          {/* Individual pins */}
          {showPins &&
            tickets
              .filter(
                (t) => t.mapX != null && t.mapY != null && t.status !== 'Resolved'
              )
              .map((t) => (
                <div
                  key={t.id}
                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer hover:scale-150 transition-transform"
                  style={{
                    left: `${t.mapX}%`,
                    top: `${t.mapY}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: getPinColor(t.status, t.assignedDepartment),
                  }}
                  title={`${t.location} — ${t.description}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBuilding(t.location);
                  }}
                />
              ))}

          {/* Building labels (only issues / selected / hovered to avoid clutter) */}
          {showBuildings &&
            stats
              .filter(
                (b) =>
                  b.openCount > 0 ||
                  b.name === selectedBuilding ||
                  b.name === hovered
              )
              .map((b) => (
                <div
                  key={`label-${b.name}`}
                  className={`absolute text-[10px] font-semibold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap ${
                    selectedBuilding === b.name
                      ? 'bg-black text-white'
                      : 'bg-white/90 text-gray-800'
                  }`}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    transform: 'translate(-50%, 14px)',
                  }}
                >
                  {b.name}
                  {b.openCount > 0 ? ` (${b.openCount})` : ''}
                </div>
              ))}
          {/* Toggleable legend overlay (click-through) */}
          {showLegend && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/campus-map-with-legend.png"
              alt="Campus map legend"
              className="absolute bottom-2 right-2 w-40 md:w-52 rounded-lg shadow-lg pointer-events-none bg-white/80"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs text-gray-600">
          {selectedBuilding
            ? `${selectedBuilding} selected — click again to clear`
            : 'Issue density heatmap — click a building to filter'}
        </div>
        {cursorPos && (
          <div className="absolute top-2 right-2 bg-black/70 text-white rounded px-2 py-1 text-[11px] font-mono">
            x:{cursorPos.x} y:{cursorPos.y}
          </div>
        )}
      </div>

      {/* Hovered / selected detail */}
      {(hovered || selectedBuilding) && (
        <div className="text-xs text-gray-600 bg-white border rounded-lg px-3 py-2">
          {(() => {
            const name = selectedBuilding ?? hovered!;
            const b = stats.find((s) => s.name === name);
            if (!b) return null;
            return (
              <span>
                <strong>{b.name}</strong> — {b.openCount} open{' '}
                {Object.entries(b.byStatus).map(([s, n]) => (
                  <span key={s} className="ml-2">
                    {s}: {n}
                  </span>
                ))}
                {b.openCount === 0 && <span className="ml-2">No open issues 🎉</span>}
              </span>
            );
          })()}
        </div>
      )}

      <div className="flex gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#E63946' }} /> Unassigned
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#F4A261' }} /> In Progress
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#2A9D8F' }} /> Clear / Fixed
        </span>
      </div>
    </div>
  );
}

function Toggle({
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
      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
