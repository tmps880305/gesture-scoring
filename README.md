# Tekazu — 手勢計數器

iPhone 橫向計數 App。畫面中央大大顯示一個 0–99 的數字，可以**對前鏡頭比手勢 +1**，也可以用觸控滑動或直接輸入來調整數字。手勢辨識完全在裝置上執行，不需要網路，在約 1–7 公尺的距離內可用。

## 功能

| 操作 | 效果 |
|---|---|
| 手勢（模式 A，預設） | 比 ✌️，3 秒內再比 🖐️ → +1 |
| 手勢（模式 B） | 持續比 👍（連續 5 幀）→ +1 |
| 在數字上往下滑 | +1 |
| 在數字上往上滑 | -1 |
| 右下角 ✏️ | 直接輸入 0–99 的數字 |
| 右上角 ⚙️ | 切換辨識模式（會記住）、數字歸零 |

- 數字固定在 0–99 之間，不會循環。
- 每段手勢成立時，螢幕邊框會閃一下綠框；+1 後有 1.5 秒冷卻，避免重複觸發。
- 左上角會提示目前要比什麼手勢。
- 啟動時 logo 會停留到手勢辨識模型載入完成，接著播放翻牌動畫，再進入主畫面。

## 技術架構

- **React 19 + TypeScript + Vite**
- **MediaPipe** `@mediapipe/tasks-vision`：`GestureRecognizer` 辨識手勢，`PoseLandmarker` 處理長距離辨識
- **Capacitor 8**：包成 iOS App（Swift Package Manager）

### 長距離辨識
MediaPipe 偵測手時會先把整張畫面縮成 192×192，手在 2 公尺外就太小、找不到了。所以這個專案的作法是：

1. 相機用 1920×1080 拍攝
2. 用 `PoseLandmarker` 找出身體和手腕的位置
3. 依肩寬裁切左右手周圍的區域並放大
4. 對裁切出來的小圖做手勢辨識，取分數最高的真正手勢（`None` 不算）

偵測不到身體時，會改成辨識整張畫面。這個模式可以用 `src/constants.ts` 的 `LONG_RANGE_MODE_ENABLED` 關閉。

## 環境需求

- Node.js 22.12 以上（Vite 和 Capacitor CLI 的需求）
- Xcode（建置 iOS App 用）
- 實機測試需要 Apple 開發者帳號，用來簽章

## 安裝

```bash
npm install
```

`postinstall` 會自動執行 `npm run setup:mediapipe`，做兩件事：
- 把 MediaPipe 的 WASM 從 `node_modules` 複製到 `public/wasm/`
- 下載 `gesture_recognizer.task` 和 `pose_landmarker_lite.task` 到 `public/models/`，已經下載過就跳過

這些檔案不進版控（已列在 `.gitignore`），App 執行時從本地載入，所以離線也能使用。

## 開發

```bash
npm run dev
```

用瀏覽器開啟後，允許使用相機就能用 webcam 測試。開發模式下，左下角會顯示偵錯資訊，內容包括：目前步驟、每秒辨識次數、左右手各自的辨識結果，以及最後採用的手勢。

> 相機需要安全連線，用 `localhost` 開啟沒問題；如果在手機上用區網 IP 連 dev server，會無法開啟相機。

## 建置 iOS App

```bash
npm run build:ios
```

這個指令會編譯網頁程式碼，並同步到 iOS 專案（`cap sync ios`）。接著：

```bash
npx cap open ios
```

在 Xcode 選擇裝置後按 Run。模擬器沒有前鏡頭，手勢辨識要用實機測試。

需要在手機上看偵錯資訊時，改用：

```bash
npm run build:ios:debug
```

## 指令一覽

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動開發伺服器（含偵錯資訊） |
| `npm run build` | 型別檢查並編譯到 `dist/` |
| `npm run lint` | 用 oxlint 檢查程式碼 |
| `npm run preview` | 預覽編譯結果 |
| `npm run setup:mediapipe` | 重新複製 WASM、下載模型 |
| `npm run build:ios` | 編譯、同步版本號，並同步到 iOS 專案 |
| `npm run build:ios:debug` | 同上，但 App 會顯示偵錯資訊 |
| `npm run sync:ios-version` | 把 `package.json` 的版本寫入 Xcode 的 `MARKETING_VERSION` |
| `npm run generate:ios-splash` | 用 `src/assets/tekazu-logo.svg` 重新產生 iOS 啟動畫面（僅限 macOS） |

## 圖示與啟動畫面

原始檔放在 `src/assets/`：

| 檔案 | 用途 |
|---|---|
| `tekazu-appstore-1024.png` | iOS App 圖示，複製到 `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` |
| `tekazu-icon.svg` | 網頁 favicon，複製到 `public/favicon.svg` |
| `tekazu-logo.svg` | iOS 啟動畫面（執行 `npm run generate:ios-splash` 產生），以及啟動翻牌動畫 |

啟動畫面是 2732×2732 的 PNG：背景為深色 `#0f1115`，與 App 背景相同，logo 1100px 置中。logo 更新後重跑一次 `npm run generate:ios-splash` 即可。這個指令用 Swift／AppKit 轉檔 SVG，所以只能在 macOS 上執行。

啟動流程使用 `@capacitor/splash-screen`（`launchAutoHide: false`）：

1. 原生啟動畫面會一直顯示，直到模型載入完成，最多等 10 秒（`LAUNCH_MAX_WAIT_MS`）。
2. 網頁端在完全相同的位置顯示同一個 logo，接著隱藏原生啟動畫面，所以切換時看不出來。
3. 播放翻牌動畫（`src/components/IntroAnimation.tsx`）後進入主畫面。

如果改了 `generate:ios-splash` 的 canvas 或 logo 尺寸，要一起修改 `IntroAnimation.module.css` 的 `.logo` 寬度（`1100 / 2732 × 100vmax`），不然切換時 logo 會跳動。

> iOS 會快取 App 圖示和啟動畫面，更新後如果手機上看不到變化，請刪除 App 再重新安裝。

## 版本號

`package.json` 的 `version` 是唯一的版本來源，`npm run build:ios` 會自動把它寫進 Xcode 的 `MARKETING_VERSION`。升版時用：

```bash
npm version patch --no-git-tag-version
```

`patch` 可換成 `minor` 或 `major`。

Xcode 的 build number（`CURRENT_PROJECT_VERSION`）不會自動改。每次上傳 TestFlight／App Store 都需要不同的 build number，請在 Xcode 的 General → Identity → Build 手動加 1。

## 調整參數

門檻值、幀數、逾時、冷卻時間、長距離參數等，都集中在 `src/constants.ts`；辨識模式的步驟則定義在 `src/gestureModes.ts`。常用的有：

| 常數 | 預設值 | 說明 |
|---|---|---|
| `GESTURE_MIN_SCORES` | Victory 0.7、Open_Palm 0.6、Thumb_Up 0.6 | 各手勢的信心分數門檻 |
| `GESTURE_MIN_CONSECUTIVE_FRAMES` | 3 | 模式 A 每段需要連續成立的幀數 |
| `HOLD_MIN_CONSECUTIVE_FRAMES` | 5 | 模式 B 需要連續成立的幀數 |
| `SEQUENCE_TIMEOUT_MS` | 3000 | 模式 A 兩段之間的最長等待時間 |
| `SUCCESS_COOLDOWN_MS` | 1500 | +1 後的冷卻時間 |
| `RECOGNITION_INTERVAL_MS` | 80 | 辨識間隔（約每秒 12.5 次），手機發熱時可以調大 |
| `LONG_RANGE_MODE_ENABLED` | `true` | 是否啟用長距離辨識 |
| `SCREEN_CORNER_RADIUS_PX` | 56 | 綠框圓角，用來配合 iPhone 螢幕圓角 |

要新增辨識模式，在 `src/gestureModes.ts` 加一筆步驟列表即可，狀態機不用修改。

## 專案結構

```
src/
  components/          # UI 元件（common/ 為共用元件，icons/ 為圖示）
  debug/               # 偵錯資訊用的 store
  detectors/           # 手勢偵測方式（整張畫面／長距離），實作同一介面
  hooks/               # 相機、辨識迴圈、手勢狀態機、滑動、localStorage 等
  types/               # 共用型別
  utils/               # clamp、手部裁切計算、手勢門檻
  constants.ts         # 可調整的參數
  gestureModes.ts      # 辨識模式設定
  App.tsx
scripts/
  setup-mediapipe.mjs  # 複製 WASM、下載模型
  sync-ios-version.mjs # 同步版本號到 Xcode
  render-splash.swift  # 產生 iOS 啟動畫面（macOS）
ios/                   # Capacitor iOS 專案
```

## 已知限制

- 最遠可辨識距離會受機型（前鏡頭視角、畫質、效能）和光線影響。
- iOS 沒有公開的 API 可以取得螢幕圓角，綠框圓角用固定值近似。
- 目前只支援 iOS（iPhone、iPad）；Android 版尚未實作。
