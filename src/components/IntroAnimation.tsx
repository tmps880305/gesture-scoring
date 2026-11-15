import type { AnimationEvent } from 'react';
import logoUrl from '../assets/tekazu-logo.svg';
import styles from './IntroAnimation.module.css';

interface IntroAnimationProps {
  /** false: static logo matching the native splash; true: play the flip, then fade out. */
  playing: boolean;
  /** Called once the fade-out finishes. */
  onFinish: () => void;
}

const TILES = [styles.tileLeft, styles.tileRight];

/**
 * Full-screen launch intro. The static state is pixel-identical to the iOS
 * launch splash; when `playing`, each logo tile flips like a split-flap
 * display, then the overlay fades out to reveal the app.
 */
export function IntroAnimation({ playing, onFinish }: IntroAnimationProps) {
  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    // Child flap animations bubble up; only the overlay's own fade-out finishes the intro.
    if (e.target === e.currentTarget) onFinish();
  };

  return (
    <div
      className={[styles.overlay, playing && styles.exit].filter(Boolean).join(' ')}
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    >
      <div className={styles.logo}>
        {TILES.map((tileClass) => (
          <div key={tileClass} className={tileClass}>
            <Half position="top" />
            <Half position="bottom" />
            {playing && (
              <>
                <Half position="top" flap />
                <Half position="bottom" flap />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface HalfProps {
  position: 'top' | 'bottom';
  flap?: boolean;
}

function Half({ position, flap = false }: HalfProps) {
  const classes = [
    styles.half,
    position === 'top' ? styles.top : styles.bottom,
    flap && (position === 'top' ? styles.flapTop : styles.flapBottom),
  ]
    .filter(Boolean)
    .join(' ');
  return <img className={classes} src={logoUrl} alt="" draggable={false} />;
}
