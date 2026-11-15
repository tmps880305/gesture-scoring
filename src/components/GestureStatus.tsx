import type { GestureStage } from '../types/gesture';
import styles from './GestureStatus.module.css';

interface GestureStatusProps {
  stage: GestureStage;
  /** Overrides the stage message, e.g. loading or camera errors. */
  notice?: string | null;
}

const STAGE_MESSAGE: Record<GestureStage, string> = {
  awaitingFirst: '請比 ✌️',
  awaitingSecond: '請比 👍',
  cooldown: '+1 成功',
};

export function GestureStatus({ stage, notice }: GestureStatusProps) {
  const isSuccess = !notice && stage === 'cooldown';
  const classes = [styles.status, isSuccess && styles.success].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status">
      {notice ?? STAGE_MESSAGE[stage]}
    </div>
  );
}
