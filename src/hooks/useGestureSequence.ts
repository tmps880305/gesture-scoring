import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FIRST_GESTURE,
  GESTURE_MIN_CONSECUTIVE_FRAMES,
  SECOND_GESTURE,
  SEQUENCE_TIMEOUT_MS,
  SUCCESS_COOLDOWN_MS,
} from '../constants';
import type { DetectedGesture, GestureStage } from '../types/gesture';
import { meetsGestureThreshold } from '../utils/gestureThreshold';

interface UseGestureSequenceOptions {
  /** Called whenever a single step (first or second gesture) is confirmed. */
  onStepMatched?: () => void;
  /** Called when the full sequence completes. */
  onComplete: () => void;
}

const TARGET_GESTURE: Record<GestureStage, string | null> = {
  awaitingFirst: FIRST_GESTURE,
  awaitingSecond: SECOND_GESTURE,
  cooldown: null,
};

/**
 * Two-step gesture state machine:
 * awaitingFirst --(first gesture)--> awaitingSecond --(second gesture)--> cooldown --> awaitingFirst
 * awaitingSecond falls back to awaitingFirst after SEQUENCE_TIMEOUT_MS.
 * A gesture counts only after GESTURE_MIN_CONSECUTIVE_FRAMES frames meeting its own minimum score.
 */
export function useGestureSequence({ onStepMatched, onComplete }: UseGestureSequenceOptions) {
  const [stage, setStage] = useState<GestureStage>('awaitingFirst');
  const stageRef = useRef<GestureStage>('awaitingFirst');
  const streakRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const callbacksRef = useRef({ onStepMatched, onComplete });

  useEffect(() => {
    callbacksRef.current = { onStepMatched, onComplete };
  });

  const clearTimer = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const setStageNow = useCallback((next: GestureStage) => {
    streakRef.current = 0;
    stageRef.current = next;
    setStage(next);
  }, []);

  const transition = useCallback(
    (next: GestureStage, fallbackAfterMs?: number) => {
      clearTimer();
      setStageNow(next);
      if (fallbackAfterMs !== undefined) {
        timerRef.current = window.setTimeout(() => setStageNow('awaitingFirst'), fallbackAfterMs);
      }
    },
    [clearTimer, setStageNow],
  );

  const reset = useCallback(() => transition('awaitingFirst'), [transition]);

  const handleGesture = useCallback(
    (gesture: DetectedGesture | null) => {
      const target = TARGET_GESTURE[stageRef.current];
      if (!target) return;

      const isMatch = gesture?.name === target && meetsGestureThreshold(gesture);
      streakRef.current = isMatch ? streakRef.current + 1 : 0;
      if (streakRef.current < GESTURE_MIN_CONSECUTIVE_FRAMES) return;

      callbacksRef.current.onStepMatched?.();
      if (stageRef.current === 'awaitingFirst') {
        transition('awaitingSecond', SEQUENCE_TIMEOUT_MS);
      } else {
        callbacksRef.current.onComplete();
        transition('cooldown', SUCCESS_COOLDOWN_MS);
      }
    },
    [transition],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return { stage, handleGesture, reset };
}
