import { useCallback, useRef } from 'react';
import type { PointerEvent } from 'react';
import { SWIPE_MIN_DISTANCE_PX } from '../constants';

interface UseVerticalSwipeOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  enabled?: boolean;
  minDistance?: number;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Detects at most one vertical swipe (up or down) per pointer gesture.
 * Returns pointer handlers to spread onto the target element.
 */
export function useVerticalSwipe({
  onSwipeUp,
  onSwipeDown,
  enabled = true,
  minDistance = SWIPE_MIN_DISTANCE_PX,
}: UseVerticalSwipeOptions) {
  const startRef = useRef<Point | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || !e.isPrimary) return;
      startRef.current = { x: e.clientX, y: e.clientY };
    },
    [enabled],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const start = startRef.current;
      startRef.current = null;
      if (!enabled || !start || !e.isPrimary) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const isVertical = Math.abs(dy) >= minDistance && Math.abs(dy) > Math.abs(dx);
      if (!isVertical) return;

      if (dy > 0) onSwipeDown?.();
      else onSwipeUp?.();
    },
    [enabled, minDistance, onSwipeUp, onSwipeDown],
  );

  const onPointerCancel = useCallback(() => {
    startRef.current = null;
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel };
}
