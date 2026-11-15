import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Hides the native launch splash instantly; the web intro underneath looks
 * identical, so the hand-off is seamless. No-op on the web.
 */
export async function hideNativeSplash(): Promise<void> {
  try {
    await SplashScreen.hide({ fadeOutDuration: 0 });
  } catch {
    // Plugin unavailable (e.g. plain browser): nothing to hide.
  }
}
