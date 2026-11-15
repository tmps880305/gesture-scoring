// Copies MediaPipe WASM files from node_modules and downloads the gesture model
// into public/, so the app works fully offline (no CDN at runtime).
import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WASM_SRC = resolve(ROOT, 'node_modules/@mediapipe/tasks-vision/wasm');
const WASM_DEST = resolve(ROOT, 'public/wasm');
const MODELS_DEST_DIR = resolve(ROOT, 'public/models');
const MODEL_BASE_URL = 'https://storage.googleapis.com/mediapipe-models';
const MODELS = [
  {
    file: 'gesture_recognizer.task',
    url: `${MODEL_BASE_URL}/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task`,
  },
  {
    file: 'pose_landmarker_lite.task',
    url: `${MODEL_BASE_URL}/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
  },
];

const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

// Only the classic (non-module) loader is used by FilesetResolver.forVisionTasks().
const isUsedWasmFile = (src) => !src.includes('_module_');

async function copyWasm() {
  await rm(WASM_DEST, { recursive: true, force: true });
  await cp(WASM_SRC, WASM_DEST, { recursive: true, filter: isUsedWasmFile });
  console.log('[mediapipe] WASM copied to public/wasm');
}

async function downloadModel({ file, url }) {
  const dest = resolve(MODELS_DEST_DIR, file);
  if (await exists(dest)) {
    console.log(`[mediapipe] ${file} already exists, skipped download`);
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${file} download failed: ${res.status} ${res.statusText}`);
  await mkdir(MODELS_DEST_DIR, { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`[mediapipe] ${file} downloaded to public/models`);
}

await copyWasm();
for (const model of MODELS) await downloadModel(model);
