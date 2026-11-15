// Writes package.json "version" into the Xcode project's MARKETING_VERSION,
// so package.json is the single source of truth for the app version.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PBXPROJ = resolve(ROOT, 'ios/App/App.xcodeproj/project.pbxproj');

const { version } = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`package.json version "${version}" must be MAJOR.MINOR.PATCH for iOS`);
}

const project = await readFile(PBXPROJ, 'utf8');
const updated = project.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);

if (updated === project) {
  console.log(`[version] iOS MARKETING_VERSION already ${version}`);
} else {
  await writeFile(PBXPROJ, updated);
  console.log(`[version] iOS MARKETING_VERSION set to ${version}`);
}
