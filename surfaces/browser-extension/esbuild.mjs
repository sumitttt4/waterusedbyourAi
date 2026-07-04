import { build, context } from 'esbuild';

/** Bundle the content script (and its @thirsty/core dependency) into one IIFE. */
const options = {
  entryPoints: ['src/content.ts'],
  bundle: true,
  outfile: 'dist/content.js',
  format: 'iife',
  target: ['chrome110'],
  legalComments: 'none',
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('thirsty: watching for changes…');
} else {
  await build(options);
}
