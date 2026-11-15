export interface DetectedGesture {
  name: string;
  score: number;
}

export type GestureStage = 'awaitingFirst' | 'awaitingSecond' | 'cooldown';

/** Where a candidate came from: a crop around one hand, or the whole frame. */
export type DetectionSource = 'leftHand' | 'rightHand' | 'fullFrame';

export interface DetectionCandidate {
  source: DetectionSource;
  /** null when no hand was found in this source. */
  gesture: DetectedGesture | null;
}

export interface DetectionResult {
  /** The chosen gesture fed into the sequence (never the "None" category). */
  gesture: DetectedGesture | null;
  /** Every raw result considered, for debugging. */
  candidates: DetectionCandidate[];
}
