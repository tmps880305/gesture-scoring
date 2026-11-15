import { useEffect, useState } from 'react';
import { LAUNCH_MAX_WAIT_MS } from '../constants';
import { hideNativeSplash } from '../utils/nativeSplash';

/**
 * loading: native splash / static logo while the app gets ready
 * intro:   flip animation is playing
 * done:    main screen is interactive
 */
export type LaunchPhase = 'loading' | 'intro' | 'done';

interface UseLaunchSequenceOptions {
  isAppReady: boolean;
  isIntroDone: boolean;
}

/**
 * Drives the launch flow: wait until `isAppReady` (or LAUNCH_MAX_WAIT_MS),
 * hide the native splash, then play the intro until `isIntroDone`.
 */
export function useLaunchSequence({ isAppReady, isIntroDone }: UseLaunchSequenceOptions): LaunchPhase {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), LAUNCH_MAX_WAIT_MS);
    return () => window.clearTimeout(id);
  }, []);

  const isReady = isAppReady || timedOut;

  useEffect(() => {
    if (isReady) void hideNativeSplash();
  }, [isReady]);

  if (isIntroDone) return 'done';
  return isReady ? 'intro' : 'loading';
}
