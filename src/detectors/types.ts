import type { DetectedGesture } from '../types/gesture';

/** A gesture detection strategy that the recognition loop can run per frame. */
export interface GestureDetector {
  detect(video: HTMLVideoElement, timestampMs: number): DetectedGesture | null;
  close(): void;
}
