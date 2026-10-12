let pending: { x: number; y: number; building?: string } | null = null;

export function setPendingPin(x: number, y: number, building?: string) {
  pending = { x, y, building };
}

export function consumePendingPin(): { x: number; y: number; building?: string } | null {
  const p = pending;
  pending = null;
  return p;
}