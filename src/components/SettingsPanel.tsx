import { useState } from 'react';
import type { ReactNode } from 'react';
import type { GestureMode } from '../types/gesture';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { SegmentedControl } from './common/SegmentedControl';
import type { SegmentedOption } from './common/SegmentedControl';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  mode: GestureMode;
  modeOptions: readonly SegmentedOption<GestureMode>[];
  onModeChange: (mode: GestureMode) => void;
}

export function SettingsPanel({ open, onClose, onReset, mode, modeOptions, onModeChange }: SettingsPanelProps) {
  return (
    <Modal open={open} title="設定" onClose={onClose}>
      <div className={styles.sections}>
        <Section title="辨識模式">
          <SegmentedControl options={modeOptions} value={mode} onChange={onModeChange} ariaLabel="辨識模式" />
        </Section>
        <Section title="數字">
          {/* Rendered only while open, so confirm state resets on every close. */}
          <ResetSection
            onConfirm={() => {
              onReset();
              onClose();
            }}
          />
        </Section>
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

interface ResetSectionProps {
  onConfirm: () => void;
}

function ResetSection({ onConfirm }: ResetSectionProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="danger" className={styles.fullWidth} onClick={() => setConfirming(true)}>
        數字歸零
      </Button>
    );
  }

  return (
    <div className={styles.confirm}>
      <p className={styles.message}>確定要將數字歸零嗎？</p>
      <div className={styles.actions}>
        <Button onClick={() => setConfirming(false)}>取消</Button>
        <Button variant="danger" onClick={onConfirm}>
          確定歸零
        </Button>
      </div>
    </div>
  );
}
