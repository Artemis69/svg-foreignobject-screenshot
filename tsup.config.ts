import type { Options } from 'tsup'

export const tsup: Options = {
  sourcemap: false,
  clean: true,
  entryPoints: ['src/index.ts'],
  target: 'node14',
  format: ['esm'],
  dts: true,
}
