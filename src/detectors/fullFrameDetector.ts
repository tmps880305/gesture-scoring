import { createGestureRecognizer, toDetectedGesture } from './mediapipe';
import type { GestureDetector } from './types';

/** Runs the gesture recognizer on the whole frame. Works up to ~2 m. */
export async function createFullFrameDetector(): Promise<GestureDetector> {
  const recognizer = await createGestureRecognizer('VIDEO');

  return {
    detect: (video, timestampMs) =>
      toDetectedGesture(recognizer.recognizeForVideo(video, timestampMs).gestures[0]?.[0]),
    close: () => recognizer.close(),
  };
}
