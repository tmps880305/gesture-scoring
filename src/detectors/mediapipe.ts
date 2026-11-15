import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import type { Category } from '@mediapipe/tasks-vision';
import { GESTURE_MODEL_PATH, MEDIAPIPE_WASM_PATH } from '../constants';
import type { DetectedGesture } from '../types/gesture';

type Delegate = 'GPU' | 'CPU';
// WasmFileset is not exported by @mediapipe/tasks-vision, so derive it.
type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

let filesetPromise: Promise<WasmFileset> | null = null;

/** Loads the bundled MediaPipe WASM once and shares it across tasks. */
export const loadVisionFileset = (): Promise<WasmFileset> => {
  filesetPromise ??= FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
  return filesetPromise;
};

/** Tries the GPU delegate first, falling back to CPU if it fails. */
export async function createWithGpuFallback<T>(create: (delegate: Delegate) => Promise<T>): Promise<T> {
  try {
    return await create('GPU');
  } catch {
    return create('CPU');
  }
}

export async function createGestureRecognizer(runningMode: 'IMAGE' | 'VIDEO'): Promise<GestureRecognizer> {
  const fileset = await loadVisionFileset();
  return createWithGpuFallback((delegate) =>
    GestureRecognizer.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: GESTURE_MODEL_PATH, delegate },
      runningMode,
      numHands: 1,
    }),
  );
}

export const toDetectedGesture = (category: Category | undefined): DetectedGesture | null =>
  category ? { name: category.categoryName, score: category.score } : null;
