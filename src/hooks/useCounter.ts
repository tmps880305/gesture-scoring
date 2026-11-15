import { useCallback, useState } from 'react';
import { COUNTER_INITIAL, COUNTER_MAX, COUNTER_MIN } from '../constants';
import { clamp } from '../utils/clamp';

const clampCount = (value: number) => clamp(value, COUNTER_MIN, COUNTER_MAX);

export function useCounter(initialValue: number = COUNTER_INITIAL) {
  const [count, setCount] = useState(() => clampCount(initialValue));

  const increment = useCallback(() => setCount((c) => clampCount(c + 1)), []);
  const decrement = useCallback(() => setCount((c) => clampCount(c - 1)), []);
  const reset = useCallback(() => setCount(COUNTER_INITIAL), []);
  const set = useCallback((value: number) => setCount(clampCount(Math.trunc(value))), []);

  return { count, increment, decrement, reset, set };
}
