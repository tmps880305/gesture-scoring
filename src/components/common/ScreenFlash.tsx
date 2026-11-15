import styles from './ScreenFlash.module.css';

interface ScreenFlashProps {
  /** Increment to replay the flash; 0 renders nothing. */
  trigger: number;
  /** Corner radius of the screen, so the border follows rounded display corners. */
  cornerRadius?: number;
  /** Gap between the border and the screen edge. */
  inset?: number;
}

/** Flashes a border around the whole screen each time `trigger` changes. */
export function ScreenFlash({ trigger, cornerRadius = 0, inset = 0 }: ScreenFlashProps) {
  if (trigger === 0) return null;

  // Shrink the radius by the inset so the border stays concentric with the screen corners.
  const style = { inset, borderRadius: Math.max(cornerRadius - inset, 0) };
  // Changing the key remounts the element, restarting the CSS animation.
  return <div key={trigger} className={styles.flash} style={style} aria-hidden="true" />;
}
