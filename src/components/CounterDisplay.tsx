import { useSwipeDown } from '../hooks/useSwipeDown';
import styles from './CounterDisplay.module.css';

interface CounterDisplayProps {
  value: number;
  onSwipeDown: () => void;
  swipeEnabled?: boolean;
}

export function CounterDisplay({ value, onSwipeDown, swipeEnabled = true }: CounterDisplayProps) {
  const swipeHandlers = useSwipeDown({ onSwipeDown, enabled: swipeEnabled });

  return (
    <div className={styles.area} {...swipeHandlers}>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
    </div>
  );
}
