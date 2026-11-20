import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const envDir = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const privateEnv = loadEnv(mode, envDir, 'LINGUACAP_');
  const apiProxy = privateEnv.LINGUACAP_API_PROXY;
  return {
    plugins: [react()],
    envDir,
    server: {
      host: '127.0.0.1',
      proxy: apiProxy ? { '/api': { target: apiProxy, changeOrigin: true } } : undefined,
    },
  };
});
