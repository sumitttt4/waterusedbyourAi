import { build } from 'esbuild';

/** Bundle the statusline (and @thirsty/core) into a single runnable .mjs. */
await build({
  entryPoints: ['src/statusline.ts'],
  bundle: true,
  outfile: 'dist/statusline.mjs',
  platform: 'node',
  format: 'esm',
  target: ['node20'],
  banner: { js: '#!/usr/bin/env node' },
  legalComments: 'none',
  logLevel: 'info',
});
