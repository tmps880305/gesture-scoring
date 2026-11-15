import { useEffect, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';
import { detectionDebugStore } from '../debug/detectionDebugStore';
import type { LoopDiagnostics } from '../debug/detectionDebugStore';
import type { DetectedGesture, DetectionSource, GestureStage, GestureStep } from '../types/gesture';
import { getGestureMinScore, meetsGestureThreshold } from '../utils/gestureThreshold';
import styles from './DebugOverlay.module.css';

interface DebugOverlayProps {
  stage: GestureStage;
  steps: readonly GestureStep[];
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  recognitionEnabled: boolean;
}

/** Polled values (camera element + loop diagnostics), refreshed even when no detection happens. */
const POLL_INTERVAL_MS = 500;
/** The loop counts as running if it reported anything within this window. */
const LOOP_ALIVE_MS = 1500;

const check = (ok: boolean) => (ok ? '✓' : '✗');

const formatVideo = (video: HTMLVideoElement | null) => {
  if (!video) return 'video 不存在';
  const stream = check(video.srcObject !== null);
  return `stream ${stream} · ${video.videoWidth}x${video.videoHeight} · rs ${video.readyState} · t=${video.currentTime.toFixed(1)} · ${video.paused ? 'paused' : 'playing'}`;
};

const formatLoop = (d: Readonly<LoopDiagnostics>, now: number) => {
  if (d.lastEventAt === null) return '迴圈 未執行';
  const alive = now - d.lastEventAt < LOOP_ALIVE_MS ? '執行中' : '停止';
  const detail = d.lastSkipReason ? `略過：${d.lastSkipReason}` : `耗時 ${d.lastDetectMs?.toFixed(0) ?? '—'}ms`;
  return `迴圈 ${alive} · ${detail}`;
};

interface PolledStatus {
  video: string;
  loop: string;
  error: string | null;
}

/** Reads the video element and loop diagnostics on an interval (refs must not be read during render). */
function usePolledStatus(videoRef: RefObject<HTMLVideoElement | null>): PolledStatus | null {
  const [status, setStatus] = useState<PolledStatus | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      const d = detectionDebugStore.getDiagnostics();
      setStatus({
        video: formatVideo(videoRef.current),
        loop: formatLoop(d, performance.now()),
        error: d.lastError ? `錯誤 ×${d.errorCount}：${d.lastError}` : null,
      });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [videoRef]);
  return status;
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
export function DebugOverlay({ stage, steps, videoRef, cameraReady, recognitionEnabled }: DebugOverlayProps) {
  const { result, rate } = useSyncExternalStore(detectionDebugStore.subscribe, detectionDebugStore.getSnapshot);
  const polled = usePolledStatus(videoRef);

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div>
        {formatStage(stage, steps.length)} · {rate}/s
      </div>
      <div>條件 {steps.map(formatStep).join(' → ')}</div>
      <div>
        相機就緒 {check(cameraReady)} · 辨識啟用 {check(recognitionEnabled)}
      </div>
      <div>{polled?.video ?? '相機狀態讀取中…'}</div>
      <div>{polled?.loop ?? '迴圈狀態讀取中…'}</div>
      {polled?.error && <div className={styles.error}>{polled.error}</div>}
      {result?.candidates.map(({ source, gesture }) => (
        <div key={source} className={gesture && meetsGestureThreshold(gesture) ? styles.pass : undefined}>
          {SOURCE_LABEL[source]}：{formatGesture(gesture)}
        </div>
      ))}
      <div className={styles.picked}>採用：{result?.gesture ? formatGesture(result.gesture) : '—'}</div>
    </div>
  );
}
