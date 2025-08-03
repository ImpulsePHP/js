import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const basePlugins = [typescript({ tsconfig: './tsconfig.json' }), terser()];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/impulse.js',
      format: 'iife',
      name: 'Impulse',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: basePlugins,
  },
  {
    input: 'src/devtools/impulse.devtools.ts',
    output: {
      file: 'dist/impulse.devtools.js',
      format: 'iife',
      name: 'ImpulseDevTools',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: basePlugins,
  },
];
