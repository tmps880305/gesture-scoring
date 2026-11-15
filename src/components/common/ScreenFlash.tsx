import styles from './ScreenFlash.module.css';

interface ScreenFlashProps {
  /** Increment to replay the flash; 0 renders nothing. */
  trigger: number;
}

/** Flashes a border around the whole screen each time `trigger` changes. */
export function ScreenFlash({ trigger }: ScreenFlashProps) {
  if (trigger === 0) return null;
  // Changing the key remounts the element, restarting the CSS animation.
  return <div key={trigger} className={styles.flash} aria-hidden="true" />;
}
