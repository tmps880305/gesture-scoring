import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { MAX_CONSECUTIVE_DETECT_ERRORS, RECOGNITION_INTERVAL_MS } from '../constants';
import { createGestureDetector } from '../detectors';
import type { GestureDetector } from '../detectors';
import type { DetectedGesture, DetectionResult } from '../types/gesture';

export type RecognizerStatus = 'loading' | 'ready' | 'error';

/** Loop events for debugging why recognition is (not) running. */
export type RecognitionDiagnostic =
  | { type: 'skip'; reason: string }
  | { type: 'detected'; durationMs: number }
  | { type: 'error'; message: string };

interface UseGestureRecognizerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onGesture: (gesture: DetectedGesture | null) => void;
  /** Optional raw per-frame result, e.g. for the debug overlay. */
  onDetection?: (result: DetectionResult) => void;
  /** Optional loop diagnostics, e.g. for the debug overlay. */
  onDiagnostic?: (event: RecognitionDiagnostic) => void;
}

const toMessage = (err: unknown) => (err instanceof Error ? `${err.name}: ${err.message}` : String(err));

/**
 * Loads the configured gesture detector once, then (while `enabled`) runs it on
 * the video at RECOGNITION_INTERVAL_MS and reports the top gesture (or null).
 * Repeated detection failures (e.g. unsupported device) switch status to 'error'.
 */
export function useGestureRecognizer({
  videoRef,
  enabled,
  onGesture,
  onDetection,
  onDiagnostic,
}: UseGestureRecognizerOptions) {
  const recognizerRef = useRef<GestureDetector | null>(null);
  const callbacksRef = useRef({ onGesture, onDetection, onDiagnostic });
  const [status, setStatus] = useState<RecognizerStatus>('loading');

  useEffect(() => {
    callbacksRef.current = { onGesture, onDetection, onDiagnostic };
  });

  useEffect(() => {
    let cancelled = false;

    createGestureDetector()
      .then((recognizer) => {
        if (cancelled) {
          recognizer.close();
          return;
        }
        recognizerRef.current = recognizer;
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        callbacksRef.current.onDiagnostic?.({ type: 'error', message: `載入：${toMessage(err)}` });
        setStatus('error');
      });

    return () => {
      cancelled = true;
      recognizerRef.current?.close();
      recognizerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled || status !== 'ready') return;

    let frameId = 0;
    let lastRunAt = -Infinity;
    let lastVideoTime = -1;
    let consecutiveErrors = 0;

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const { onGesture: gestureCb, onDetection: detectionCb, onDiagnostic: diagnosticCb } = callbacksRef.current;

      if (now - lastRunAt < RECOGNITION_INTERVAL_MS) return;
      const video = videoRef.current;
      const recognizer = recognizerRef.current;
      if (!video || !recognizer) {
        diagnosticCb?.({ type: 'skip', reason: video ? '偵測器不存在' : '沒有 video' });
        return;
      }
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        diagnosticCb?.({ type: 'skip', reason: `video 未就緒 (readyState ${video.readyState})` });
        return;
      }
      if (video.currentTime === lastVideoTime) {
        diagnosticCb?.({ type: 'skip', reason: '畫面沒有更新' });
        return;
      }

      lastRunAt = now;
      lastVideoTime = video.currentTime;

      try {
        const startedAt = performance.now();
        const result = recognizer.detect(video, now);
        diagnosticCb?.({ type: 'detected', durationMs: performance.now() - startedAt });
        consecutiveErrors = 0;
        gestureCb(result.gesture);
        detectionCb?.(result);
      } catch (err) {
        diagnosticCb?.({ type: 'error', message: `辨識：${toMessage(err)}` });
        consecutiveErrors += 1;
        if (consecutiveErrors >= MAX_CONSECUTIVE_DETECT_ERRORS) {
          cancelAnimationFrame(frameId);
          setStatus('error');
        }
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, status, videoRef]);

  return { status };
}
