import type { DetectionResult } from '../types/gesture';

/** A gesture detection strategy that the recognition loop can run per frame. */
export interface GestureDetector {
  detect(video: HTMLVideoElement, timestampMs: number): DetectionResult;
  close(): void;
}
