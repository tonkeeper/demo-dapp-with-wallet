import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const branch = process.env.BRANCH_NAME || 'main';
const basePath =
  branch === 'main'
    ? '/demo-dapp-with-wallet/'
    : `/demo-dapp-with-wallet/${branch}/`;

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true },
      protocolImports: true,
    }),
  ],
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      'vite-plugin-node-polyfills/shims/process': 'process',
      'node:process': 'process',
      'vite-plugin-node-polyfills/shims/buffer': 'buffer',
      'node:buffer': 'buffer',
    },
  },
  optimizeDeps: { include: ['process', 'buffer'] },
  // В проде (GH Pages) используем динамический base
  base: process.env.GH_PAGES ? basePath : './',
  server: {
    fs: {
      allow: ['../sdk', './'],
    },
  },
});
