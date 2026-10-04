import type { Ticket, TicketStatus } from '@campus/shared-types';
import { CAMPUS_MAP_BUILDINGS } from '@campus/shared-types';
import { getPinColor } from './tokens';

/** % coordinate point on campus-map image (0-100) */
export interface MapPoint {
  x: number;
  y: number;
}

export interface BuildingFootprint extends MapPoint {
  name: string;
  polygon: MapPoint[];
}

/**
 * Single source of truth for the interactive campus map.
 * Derived from campmap.json (SMC Tagum, 35 buildings).
 * Polygons are % coordinates (anchorPct * 100) matching the map artwork.
 * Boxes are sized by kind: zones get a larger touch target than buildings.
 */
function boxAround(x: number, y: number, halfW: number, halfH: number) {
  return [
    { x: x - halfW, y: y - halfH },
    { x: x + halfW, y: y - halfH },
    { x: x + halfW, y: y + halfH },
    { x: x - halfW, y: y + halfH },
  ];
}

export const BUILDING_FOOTPRINTS: BuildingFootprint[] =
  CAMPUS_MAP_BUILDINGS.map((b) => {
    const zone = b.kind === 'zone';
    const halfW = zone ? 4 : 2;
    const halfH = zone ? 6 : 3;
    return {
      name: b.name,
      x: b.mapX,
      y: b.mapY,
      polygon: boxAround(b.mapX, b.mapY, halfW, halfH),
    };
  });

/** Convert footprint polygon to SVG points string */
export function toSvgPoints(polygon: MapPoint[]): string {
  return polygon.map((p) => `${p.x},${p.y}`).join(' ');
}

export interface BuildingStats {
  name: string;
  x: number;
  y: number;
  polygon: MapPoint[];
  openCount: number;
  byStatus: Record<string, number>;
  worstColor: string;
}

export function getBuildingStats(tickets: Ticket[]): BuildingStats[] {
  return BUILDING_FOOTPRINTS.map((b) => {
    const open = tickets.filter(
      (t) => t.location === b.name && t.status !== 'Resolved'
    );
    const byStatus: Record<string, number> = {};
    for (const t of open) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    }
    // Worst severity determines building color
    let worstColor = '#2A9D8F'; // green = no issues
    if (open.length > 0) {
      const hasUnassigned = open.some(
        (t) => t.status === 'Submitted' || t.assignedDepartment === 'Unassigned'
      );
      worstColor = hasUnassigned
        ? '#E63946'
        : getPinColor(open[0].status, open[0].assignedDepartment);
      // If any In Progress etc, ensure yellow unless red
      if (!hasUnassigned) worstColor = '#F4A261';
    }
    return {
      name: b.name,
      x: b.x,
      y: b.y,
      polygon: b.polygon,
      openCount: open.length,
      byStatus,
      worstColor,
    };
  });
}

export function getTicketsForBuilding(
  tickets: Ticket[],
  buildingName: string | null,
  opts?: { status?: TicketStatus | 'All'; includeResolved?: boolean }
): Ticket[] {
  return tickets.filter((t) => {
    if (buildingName && t.location !== buildingName) return false;
    if (!opts?.includeResolved && t.status === 'Resolved') return false;
    if (opts?.status && opts.status !== 'All' && t.status !== opts.status)
      return false;
    return true;
  });
}

export const MAP_PATHS: { d: string; label: string }[] = [];
