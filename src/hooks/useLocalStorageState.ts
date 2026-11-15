import { useCallback, useState } from 'react';

const readStored = <T,>(key: string, fallback: T, isValid: (value: unknown) => value is T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

/**
 * useState that is persisted to localStorage. Invalid or unreadable stored
 * values fall back to `defaultValue`; storage failures never break the app.
 */
export function useLocalStorageState<T>(key: string, defaultValue: T, isValid: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => readStored(key, defaultValue, isValid));

  const setAndStore = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore: storage may be unavailable (private mode, quota, etc.).
      }
    },
    [key],
  );

  return [value, setAndStore] as const;
}
