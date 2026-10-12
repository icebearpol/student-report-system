import type { Report } from './reports';

interface HeapNode<T> {
  item: T;
  score: number;
  order: number;
}

export class PriorityQueue<T> {
  private heap: HeapNode<T>[] = [];
  private counter = 0;

  get size() {
    return this.heap.length;
  }

  push(item: T, score: number) {
    this.heap.push({ item, score, order: this.counter++ });
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop() as HeapNode<T>;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return top.item;
  }

  peek(): T | undefined {
    return this.heap[0]?.item;
  }

  private before(a: HeapNode<T>, b: HeapNode<T>) {
    return a.score > b.score || (a.score === b.score && a.order < b.order);
  }

  private siftUp(start: number) {
    let i = start;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.before(this.heap[i], this.heap[parent])) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  private siftDown(start: number) {
    let i = start;
    const n = this.heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = left + 1;
      let best = i;
      if (left < n && this.before(this.heap[left], this.heap[best])) best = left;
      if (right < n && this.before(this.heap[right], this.heap[best])) best = right;
      if (best === i) break;
      [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
      i = best;
    }
  }
}

const PRIORITY_WEIGHT: Record<string, number> = { urgent: 100, high: 70, medium: 40, low: 10 };
const UPVOTE_CAP = 25;
const POINTS_PER_UPVOTE = 2;
const AGING_POINTS_PER_HOUR = 0.5;
const AGING_CAP = 30;

export function reportScore(report: Report, now: number = Date.now()): number {
  const base = PRIORITY_WEIGHT[report.priority || 'medium'] ?? 40;
  const community = Math.min(report.upvotes || 0, UPVOTE_CAP) * POINTS_PER_UPVOTE;
  const ageHours = Math.max(0, (now - new Date(report.createdAt).getTime()) / 3600000);
  const aging = Math.min(ageHours * AGING_POINTS_PER_HOUR, AGING_CAP);
  return base + community + aging;
}