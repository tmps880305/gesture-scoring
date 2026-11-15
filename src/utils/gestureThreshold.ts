import { DEFAULT_GESTURE_MIN_SCORE, GESTURE_MIN_SCORES } from '../constants';
import type { DetectedGesture } from '../types/gesture';

export const getGestureMinScore = (name: string): number => GESTURE_MIN_SCORES[name] ?? DEFAULT_GESTURE_MIN_SCORE;

export const meetsGestureThreshold = (gesture: DetectedGesture): boolean =>
  gesture.score >= getGestureMinScore(gesture.name);
