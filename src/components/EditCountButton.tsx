import { IconButton } from './common/IconButton';
import { PencilIcon } from './icons/PencilIcon';
import styles from './EditCountButton.module.css';

interface EditCountButtonProps {
  onClick: () => void;
}

export function EditCountButton({ onClick }: EditCountButtonProps) {
  return (
    <IconButton label="輸入數字" className={styles.position} onClick={onClick}>
      <PencilIcon />
    </IconButton>
  );
}
