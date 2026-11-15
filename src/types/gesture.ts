export interface DetectedGesture {
  name: string;
  score: number;
}

export type GestureStage = 'awaitingFirst' | 'awaitingSecond' | 'cooldown';
