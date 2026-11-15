import { useVerticalSwipe } from '../hooks/useVerticalSwipe';
import styles from './CounterDisplay.module.css';

interface CounterDisplayProps {
  value: number;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeEnabled?: boolean;
}

export function CounterDisplay({ value, onSwipeUp, onSwipeDown, swipeEnabled = true }: CounterDisplayProps) {
  const swipeHandlers = useVerticalSwipe({ onSwipeUp, onSwipeDown, enabled: swipeEnabled });

  return (
    <div className={styles.area} {...swipeHandlers}>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
    </div>
  );
}
