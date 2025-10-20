import { Buffer as BufferPolyfill } from 'buffer'
import process from 'process'

const g: any = globalThis as any

if (!g.Buffer || typeof g.Buffer.alloc !== 'function') {
  g.Buffer = BufferPolyfill
}

if (!g.process) {
  g.process = process
}
