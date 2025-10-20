// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { execSync } from 'node:child_process'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

function getBranch() {
  // 1) приоритет у BRANCH_NAME (если передан из CI)
  if (process.env.BRANCH_NAME) return process.env.BRANCH_NAME

  // 2) локально берём из git
  try {
    let name = execSync('git rev-parse --abbrev-ref HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim()

    // если detached HEAD — подставим короткий SHA
    if (name === 'HEAD') {
      name = execSync('git rev-parse --short HEAD', {
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString().trim()
    }
    return name
  } catch {
    return 'main' // запасной вариант, если git недоступен
  }
}

// опционально: нормализуем под имя папки на Pages
const slugify = (s: string) =>
  s.toLowerCase().replace(/[/\s]+/g, '-').replace(/[^a-z0-9._-]/g, '-')

// Плагин для создания 404.html для SPA на GitHub Pages
function create404Plugin() {
  return {
    name: 'create-404-html',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const indexPath = resolve(outDir, 'index.html')
      const notFoundPath = resolve(outDir, '404.html')

      try {
        copyFileSync(indexPath, notFoundPath)
        console.log('✓ Created 404.html for GitHub Pages SPA support')
      } catch (err) {
        console.warn('Failed to create 404.html:', err)
      }
    }
  }
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const branch = getBranch()
  const slug = slugify(branch)

  return {
    plugins: [
      react(),
      nodePolyfills({ globals: { Buffer: true }, protocolImports: true }),
      isBuild && create404Plugin()
    ].filter(Boolean),

    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ton': ['@ton/core', '@tonconnect/ui-react'],
            'vendor-crypto': ['crypto-browserify', 'tweetnacl', 'buffer']
          }
        }
      }
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

    base: isBuild
      ? (branch === 'main'
          ? '/demo-dapp-with-wallet/'
          : `/demo-dapp-with-wallet/${slug}/`)
      : '/',

    server: { fs: { allow: ['../sdk', './'] } },

    define: { __APP_BRANCH__: JSON.stringify(branch) },
  }
})
