import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

// npm dependencies stay external and are loaded from node_modules at runtime.
// Workspace packages (@replate/*) ship as TypeScript source, so they are bundled in.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  dependencies?: Record<string, string>;
};
const external = Object.keys(pkg.dependencies ?? {}).filter(
  (name) => !name.startsWith('@replate/'),
);

await build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/server.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  external,
});
