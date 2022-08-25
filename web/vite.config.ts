import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    (monacoEditorPlugin as any).default({
      languageWorkers: ["editorWorkerService", "typescript"],
    }),
  ],
  base: '/babylon-query/',
  define: {
    "process.env": {},
    "process.platform": "'browser'",
    "Buffer.isBuffer": "(() => false)",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@babel")) {
            return "babel";
          }

          if (id.includes("monaco-editor")) {
            return "monaco";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});