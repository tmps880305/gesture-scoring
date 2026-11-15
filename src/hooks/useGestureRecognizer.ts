import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { RECOGNITION_INTERVAL_MS } from '../constants';
import { createGestureDetector } from '../detectors';
import type { GestureDetector } from '../detectors';
import type { DetectedGesture } from '../types/gesture';

export type RecognizerStatus = 'loading' | 'ready' | 'error';

interface UseGestureRecognizerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onGesture: (gesture: DetectedGesture | null) => void;
}

/**
 * Loads the configured gesture detector once, then (while `enabled`) runs it on
 * the video at RECOGNITION_INTERVAL_MS and reports the top gesture (or null).
 */
export function useGestureRecognizer({ videoRef, enabled, onGesture }: UseGestureRecognizerOptions) {
  const recognizerRef = useRef<GestureDetector | null>(null);
  const onGestureRef = useRef(onGesture);
  const [status, setStatus] = useState<RecognizerStatus>('loading');

  useEffect(() => {
    onGestureRef.current = onGesture;
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

      onGestureRef.current(recognizer.detect(video, now));
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, status, videoRef]);

  return { status };
}
