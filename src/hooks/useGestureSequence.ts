import { useCallback, useEffect, useRef, useState } from 'react';
import { SEQUENCE_TIMEOUT_MS, SUCCESS_COOLDOWN_MS } from '../constants';
import type { DetectedGesture, GestureStage, GestureStep } from '../types/gesture';
import { meetsGestureThreshold } from '../utils/gestureThreshold';

interface UseGestureSequenceOptions {
  steps: readonly GestureStep[];
  /** Called whenever a single step is confirmed. */
  onStepMatched?: () => void;
  /** Called when the last step is confirmed. */
  onComplete: () => void;
}

const INITIAL_STAGE: GestureStage = { kind: 'awaiting', stepIndex: 0 };

/**
 * Generic multi-step gesture state machine:
 * step 0 -> step 1 -> ... -> last step -> cooldown -> step 0
 * Each step needs `minFrames` consecutive frames meeting the gesture's minimum score.
 * Waiting on a later step falls back to step 0 after SEQUENCE_TIMEOUT_MS.
 * Call `reset()` after changing `steps`.
 */
export function useGestureSequence({ steps, onStepMatched, onComplete }: UseGestureSequenceOptions) {
  const [stage, setStage] = useState<GestureStage>(INITIAL_STAGE);
  const stageRef = useRef<GestureStage>(INITIAL_STAGE);
  const streakRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const latestRef = useRef({ steps, onStepMatched, onComplete });

  useEffect(() => {
    latestRef.current = { steps, onStepMatched, onComplete };
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
        timerRef.current = window.setTimeout(() => setStageNow(INITIAL_STAGE), fallbackAfterMs);
      }
    },
    [clearTimer, setStageNow],
  );

  const reset = useCallback(() => transition(INITIAL_STAGE), [transition]);

  const handleGesture = useCallback(
    (gesture: DetectedGesture | null) => {
      const current = stageRef.current;
      if (current.kind !== 'awaiting') return;

      const { steps: currentSteps, onStepMatched: stepMatched, onComplete: complete } = latestRef.current;
      const step = currentSteps[current.stepIndex];
      if (!step) return;

      const isMatch = gesture?.name === step.gesture && meetsGestureThreshold(gesture);
      streakRef.current = isMatch ? streakRef.current + 1 : 0;
      if (streakRef.current < step.minFrames) return;

      stepMatched?.();
      const isLastStep = current.stepIndex === currentSteps.length - 1;
      if (isLastStep) {
        complete();
        transition({ kind: 'cooldown' }, SUCCESS_COOLDOWN_MS);
      } else {
        transition({ kind: 'awaiting', stepIndex: current.stepIndex + 1 }, SEQUENCE_TIMEOUT_MS);
      }
    },
    [transition],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return { stage, handleGesture, reset };
}
