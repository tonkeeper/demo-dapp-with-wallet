import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        // process: false 
      },
      protocolImports: true,
    }),
  ],
  build: {
    outDir: 'docs'
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
  // @ts-ignore
  base: process.env.GH_PAGES ? '/demo-dapp-with-wallet/' : './',
  server: {
    fs: {
      allow: ['../sdk', './'],
    },
  },
});
