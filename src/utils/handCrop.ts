import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { clamp } from './clamp';

export interface CropRect {
  x: number;
  y: number;
  size: number;
}

interface HandCropOptions {
  frameWidth: number;
  frameHeight: number;
  minVisibility: number;
  scale: number;
  minSizePx: number;
}

// MediaPipe Pose landmark indices
const POSE = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftWrist: 15,
  rightWrist: 16,
  leftPinky: 17,
  rightPinky: 18,
  leftIndex: 19,
  rightIndex: 20,
} as const;

const HANDS = [
  [POSE.leftWrist, POSE.leftPinky, POSE.leftIndex],
  [POSE.rightWrist, POSE.rightPinky, POSE.rightIndex],
] as const;

/**
 * Computes a square crop (in source pixels) around each visible hand,
 * sized relative to the shoulder width so it scales with distance.
 */
export function computeHandCrops(landmarks: NormalizedLandmark[], options: HandCropOptions): CropRect[] {
  const { frameWidth, frameHeight, minVisibility, scale, minSizePx } = options;
  const toPx = (lm: NormalizedLandmark) => ({ x: lm.x * frameWidth, y: lm.y * frameHeight });

  const leftShoulder = landmarks[POSE.leftShoulder];
  const rightShoulder = landmarks[POSE.rightShoulder];
  if (!leftShoulder || !rightShoulder) return [];

  const a = toPx(leftShoulder);
  const b = toPx(rightShoulder);
  const shoulderWidth = Math.hypot(a.x - b.x, a.y - b.y);
  const maxSize = Math.min(frameWidth, frameHeight);
  const size = clamp(shoulderWidth * scale, minSizePx, maxSize);

  return HANDS.flatMap(([wrist, ...fingers]) => {
    const wristLm = landmarks[wrist];
    if (!wristLm || wristLm.visibility < minVisibility) return [];

    const points = [wrist, ...fingers].map((i) => landmarks[i]).filter(Boolean).map(toPx);
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    return [
      {
        x: clamp(centerX - size / 2, 0, frameWidth - size),
        y: clamp(centerY - size / 2, 0, frameHeight - size),
        size,
      },
    ];
  });
}
