import { LONG_RANGE_MODE_ENABLED } from '../constants';
import { createFullFrameDetector } from './fullFrameDetector';
import { createLongRangeDetector } from './longRangeDetector';

export type { GestureDetector } from './types';

export const createGestureDetector = LONG_RANGE_MODE_ENABLED ? createLongRangeDetector : createFullFrameDetector;
