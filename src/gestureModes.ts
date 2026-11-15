import {
  FIRST_GESTURE,
  GESTURE_MIN_CONSECUTIVE_FRAMES,
  HOLD_GESTURE,
  HOLD_MIN_CONSECUTIVE_FRAMES,
  SECOND_GESTURE,
} from './constants';
import type { GestureMode, GestureStep } from './types/gesture';

interface GestureModeConfig {
  label: string;
  steps: readonly GestureStep[];
}

export const GESTURE_MODES: Readonly<Record<GestureMode, GestureModeConfig>> = {
  sequence: {
    label: '✌️ → 🖐️',
    steps: [
      { gesture: FIRST_GESTURE, minFrames: GESTURE_MIN_CONSECUTIVE_FRAMES, prompt: '請比 ✌️' },
      { gesture: SECOND_GESTURE, minFrames: GESTURE_MIN_CONSECUTIVE_FRAMES, prompt: '請比 🖐️' },
    ],
  },
  hold: {
    label: '持續比 👍',
    steps: [{ gesture: HOLD_GESTURE, minFrames: HOLD_MIN_CONSECUTIVE_FRAMES, prompt: '請持續比 👍' }],
  },
};

export const DEFAULT_GESTURE_MODE: GestureMode = 'sequence';

export const GESTURE_MODE_OPTIONS = (Object.keys(GESTURE_MODES) as GestureMode[]).map((value) => ({
  value,
  label: GESTURE_MODES[value].label,
}));

export const isGestureMode = (value: unknown): value is GestureMode =>
  // Not Object.hasOwn: unsupported before iOS 15.4 (deployment target is 15.0).
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(GESTURE_MODES, value);
