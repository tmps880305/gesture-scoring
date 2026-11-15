import { IconButton } from './common/IconButton';
import { GearIcon } from './icons/GearIcon';
import styles from './SettingsButton.module.css';

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <IconButton label="設定" className={styles.position} onClick={onClick}>
      <GearIcon />
    </IconButton>
  );
}
