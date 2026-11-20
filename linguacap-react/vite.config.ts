import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const envDir = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const privateEnv = loadEnv(mode, envDir, 'LINGUACAP_');
  const apiProxy = privateEnv.LINGUACAP_API_PROXY;
  const hosted = mode === 'integration';
  return {
    plugins: [
      react(),
      {
        name: 'linguacap-brand-assets',
        apply: 'build',
        generateBundle() {
          if (!hosted) return;
          for (const fileName of ['favicon.svg', 'linguacap-logo.png']) {
            this.emitFile({ type: 'asset', fileName, source: readFileSync(new URL(`./public/${fileName}`, import.meta.url)) });
          }
        },
      },
    ],
    envDir,
    build: { copyPublicDir: !hosted },
    server: {
      host: '127.0.0.1',
      proxy: apiProxy ? { '/api': { target: apiProxy, changeOrigin: true } } : undefined,
    },
  };
});
