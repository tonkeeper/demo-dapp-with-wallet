import { Buffer } from 'buffer'

// Explicitly set global Buffer - vite-plugin-node-polyfills doesn't always do this in production
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer
}

if (typeof window !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = Buffer
}
