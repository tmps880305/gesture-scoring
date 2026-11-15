import { SCREEN_CORNER_RADIUS_PX, TABLET_MIN_SHORT_SIDE_PX, TABLET_SCREEN_CORNER_RADIUS_PX } from '../constants';

/** Approximate display corner radius in CSS px: tablets have much smaller corners than phones. */
export function getScreenCornerRadius(): number {
  const shortSide = Math.min(window.screen.width, window.screen.height);
  return shortSide >= TABLET_MIN_SHORT_SIDE_PX ? TABLET_SCREEN_CORNER_RADIUS_PX : SCREEN_CORNER_RADIUS_PX;
}
