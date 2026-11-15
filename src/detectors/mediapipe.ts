import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import type { Category } from '@mediapipe/tasks-vision';
import { GESTURE_MODEL_PATH, MEDIAPIPE_DELEGATE, MEDIAPIPE_WASM_PATH, NO_GESTURE } from '../constants';
import type { DetectedGesture, DetectionCandidate } from '../types/gesture';

type Delegate = 'GPU' | 'CPU';
// WasmFileset is not exported by @mediapipe/tasks-vision, so derive it.
type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

let filesetPromise: Promise<WasmFileset> | null = null;

/** Loads the bundled MediaPipe WASM once and shares it across tasks. */
export const loadVisionFileset = (): Promise<WasmFileset> => {
  filesetPromise ??= FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
  return filesetPromise;
};

/** Creates a task with MEDIAPIPE_DELEGATE; for 'GPU', falls back to CPU if creation fails. */
export async function createWithDelegate<T>(create: (delegate: Delegate) => Promise<T>): Promise<T> {
  if (MEDIAPIPE_DELEGATE === 'CPU') return create('CPU');
  try {
    return await create('GPU');
  } catch {
    return create('CPU');
  }
}

export async function createGestureRecognizer(runningMode: 'IMAGE' | 'VIDEO'): Promise<GestureRecognizer> {
  const fileset = await loadVisionFileset();
  return createWithDelegate((delegate) =>
    GestureRecognizer.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: GESTURE_MODEL_PATH, delegate },
      runningMode,
      numHands: 1,
    }),
  );
}

export const toDetectedGesture = (category: Category | undefined): DetectedGesture | null =>
  category ? { name: category.categoryName, score: category.score } : null;

/** Highest-scoring real gesture among candidates; the "None" category never wins. */
export const pickBestGesture = (candidates: DetectionCandidate[]): DetectedGesture | null =>
  candidates.reduce<DetectedGesture | null>((best, { gesture }) => {
    if (!gesture || gesture.name === NO_GESTURE) return best;
    return !best || gesture.score > best.score ? gesture : best;
  }, null);
