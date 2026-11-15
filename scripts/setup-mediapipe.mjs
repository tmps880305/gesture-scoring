// Copies MediaPipe WASM files from node_modules and downloads the gesture model
// into public/, so the app works fully offline (no CDN at runtime).
import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WASM_SRC = resolve(ROOT, 'node_modules/@mediapipe/tasks-vision/wasm');
const WASM_DEST = resolve(ROOT, 'public/wasm');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
const MODEL_DEST = resolve(ROOT, 'public/models/gesture_recognizer.task');

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

async function downloadModel() {
  if (await exists(MODEL_DEST)) {
    console.log('[mediapipe] Model already exists, skipped download');
    return;
  }
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`Model download failed: ${res.status} ${res.statusText}`);
  await mkdir(dirname(MODEL_DEST), { recursive: true });
  await writeFile(MODEL_DEST, Buffer.from(await res.arrayBuffer()));
  console.log('[mediapipe] Model downloaded to public/models');
}

await copyWasm();
await downloadModel();
