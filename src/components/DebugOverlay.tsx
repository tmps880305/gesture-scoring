import { useSyncExternalStore } from 'react';
import { FIRST_GESTURE, SECOND_GESTURE } from '../constants';
import { detectionDebugStore } from '../debug/detectionDebugStore';
import type { DetectedGesture, DetectionSource, GestureStage } from '../types/gesture';
import { getGestureMinScore, meetsGestureThreshold } from '../utils/gestureThreshold';
import styles from './DebugOverlay.module.css';

interface DebugOverlayProps {
  stage: GestureStage;
}

const SOURCE_LABEL: Record<DetectionSource, string> = {
  leftHand: '左手',
  rightHand: '右手',
  fullFrame: '整張',
};

const formatGesture = (gesture: DetectedGesture | null) =>
  gesture ? `${gesture.name} ${gesture.score.toFixed(2)}` : '未偵測到手';

/** Live per-frame recognition details; rendered only when DEBUG_OVERLAY_ENABLED. */
export function DebugOverlay({ stage }: DebugOverlayProps) {
  const { result, rate } = useSyncExternalStore(detectionDebugStore.subscribe, detectionDebugStore.getSnapshot);

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div>
        階段 {stage} · {rate}/s
      </div>
      <div>
        門檻 {FIRST_GESTURE} {getGestureMinScore(FIRST_GESTURE)} · {SECOND_GESTURE} {getGestureMinScore(SECOND_GESTURE)}
      </div>
      {result?.candidates.map(({ source, gesture }) => (
        <div key={source} className={gesture && meetsGestureThreshold(gesture) ? styles.pass : undefined}>
          {SOURCE_LABEL[source]}：{formatGesture(gesture)}
        </div>
      ))}
      <div className={styles.picked}>採用：{result?.gesture ? formatGesture(result.gesture) : '—'}</div>
    </div>
  );
}
