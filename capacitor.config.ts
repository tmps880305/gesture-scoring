import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tekazu.app',
  appName: 'Tekazu',
  webDir: 'dist',
  // Matches --color-bg in src/index.css to avoid a white flash on launch.
  backgroundColor: '#0f1115',
  ios: {
    // Full-screen app: no WebView scrolling / rubber-band bounce.
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      // Kept visible until the web app hides it (see src/hooks/useLaunchSequence.ts).
      launchAutoHide: false,
      backgroundColor: '#0f1115',
    },
  },
};

export default config;
