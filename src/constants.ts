// Counter
export const COUNTER_MIN = 0;
export const COUNTER_MAX = 99;
export const COUNTER_INITIAL = 0;

// Swipe down (-1)
export const SWIPE_MIN_DISTANCE_PX = 50;

// Gesture modes (+1) — see src/gestureModes.ts
// "sequence": FIRST_GESTURE -> SECOND_GESTURE
export const FIRST_GESTURE = 'Victory';
export const SECOND_GESTURE = 'Open_Palm';
export const GESTURE_MIN_CONSECUTIVE_FRAMES = 3;
// "hold": keep HOLD_GESTURE for HOLD_MIN_CONSECUTIVE_FRAMES frames
export const HOLD_GESTURE = 'Thumb_Up';
export const HOLD_MIN_CONSECUTIVE_FRAMES = 5;
export const GESTURE_MODE_STORAGE_KEY = 'gestureMode';

/** MediaPipe's "no gesture" category; never treated as a real gesture. */
export const NO_GESTURE = 'None';
/** Minimum confidence per gesture; gestures not listed use DEFAULT_GESTURE_MIN_SCORE. */
export const DEFAULT_GESTURE_MIN_SCORE = 0.7;
export const GESTURE_MIN_SCORES: Readonly<Record<string, number>> = {
  [FIRST_GESTURE]: 0.7,
  // Open_Palm scores ~0.68–0.71 on iPhone in long-range mode.
  [SECOND_GESTURE]: 0.6,
  [HOLD_GESTURE]: 0.6,
};
/** Max wait between steps of a multi-step mode before falling back to step 1. */
export const SEQUENCE_TIMEOUT_MS = 3000;
export const SUCCESS_COOLDOWN_MS = 1500;

// Recognition loop (~12.5 runs per second)
export const RECOGNITION_INTERVAL_MS = 80;

// Long-range mode (prototype): pose -> crop around each hand -> gesture.
// Set to false to fall back to plain full-frame gesture recognition.
export const LONG_RANGE_MODE_ENABLED = true;

// Camera resolution (long-range needs more pixels to crop hands from)
export const CAMERA_IDEAL_WIDTH = LONG_RANGE_MODE_ENABLED ? 1920 : 640;
export const CAMERA_IDEAL_HEIGHT = LONG_RANGE_MODE_ENABLED ? 1080 : 480;

// Hand crop (long-range mode)
export const POSE_MIN_VISIBILITY = 0.5;
/** Crop side length relative to the detected shoulder width. */
export const HAND_CROP_SCALE = 1.2;
/** Smallest crop side (source pixels), so very distant hands still get context. */
export const HAND_CROP_MIN_SIZE_PX = 96;
/** Crops are resized to this square before gesture recognition. */
export const HAND_CROP_OUTPUT_PX = 256;

// Debug overlay: on in `npm run dev`, or in builds made with VITE_DEBUG_OVERLAY=true
// (see `npm run build:ios:debug`).
export const DEBUG_OVERLAY_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEBUG_OVERLAY === 'true';

// MediaPipe assets, bundled in public/ by `npm run setup:mediapipe`
export const MEDIAPIPE_WASM_PATH = `${import.meta.env.BASE_URL}wasm`;
export const GESTURE_MODEL_PATH = `${import.meta.env.BASE_URL}models/gesture_recognizer.task`;
export const POSE_MODEL_PATH = `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`;
