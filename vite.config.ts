// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { execSync } from 'node:child_process'

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

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const branch = getBranch()
  const slug = slugify(branch)

  return {
    plugins: [react(), nodePolyfills({ globals: { Buffer: true }, protocolImports: true })],
    build: { outDir: 'dist' },
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

    // dev: '/', build: базовый путь по ветке
    base: isBuild
      ? (branch === 'main'
          ? '/demo-dapp-with-wallet/'
          : `/demo-dapp-with-wallet/${slug}/`)
      : '/',

    server: { fs: { allow: ['../sdk', './'] } },

    // (необязательно) Пробросить имя ветки в клиентский код:
    define: { __APP_BRANCH__: JSON.stringify(branch) },
  }
})
