import { defineConfig } from 'tsup'

export default defineConfig([{
  outDir: 'build',
  entry: ['src/index.ts'],
  platform: 'neutral',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true
}])
