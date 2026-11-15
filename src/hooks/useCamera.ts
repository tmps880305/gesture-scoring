import { useEffect, useRef, useState } from 'react';
import { CAMERA_IDEAL_HEIGHT, CAMERA_IDEAL_WIDTH } from '../constants';

interface UseCameraOptions {
  enabled: boolean;
}

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: 'user',
  width: { ideal: CAMERA_IDEAL_WIDTH },
  height: { ideal: CAMERA_IDEAL_HEIGHT },
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const toErrorMessage = (err: unknown): string => {
  if (err instanceof DOMException && err.name === 'NotAllowedError') return '未取得相機權限';
  if (err instanceof DOMException && err.name === 'NotFoundError') return '找不到相機';
  return '無法開啟相機';
};

/**
 * Streams the front camera into the returned video ref while `enabled`.
 * Stops all tracks when disabled or unmounted.
 */
export function useCamera({ enabled }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    const video = videoRef.current;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia unavailable');
        stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS, audio: false });
        if (cancelled || !video) return;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;
        setError(null);
        setIsReady(true);
      } catch (err) {
        if (!cancelled) setError(toErrorMessage(err));
      }
    };

    start();

    return () => {
      cancelled = true;
      stopStream(stream);
      if (video) video.srcObject = null;
      setIsReady(false);
    };
  }, [enabled]);

  return { videoRef, isReady, error };
}
