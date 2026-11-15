import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { TextInput } from './common/TextInput';
import styles from './EditCountPanel.module.css';

interface EditCountPanelProps {
  open: boolean;
  value: number;
  max: number;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

export function EditCountPanel({ open, value, max, onClose, onSubmit }: EditCountPanelProps) {
  return (
    <Modal open={open} title="輸入數字" onClose={onClose}>
      {/* Rendered only while open, so the draft resets to the current value each time. */}
      <EditCountForm
        initialValue={value}
        max={max}
        onCancel={onClose}
        onSubmit={(next) => {
          onSubmit(next);
          onClose();
        }}
      />
    </Modal>
  );
}

interface EditCountFormProps {
  initialValue: number;
  max: number;
  onCancel: () => void;
  onSubmit: (value: number) => void;
}

function EditCountForm({ initialValue, max, onCancel, onSubmit }: EditCountFormProps) {
  const [draft, setDraft] = useState(String(initialValue));
  const maxLength = String(max).length;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Digits only, so the value is always a non-negative integer within max's digit count.
    setDraft(e.target.value.replace(/\D/g, '').slice(0, maxLength));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (draft === '') return;
    onSubmit(Number(draft));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextInput
        value={draft}
        onChange={handleChange}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={maxLength}
        aria-label={`數字（0–${max}）`}
        placeholder={`0–${max}`}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className={styles.actions}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="submit" variant="primary" disabled={draft === ''}>
          確定
        </Button>
      </div>
    </form>
  );
}
