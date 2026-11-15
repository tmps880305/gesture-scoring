import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { GESTURE_MODEL_PATH, MEDIAPIPE_WASM_PATH, RECOGNITION_INTERVAL_MS } from '../constants';
import type { DetectedGesture } from '../types/gesture';

export type RecognizerStatus = 'loading' | 'ready' | 'error';

interface UseGestureRecognizerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onGesture: (gesture: DetectedGesture | null) => void;
}

async function createRecognizer(): Promise<GestureRecognizer> {
  const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
  const create = (delegate: 'GPU' | 'CPU') =>
    GestureRecognizer.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: GESTURE_MODEL_PATH, delegate },
      runningMode: 'VIDEO',
      numHands: 1,
    });

  try {
    return await create('GPU');
  } catch {
    return create('CPU');
  }
}

/**
 * Loads the MediaPipe GestureRecognizer once, then (while `enabled`) runs it on
 * the video at RECOGNITION_INTERVAL_MS and reports the top gesture (or null).
 */
export function useGestureRecognizer({ videoRef, enabled, onGesture }: UseGestureRecognizerOptions) {
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const onGestureRef = useRef(onGesture);
  const [status, setStatus] = useState<RecognizerStatus>('loading');

  useEffect(() => {
    onGestureRef.current = onGesture;
  });

  useEffect(() => {
    let cancelled = false;

    createRecognizer()
      .then((recognizer) => {
        if (cancelled) {
          recognizer.close();
          return;
        }
        recognizerRef.current = recognizer;
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
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

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);

      const video = videoRef.current;
      const recognizer = recognizerRef.current;
      if (!video || !recognizer || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (now - lastRunAt < RECOGNITION_INTERVAL_MS || video.currentTime === lastVideoTime) return;

      lastRunAt = now;
      lastVideoTime = video.currentTime;

      const top = recognizer.recognizeForVideo(video, now).gestures[0]?.[0];
      onGestureRef.current(top ? { name: top.categoryName, score: top.score } : null);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, status, videoRef]);

  return { status };
}
