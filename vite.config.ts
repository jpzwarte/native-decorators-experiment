import { defineConfig } from 'vite'
import babel from '@rolldown/plugin-babel'

// OXC (used by Vite 8) doesn't support lowering native TC39 decorators yet.
// Workaround: https://main.vite.dev/guide/migration#javascript-transforms-by-oxc
// The `rolldown` key must be nested inside the preset object — not at babel() top level.
export default defineConfig({
  plugins: [
    babel({
      presets: [
        {
          preset: () => ({
            plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
          }),
          rolldown: {
            filter: { code: '@' },
          },
        },
      ],
    }),
  ],
})
