// Гарантируем глобальный Buffer/alloc и др. методы в браузере
import { Buffer as BufferPolyfill } from 'buffer'
import process from 'process'

const g: any = globalThis as any

if (!g.Buffer || typeof g.Buffer.alloc !== 'function') {
  g.Buffer = BufferPolyfill
}

// если нужен process.env и т.п. (безопасно оставить)
if (!g.process) {
  g.process = process
}
