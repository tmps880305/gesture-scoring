import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

const getSnapshot = () => document.visibilityState === 'visible';

/** True while the page (or the app, inside a WebView) is in the foreground. */
export function usePageVisibility(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
