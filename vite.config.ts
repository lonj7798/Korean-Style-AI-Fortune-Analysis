import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import `cwd` from `process` to resolve the TypeScript error on `process.cwd()`.
import { cwd } from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    // This makes the VITE_GEMINI_API_KEY from your .env file
    // available as process.env.API_KEY in your app.
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
  };
});
