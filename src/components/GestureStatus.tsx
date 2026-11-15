import type { GestureStage, GestureStep } from '../types/gesture';
import styles from './GestureStatus.module.css';

interface GestureStatusProps {
  stage: GestureStage;
  steps: readonly GestureStep[];
  /** Overrides the stage message, e.g. loading or camera errors. */
  notice?: string | null;
}

const SUCCESS_MESSAGE = '+1 成功';

const getStageMessage = (stage: GestureStage, steps: readonly GestureStep[]) =>
  stage.kind === 'cooldown' ? SUCCESS_MESSAGE : (steps[stage.stepIndex]?.prompt ?? '');

export function GestureStatus({ stage, steps, notice }: GestureStatusProps) {
  const isSuccess = !notice && stage.kind === 'cooldown';
  const classes = [styles.status, isSuccess && styles.success].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status">
      {notice ?? getStageMessage(stage, steps)}
    </div>
  );
}
