import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/background', { recursive: true });
await mkdir('dist/content', { recursive: true });
await mkdir('dist/popup', { recursive: true });

await build({
  entryPoints: {
    'background/index': 'src/background/index.ts',
    'content/index': 'src/content/index.ts',
    'popup/main': 'src/popup/main.ts'
  },
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  target: 'chrome120',
  sourcemap: false,
  logLevel: 'info'
});

await cp('manifest.json', 'dist/manifest.json');
await cp('src/popup/index.html', 'dist/popup/index.html');
