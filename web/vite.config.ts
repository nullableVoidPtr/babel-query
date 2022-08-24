import { defineConfig } from 'vite';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    viteCommonjs(),
    (monacoEditorPlugin as any).default({}),
  ],
  define: {
    "process.env": {},
    "process.platform": "'browser'",
  },
  build: {
    sourcemap: true,
  },
});