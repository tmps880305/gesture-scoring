import type { DetectionResult } from '../types/gesture';

export interface DetectionDebugSnapshot {
  result: DetectionResult | null;
  /** Detections per second over the last second. */
  rate: number;
}

const RATE_WINDOW_MS = 1000;

let snapshot: DetectionDebugSnapshot = { result: null, rate: 0 };
let recentTimes: number[] = [];
const listeners = new Set<() => void>();

/**
 * Tiny external store so the debug overlay can update every frame
 * without re-rendering the rest of the app.
 */
export const detectionDebugStore = {
  publish(result: DetectionResult) {
    const now = performance.now();
    recentTimes = [...recentTimes.filter((t) => now - t < RATE_WINDOW_MS), now];
    snapshot = { result, rate: recentTimes.length };
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: (): DetectionDebugSnapshot => snapshot,
};
