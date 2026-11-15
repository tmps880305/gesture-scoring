import type { RecognitionDiagnostic } from '../hooks/useGestureRecognizer';
import type { DetectionResult } from '../types/gesture';

export interface DetectionDebugSnapshot {
  result: DetectionResult | null;
  /** Detections per second over the last second. */
  rate: number;
}

export interface LoopDiagnostics {
  /** performance.now() of the last loop event, or null if the loop never ran. */
  lastEventAt: number | null;
  lastSkipReason: string | null;
  lastDetectMs: number | null;
  lastError: string | null;
  errorCount: number;
}

const RATE_WINDOW_MS = 1000;

let snapshot: DetectionDebugSnapshot = { result: null, rate: 0 };
let recentTimes: number[] = [];
const listeners = new Set<() => void>();

// Updated on every loop tick, so it is mutable and read by polling (no re-render per tick).
const diagnostics: LoopDiagnostics = {
  lastEventAt: null,
  lastSkipReason: null,
  lastDetectMs: null,
  lastError: null,
  errorCount: 0,
};

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

  reportDiagnostic(event: RecognitionDiagnostic) {
    diagnostics.lastEventAt = performance.now();
    if (event.type === 'skip') {
      diagnostics.lastSkipReason = event.reason;
    } else if (event.type === 'detected') {
      diagnostics.lastSkipReason = null;
      diagnostics.lastDetectMs = event.durationMs;
    } else {
      diagnostics.lastError = event.message;
      diagnostics.errorCount += 1;
    }
  },
  getDiagnostics: (): Readonly<LoopDiagnostics> => diagnostics,
};
