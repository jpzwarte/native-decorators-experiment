# Native Decorators Experiment

Exploring how well the [TC39 standard decorators proposal](https://github.com/tc39/proposal-decorators) is supported across the modern TypeScript/Vite/Rolldown toolchain — specifically with [Lit](https://lit.dev) web components.

## Stack

| Tool | Version | Role |
|------|---------|------|
| TypeScript | 6 | Types + decorator syntax (no `experimentalDecorators`) |
| Lit | 3 | Web component base class |
| tsdown | 0.21 | Library bundler (powered by rolldown/oxc) |
| Vite | 8 | Dev server / Storybook bundler (powered by oxc) |
| Storybook | 10 | Component development environment |

## The component

`src/my-counter.ts` covers three decorator patterns:

```ts
// 1. Class decorator
@customElement('my-counter')
export class MyCounter extends LitElement {

  // 2. Field decorators with the accessor keyword (TC39 auto-accessors)
  @property({ type: String }) accessor label = 'Counter'
  @state() accessor count = 0

  // 3. Custom decorator on a true JS private method (#-syntax)
  @logged
  #step(delta: number): number {
    this.count += delta
    return this.count
  }
}
```

The `@logged` decorator logs every call to `#step` — including the private name — demonstrating that `context.name` exposes `"#step"` (hash included) for private methods.

## Key findings

### oxc does not lower TC39 decorators (yet)

Both **tsdown** (rolldown/oxc) and **Vite 8** (oxc) currently pass TC39 decorator syntax through as-is rather than transforming it. Without the Babel workaround, the output is native decorator syntax that Chrome does not yet support by default:

```js
// tsdown output without Babel — valid syntax, but requires native decorator support
var MyCounter = @customElement("my-counter") class extends LitElement {
  @property({ type: String }) accessor label = "Counter"
  @state() accessor count = 0
  @logged #step(delta) { ... }
}
export { MyCounter }
```

### Babel workaround

The [Vite 8 migration guide](https://main.vite.dev/guide/migration#javascript-transforms-by-oxc) documents a workaround using `@rolldown/plugin-babel`. Because tsdown also uses rolldown, the exact same plugin works in both places.

**Install:**
```sh
npm install -D @rolldown/plugin-babel @babel/plugin-proposal-decorators
```

**`tsdown.config.ts`:**
```ts
import { defineConfig } from 'tsdown'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  plugins: [
    babel({
      presets: [
        {
          preset: () => ({
            plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
          }),
          rolldown: { filter: { code: '@' } },
        },
      ],
    }),
  ],
})
```

**`vite.config.ts`** (identical plugin, same structure):
```ts
import { defineConfig } from 'vite'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    babel({
      presets: [
        {
          preset: () => ({
            plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
          }),
          rolldown: { filter: { code: '@' } },
        },
      ],
    }),
  ],
})
```

The `rolldown.filter: { code: '@' }` restricts Babel to files that contain a `@` character, avoiding unnecessary work on the rest of the bundle.

### Babel output size trade-off

With Babel transforming the decorators, the bundle grows significantly because a full decorator runtime is inlined:

| Build | Size |
|-------|------|
| Without Babel (native passthrough) | 1.67 kB |
| With Babel (`version: '2023-11'`) | 7.29 kB |

The Lit team [notes the same trade-off](https://lit.dev/docs/components/decorators/) and currently recommends `experimentalDecorators` for production until native support lands.

### Private method decorator: `@logged #step`

The Babel transform fully supports decorating private `#`-methods. One difference from the native path: Babel strips the `#` prefix from `context.name`, so the logged name is `"step"` rather than `"#step"`. The native oxc passthrough preserves `"#step"`.

## Usage

```sh
# Install dependencies
npm install

# Build with tsdown (outputs to dist/)
npm run build

# Start Storybook dev server
npm run storybook
```

## tsconfig

No `experimentalDecorators` — the project uses standard TC39 decorators throughout:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```
