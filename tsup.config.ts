import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/names.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
});
