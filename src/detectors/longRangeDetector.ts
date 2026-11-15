import { PoseLandmarker } from '@mediapipe/tasks-vision';
import {
  HAND_CROP_MIN_SIZE_PX,
  HAND_CROP_OUTPUT_PX,
  HAND_CROP_SCALE,
  POSE_MIN_VISIBILITY,
  POSE_MODEL_PATH,
} from '../constants';
import type { DetectionCandidate } from '../types/gesture';
import { computeHandCrops } from '../utils/handCrop';
import type { CropRect } from '../utils/handCrop';
import {
  createGestureRecognizer,
  createWithGpuFallback,
  loadVisionFileset,
  pickBestGesture,
  toDetectedGesture,
} from './mediapipe';
import type { GestureDetector } from './types';

async function createPoseLandmarker(): Promise<PoseLandmarker> {
  const fileset = await loadVisionFileset();
  return createWithGpuFallback((delegate) =>
    PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: POSE_MODEL_PATH, delegate },
      runningMode: 'VIDEO',
      numPoses: 1,
    }),
  );
}

/**
 * Long-range strategy: find the body with Pose, crop a zoomed square around
 * each hand from the high-res frame, and recognize the gesture on each crop.
 * Falls back to the full frame when no body is found (e.g. very close range).
 */
export async function createLongRangeDetector(): Promise<GestureDetector> {
  const [pose, recognizer] = await Promise.all([createPoseLandmarker(), createGestureRecognizer('IMAGE')]);

  const canvas = document.createElement('canvas');
  canvas.width = HAND_CROP_OUTPUT_PX;
  canvas.height = HAND_CROP_OUTPUT_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  const recognizeCrop = (video: HTMLVideoElement, crop: CropRect): DetectionCandidate => {
    ctx.drawImage(video, crop.x, crop.y, crop.size, crop.size, 0, 0, HAND_CROP_OUTPUT_PX, HAND_CROP_OUTPUT_PX);
    return {
      source: crop.hand === 'left' ? 'leftHand' : 'rightHand',
      gesture: toDetectedGesture(recognizer.recognize(canvas).gestures[0]?.[0]),
    };
  };

  const recognizeFullFrame = (video: HTMLVideoElement): DetectionCandidate => ({
    source: 'fullFrame',
    gesture: toDetectedGesture(recognizer.recognize(video).gestures[0]?.[0]),
  });

  return {
    detect: (video, timestampMs) => {
      const landmarks = pose.detectForVideo(video, timestampMs).landmarks[0];
      const crops = landmarks
        ? computeHandCrops(landmarks, {
            frameWidth: video.videoWidth,
            frameHeight: video.videoHeight,
            minVisibility: POSE_MIN_VISIBILITY,
            scale: HAND_CROP_SCALE,
            minSizePx: HAND_CROP_MIN_SIZE_PX,
          })
        : [];

      const candidates =
        crops.length === 0 ? [recognizeFullFrame(video)] : crops.map((crop) => recognizeCrop(video, crop));
      return { gesture: pickBestGesture(candidates), candidates };
    },
    close: () => {
      pose.close();
      recognizer.close();
    },
  };
}
