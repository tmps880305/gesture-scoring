import { useCallback, useState } from 'react';
import { CameraVideo } from './components/CameraVideo';
import { CounterDisplay } from './components/CounterDisplay';
import { DebugOverlay } from './components/DebugOverlay';
import { GestureStatus } from './components/GestureStatus';
import { ScreenFlash } from './components/common/ScreenFlash';
import { SettingsButton } from './components/SettingsButton';
import { SettingsPanel } from './components/SettingsPanel';
import { DEBUG_OVERLAY_ENABLED } from './constants';
import { detectionDebugStore } from './debug/detectionDebugStore';
import { useCamera } from './hooks/useCamera';
import { useCounter } from './hooks/useCounter';
import { useGestureRecognizer } from './hooks/useGestureRecognizer';
import type { RecognizerStatus } from './hooks/useGestureRecognizer';
import { useGestureSequence } from './hooks/useGestureSequence';
import { usePageVisibility } from './hooks/usePageVisibility';
import styles from './App.module.css';

const getGestureNotice = (cameraError: string | null, recognizerStatus: RecognizerStatus) => {
  if (cameraError) return cameraError;
  if (recognizerStatus === 'loading') return '手勢辨識載入中…';
  if (recognizerStatus === 'error') return '手勢辨識載入失敗';
  return null;
};

function App() {
  const { count, increment, decrement, reset } = useCounter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flashTrigger, setFlashTrigger] = useState(0);

  const isPageVisible = usePageVisibility();
  const { videoRef, isReady: isCameraReady, error: cameraError } = useCamera({ enabled: isPageVisible });

  const flash = useCallback(() => setFlashTrigger((n) => n + 1), []);
  const {
    stage,
    handleGesture,
    reset: resetSequence,
  } = useGestureSequence({ onStepMatched: flash, onComplete: increment });

  const { status: recognizerStatus } = useGestureRecognizer({
    videoRef,
    enabled: isCameraReady && !isSettingsOpen,
    onGesture: handleGesture,
    onDetection: DEBUG_OVERLAY_ENABLED ? detectionDebugStore.publish : undefined,
  });

  const openSettings = useCallback(() => {
    resetSequence();
    setIsSettingsOpen(true);
  }, [resetSequence]);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <main className={styles.app}>
      <CameraVideo ref={videoRef} className={styles.hiddenVideo} />
      <CounterDisplay value={count} onSwipeDown={decrement} swipeEnabled={!isSettingsOpen} />
      <GestureStatus stage={stage} notice={getGestureNotice(cameraError, recognizerStatus)} />
      <SettingsButton onClick={openSettings} />
      <SettingsPanel open={isSettingsOpen} onClose={closeSettings} onReset={reset} />
      {DEBUG_OVERLAY_ENABLED && <DebugOverlay stage={stage} />}
      <ScreenFlash trigger={flashTrigger} />
    </main>
  );
}

export default App;
