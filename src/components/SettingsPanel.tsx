import { useState } from 'react';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function SettingsPanel({ open, onClose, onReset }: SettingsPanelProps) {
  return (
    <Modal open={open} title="設定" onClose={onClose}>
      {/* Rendered only while open, so confirm state resets on every close. */}
      <ResetSection
        onConfirm={() => {
          onReset();
          onClose();
        }}
      />
    </Modal>
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
