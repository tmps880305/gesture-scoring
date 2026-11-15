import { useSyncExternalStore } from 'react';
import { detectionDebugStore } from '../debug/detectionDebugStore';
import type { DetectedGesture, DetectionSource, GestureStage, GestureStep } from '../types/gesture';
import { getGestureMinScore, meetsGestureThreshold } from '../utils/gestureThreshold';
import styles from './DebugOverlay.module.css';

interface DebugOverlayProps {
  stage: GestureStage;
  steps: readonly GestureStep[];
}

const SOURCE_LABEL: Record<DetectionSource, string> = {
  leftHand: '左手',
  rightHand: '右手',
  fullFrame: '整張',
};

const formatGesture = (gesture: DetectedGesture | null) =>
  gesture ? `${gesture.name} ${gesture.score.toFixed(2)}` : '未偵測到手';

const formatStage = (stage: GestureStage, stepCount: number) =>
  stage.kind === 'cooldown' ? '冷卻中' : `步驟 ${stage.stepIndex + 1}/${stepCount}`;

const formatStep = ({ gesture, minFrames }: GestureStep) =>
  `${gesture} ≥${getGestureMinScore(gesture)} ×${minFrames}`;

/** Live per-frame recognition details; rendered only when DEBUG_OVERLAY_ENABLED. */
export function DebugOverlay({ stage, steps }: DebugOverlayProps) {
  const { result, rate } = useSyncExternalStore(detectionDebugStore.subscribe, detectionDebugStore.getSnapshot);

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div>
        {formatStage(stage, steps.length)} · {rate}/s
      </div>
      <div>條件 {steps.map(formatStep).join(' → ')}</div>
      {result?.candidates.map(({ source, gesture }) => (
        <div key={source} className={gesture && meetsGestureThreshold(gesture) ? styles.pass : undefined}>
          {SOURCE_LABEL[source]}：{formatGesture(gesture)}
        </div>
      ))}
      <div className={styles.picked}>採用：{result?.gesture ? formatGesture(result.gesture) : '—'}</div>
    </div>
  );
}
