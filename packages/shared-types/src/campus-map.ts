import raw from './campmap.json';

export interface CampusMapAnchorPct {
  x: number;
  y: number;
}

export interface CampusMapBuilding {
  id: number;
  slug: string;
  name: string;
  category: string;
  kind: string;
  /** 0–100 percent across the map image (anchorPct * 100). */
  mapX: number;
  mapY: number;
  /** Raw SVG path strings in map viewBox units. */
  paths: string[];
}

interface CampmapJson {
  map: { name: string; viewBox: string; width: number; height: number };
  categories: Record<string, { label: string; color: string; sideColor: string }>;
  buildings: {
    id: number;
    slug: string;
    name: string;
    category: string;
    kind: string;
    anchorPct: { x: number; y: number };
    paths: string[];
  }[];
}

const data = raw as CampmapJson;

export const CAMPUS_MAP_VIEWBOX = data.map.viewBox;
export const CAMPUS_MAP_ASPECT = data.map.width / data.map.height;
export const CAMPUS_MAP_CATEGORIES = data.map
  ? data.categories
  : ({} as CampmapJson['categories']);

export function anchorPctToPercent(p: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: p.x * 100, y: p.y * 100 };
}

export const CAMPUS_MAP_BUILDINGS: CampusMapBuilding[] = data.buildings.map(
  (b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    category: b.category,
    kind: b.kind,
    mapX: b.anchorPct.x * 100,
    mapY: b.anchorPct.y * 100,
    paths: b.paths,
  })
);

export function getCampusBuilding(name: string): CampusMapBuilding | undefined {
  return CAMPUS_MAP_BUILDINGS.find((b) => b.name === name);
}
