import { useCallback, useState } from 'react';
import { CounterDisplay } from './components/CounterDisplay';
import { SettingsButton } from './components/SettingsButton';
import { SettingsPanel } from './components/SettingsPanel';
import { useCounter } from './hooks/useCounter';
import styles from './App.module.css';

function App() {
  const { count, decrement, reset } = useCounter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <main className={styles.app}>
      <CounterDisplay value={count} onSwipeDown={decrement} swipeEnabled={!isSettingsOpen} />
      <SettingsButton onClick={openSettings} />
      <SettingsPanel open={isSettingsOpen} onClose={closeSettings} onReset={reset} />
    </main>
  );
}

export default App;
