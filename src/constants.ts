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

// MediaPipe assets, bundled in public/ by `npm run setup:mediapipe`
export const MEDIAPIPE_WASM_PATH = `${import.meta.env.BASE_URL}wasm`;
export const GESTURE_MODEL_PATH = `${import.meta.env.BASE_URL}models/gesture_recognizer.task`;
export const POSE_MODEL_PATH = `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`;
