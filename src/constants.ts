// Counter
export const COUNTER_MIN = 0;
export const COUNTER_MAX = 99;
export const COUNTER_INITIAL = 0;

// Swipe down (-1)
export const SWIPE_MIN_DISTANCE_PX = 50;

// Gesture sequence (+1): FIRST_GESTURE -> SECOND_GESTURE
export const FIRST_GESTURE = 'Victory';
export const SECOND_GESTURE = 'Thumb_Up';
export const GESTURE_MIN_SCORE = 0.7;
export const GESTURE_MIN_CONSECUTIVE_FRAMES = 3;
export const SEQUENCE_TIMEOUT_MS = 3000;
export const SUCCESS_COOLDOWN_MS = 1500;

// Recognition loop (~12.5 runs per second)
export const RECOGNITION_INTERVAL_MS = 80;

// MediaPipe assets, bundled in public/ by `npm run setup:mediapipe`
export const MEDIAPIPE_WASM_PATH = `${import.meta.env.BASE_URL}wasm`;
export const GESTURE_MODEL_PATH = `${import.meta.env.BASE_URL}models/gesture_recognizer.task`;
