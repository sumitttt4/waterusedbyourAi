/**
 * Package the extension into thirsty.zip for the Chrome Web Store.
 * Stages ONLY what ships — manifest.json, dist/, and the PNG icons — so source
 * files (icon.svg, generators) don't leak into the published package.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outFile = path.join(root, 'thirsty.zip');
const staging = path.join(root, '.package');
const isWindows = process.platform === 'win32';

if (!fs.existsSync(path.join(root, 'dist', 'content.js'))) {
  console.error('dist/content.js missing — run "npm run build" first.');
  process.exit(1);
}

// Fresh staging dir with only the files the store needs.
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(path.join(staging, 'icons'), { recursive: true });
fs.copyFileSync(path.join(root, 'manifest.json'), path.join(staging, 'manifest.json'));
fs.cpSync(path.join(root, 'dist'), path.join(staging, 'dist'), { recursive: true });
for (const f of fs.readdirSync(path.join(root, 'icons'))) {
  if (f.endsWith('.png')) fs.copyFileSync(path.join(root, 'icons', f), path.join(staging, 'icons', f));
}

if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

try {
  if (isWindows) {
    execSync(
      `powershell -Command "Compress-Archive -Force -Path '${path.join(staging, '*')}' -DestinationPath '${outFile}'"`,
      { stdio: 'inherit' },
    );
  } else {
    execSync(`cd "${staging}" && zip -r "${outFile}" .`, { stdio: 'inherit' });
  }
  console.log(`\nPackaged: ${outFile}`);
} catch {
  console.error('Packaging failed.');
  process.exit(1);
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
