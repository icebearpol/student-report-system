import { Image } from 'react-native';
import type { Report } from '@/lib/reports';

export const CAMPUS_MAP_SOURCE = require('../assets/campus-map.png');

const REF_W = 2459;
const REF_H = 1512;

const asset = Image.resolveAssetSource(CAMPUS_MAP_SOURCE);

export const IMAGE_ASPECT: number =
  asset && asset.width && asset.height ? asset.width / asset.height : REF_W / REF_H;

export const MAP_CROP = 0.65;
export const MAP_ASPECT: number = IMAGE_ASPECT / MAP_CROP;

export type BuildingGroup =
  | 'academic'
  | 'services'
  | 'residential'
  | 'utilities'
  | 'entrance'
  | 'sports'
  | 'green';

export const GROUP_COLORS: Record<BuildingGroup, string> = {
  academic: '#4F6EF7',
  services: '#8B6CF0',
  residential: '#F59E3F',
  utilities: '#8B95AD',
  entrance: '#E5484D',
  sports: '#2EC4A6',
  green: '#6CC070',
};

export const GROUP_LABELS: Record<BuildingGroup, string> = {
  academic: 'Academic',
  services: 'Student services',
  residential: 'Residential',
  utilities: 'Utilities & facilities',
  entrance: 'Entrances',
  sports: 'Sports & recreation',
  green: 'Green space',
};

export interface Building {
  n: number;
  name: string;
  group: BuildingGroup;
  px: number;
  py: number;
}

export const BUILDINGS: Building[] = [
  { n: 1, name: 'Main Gate', group: 'entrance', px: 352, py: 182 },
  { n: 2, name: 'Guard House / Waiting Area', group: 'entrance', px: 384, py: 113 },
  { n: 3, name: 'Power House 1', group: 'utilities', px: 446, py: 17 },
  { n: 4, name: 'Open Volleyball Court', group: 'sports', px: 466, py: 329 },
  { n: 5, name: 'Graduate School / College of Law Bldg.', group: 'academic', px: 565, py: 79 },
  { n: 6, name: 'College Building', group: 'academic', px: 1018, py: 100 },
  { n: 7, name: 'Admin Building', group: 'services', px: 682, py: 349 },
  { n: 8, name: 'MIMPH Gym', group: 'sports', px: 559, py: 544 },
  { n: 9, name: 'Building 9', group: 'services', px: 297, py: 503 },
  { n: 10, name: 'Criminology Bldg.', group: 'academic', px: 812, py: 460 },
  { n: 11, name: 'Grade School Bldg.', group: 'academic', px: 958, py: 612 },
  { n: 12, name: 'School Canteen / Fastfood', group: 'services', px: 955, py: 461 },
  { n: 13, name: "Sister's Convent", group: 'residential', px: 983, py: 340 },
  { n: 14, name: 'Student Lounge', group: 'services', px: 1044, py: 216 },
  { n: 15, name: 'School Chapel', group: 'services', px: 1200, py: 232 },
  { n: 16, name: 'School Clinic', group: 'services', px: 1200, py: 345 },
  { n: 17, name: 'Grade School Playground', group: 'sports', px: 1196, py: 473 },
  { n: 18, name: 'Building 18', group: 'services', px: 1183, py: 630 },
  { n: 19, name: 'High School Bldg.', group: 'academic', px: 1509, py: 607 },
  { n: 20, name: 'College Laboratories', group: 'academic', px: 1587, py: 144 },
  { n: 21, name: 'Marian Hotel / BSHM-TM Lab.', group: 'academic', px: 1799, py: 152 },
  { n: 22, name: 'Bahay Kubo', group: 'services', px: 1936, py: 119 },
  { n: 23, name: 'Eco Park', group: 'green', px: 1861, py: 299 },
  { n: 24, name: 'Senior High School Bldg.', group: 'academic', px: 2127, py: 180 },
  { n: 25, name: 'MRF', group: 'utilities', px: 558, py: 623 },
  { n: 26, name: 'Carpentry Shop', group: 'utilities', px: 628, py: 630 },
  { n: 27, name: 'Building 27', group: 'residential', px: 1959, py: 436 },
  { n: 28, name: 'Playing Court', group: 'sports', px: 1802, py: 463 },
  { n: 29, name: 'Track & Field Oval', group: 'sports', px: 1622, py: 415 },
  { n: 30, name: 'Softball Field', group: 'sports', px: 1347, py: 367 },
  { n: 31, name: "Yaya's Shed", group: 'utilities', px: 235, py: 545 },
  { n: 32, name: 'Power House 2', group: 'utilities', px: 1729, py: 114 },
  { n: 33, name: 'Bus Garage', group: 'utilities', px: 1797, py: 581 },
  { n: 34, name: 'Storage', group: 'utilities', px: 2183, py: 326 },
  { n: 35, name: 'Power House 3', group: 'utilities', px: 391, py: 574 },
];

export function nearestBuilding(x: number, yFull: number): Building | null {
  let best: Building | null = null;
  let bestDist = Infinity;
  for (const b of BUILDINGS) {
    const dx = x * REF_W - b.px;
    const dy = yFull * REF_H - b.py;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDist) {
      bestDist = d;
      best = b;
    }
  }
  return bestDist <= 170 ? best : null;
}

const STATUS_RANK: Record<string, number> = { pending: 0, in_review: 1, resolved: 2 };

export function worstStatus(reports: { status: string }[]): string {
  return reports.reduce(
    (worst, r) => (STATUS_RANK[r.status] < STATUS_RANK[worst] ? r.status : worst),
    reports[0].status
  );
}

export interface PinCluster {
  left: number;
  top: number;
  reports: Report[];
}

export function clusterByPixels(
  reports: Report[],
  width: number,
  height: number,
  radius: number
): PinCluster[] {
  const pts = reports
    .filter((r) => r.mapX != null && r.mapY != null && (r.mapY as number) <= MAP_CROP + 0.02)
    .map((r) => ({
      r,
      left: (r.mapX as number) * width,
      top: ((r.mapY as number) / MAP_CROP) * height,
    }));

  const used = new Set<number>();
  const out: PinCluster[] = [];

  for (let i = 0; i < pts.length; i++) {
    if (used.has(i)) continue;
    const group = [pts[i]];
    used.add(i);
    for (let j = i + 1; j < pts.length; j++) {
      if (used.has(j)) continue;
      if (Math.hypot(pts[j].left - pts[i].left, pts[j].top - pts[i].top) < radius) {
        group.push(pts[j]);
        used.add(j);
      }
    }
    out.push({
      left: group.reduce((s, p) => s + p.left, 0) / group.length,
      top: group.reduce((s, p) => s + p.top, 0) / group.length,
      reports: group.map((p) => p.r),
    });
  }
  return out;
}