import { useCallback, useState } from 'react';
import { CameraVideo } from './components/CameraVideo';
import { CounterDisplay } from './components/CounterDisplay';
import { DebugOverlay } from './components/DebugOverlay';
import { EditCountButton } from './components/EditCountButton';
import { EditCountPanel } from './components/EditCountPanel';
import { GestureStatus } from './components/GestureStatus';
import { IntroAnimation } from './components/IntroAnimation';
import { ScreenFlash } from './components/common/ScreenFlash';
import { SettingsButton } from './components/SettingsButton';
import { SettingsPanel } from './components/SettingsPanel';
import {
  COUNTER_MAX,
  DEBUG_OVERLAY_ENABLED,
  GESTURE_MODE_STORAGE_KEY,
  SCREEN_CORNER_RADIUS_PX,
  SCREEN_FLASH_INSET_PX,
} from './constants';
import { detectionDebugStore } from './debug/detectionDebugStore';
import { DEFAULT_GESTURE_MODE, GESTURE_MODE_OPTIONS, GESTURE_MODES, isGestureMode } from './gestureModes';
import { useCamera } from './hooks/useCamera';
import { useCounter } from './hooks/useCounter';
import { useGestureRecognizer } from './hooks/useGestureRecognizer';
import type { RecognizerStatus } from './hooks/useGestureRecognizer';
import { useGestureSequence } from './hooks/useGestureSequence';
import { useLaunchSequence } from './hooks/useLaunchSequence';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { usePageVisibility } from './hooks/usePageVisibility';
import type { GestureMode } from './types/gesture';
import styles from './App.module.css';

const getGestureNotice = (cameraError: string | null, recognizerStatus: RecognizerStatus) => {
  if (cameraError) return cameraError;
  if (recognizerStatus === 'loading') return '手勢辨識載入中…';
  if (recognizerStatus === 'error') return '手勢辨識載入失敗';
  return null;
};

function App() {
  const { count, increment, decrement, reset, set: setCount } = useCounter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isModalOpen = isSettingsOpen || isEditOpen;
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [mode, setMode] = useLocalStorageState(GESTURE_MODE_STORAGE_KEY, DEFAULT_GESTURE_MODE, isGestureMode);
  const { steps } = GESTURE_MODES[mode];

  const isPageVisible = usePageVisibility();
  const { videoRef, isReady: isCameraReady, error: cameraError } = useCamera({ enabled: isPageVisible });

  const flash = useCallback(() => setFlashTrigger((n) => n + 1), []);
  const {
    stage,
    handleGesture,
    reset: resetSequence,
  } = useGestureSequence({ steps, onStepMatched: flash, onComplete: increment });

  const { status: recognizerStatus } = useGestureRecognizer({
    videoRef,
    enabled: isCameraReady && !isModalOpen && isIntroDone,
    onGesture: handleGesture,
    onDetection: DEBUG_OVERLAY_ENABLED ? detectionDebugStore.publish : undefined,
  });

  const launchPhase = useLaunchSequence({ isAppReady: recognizerStatus !== 'loading', isIntroDone });
  const finishIntro = useCallback(() => setIsIntroDone(true), []);

  const openSettings = useCallback(() => {
    resetSequence();
    setIsSettingsOpen(true);
  }, [resetSequence]);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const openEdit = useCallback(() => {
    resetSequence();
    setIsEditOpen(true);
  }, [resetSequence]);
  const closeEdit = useCallback(() => setIsEditOpen(false), []);

  const changeMode = useCallback(
    (next: GestureMode) => {
      resetSequence();
      setMode(next);
    },
    [resetSequence, setMode],
  );

  return (
    <main className={styles.app}>
      <CameraVideo ref={videoRef} className={styles.hiddenVideo} />
      <CounterDisplay
        value={count}
        onSwipeDown={increment}
        onSwipeUp={decrement}
        swipeEnabled={!isModalOpen}
      />
      <GestureStatus stage={stage} steps={steps} notice={getGestureNotice(cameraError, recognizerStatus)} />
      <SettingsButton onClick={openSettings} />
      <SettingsPanel
        open={isSettingsOpen}
        onClose={closeSettings}
        onReset={reset}
        mode={mode}
        modeOptions={GESTURE_MODE_OPTIONS}
        onModeChange={changeMode}
      />
      <EditCountButton onClick={openEdit} />
      <EditCountPanel open={isEditOpen} value={count} max={COUNTER_MAX} onClose={closeEdit} onSubmit={setCount} />
      {DEBUG_OVERLAY_ENABLED && <DebugOverlay stage={stage} steps={steps} />}
      <ScreenFlash trigger={flashTrigger} cornerRadius={SCREEN_CORNER_RADIUS_PX} inset={SCREEN_FLASH_INSET_PX} />
      {launchPhase !== 'done' && <IntroAnimation playing={launchPhase === 'intro'} onFinish={finishIntro} />}
    </main>
  );
}

export default App;
