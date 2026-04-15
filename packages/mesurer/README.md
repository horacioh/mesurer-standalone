<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://mesurer.ibelick.com/logo-dark.svg">
  <img src="https://mesurer.ibelick.com/logo.svg" alt="Mesurer" width="200">
</picture>

<br>

[![npm version](https://img.shields.io/npm/v/mesurer)](https://www.npmjs.com/package/mesurer)
[![downloads](https://img.shields.io/npm/dm/mesurer)](https://www.npmjs.com/package/mesurer)
[![CI](https://github.com/ibelick/mesurer/actions/workflows/ci.yml/badge.svg)](https://github.com/ibelick/mesurer/actions/workflows/ci.yml)

**[Mesurer](https://mesurer.ibelick.com)** is a lightweight measurement and alignment overlay for any web app. Framework-agnostic — works with React, Vue, Svelte, Solid, plain HTML, or anything that runs in a browser.

[Full documentation](https://mesurer.ibelick.com/)

## Install

```bash
npm install mesurer
```

## Usage

```js
import { createMesurer } from "mesurer"

const mesurer = createMesurer()
```

That's it. No framework adapter needed, no CSS import required.

### Options

```js
const mesurer = createMesurer({
  highlightColor: "oklch(0.62 0.18 255)",
  guideColor: "oklch(0.63 0.26 29.23)",
  persistOnReload: false,
})
```

### Instance methods

```js
mesurer.enable()   // Turn on
mesurer.disable()  // Turn off
mesurer.toggle()   // Toggle on/off
mesurer.destroy()  // Remove from DOM and clean up all listeners
```

## Framework examples

### React

```jsx
import { useEffect } from "react"
import { createMesurer } from "mesurer"

function App() {
  useEffect(() => {
    const mesurer = createMesurer()
    return () => mesurer.destroy()
  }, [])

  return <YourApp />
}
```

### Vue

```js
// main.ts
import { createMesurer } from "mesurer"
createMesurer()
```

### Svelte

```js
// main.ts
import { createMesurer } from "mesurer"
createMesurer()
```

### Solid

```js
// main.tsx
import { createMesurer } from "mesurer"
createMesurer()
```

### Plain HTML

```html
<script type="module">
  import { createMesurer } from "mesurer"
  createMesurer()
</script>
```

## Props

| Prop | Description |
| --- | --- |
| `highlightColor` | Base color for selection/hover overlays (defaults to `oklch(0.62 0.18 255)`). |
| `guideColor` | Base color for guides (defaults to `oklch(0.63 0.26 29.23)`). |
| `hoverHighlightEnabled` | Disables hover highlight and deselects on click when `false`. |
| `persistOnReload` | Persists state in `localStorage` as `mesurer-state` when `true`. |

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `M` | Toggle measurer on/off. |
| `S` | Toggle Select mode. |
| `G` | Toggle Guides mode. |
| `H` | Set guide orientation to horizontal. |
| `V` | Set guide orientation to vertical. |
| `Alt` | Temporarily enable option/guide measurement overlays. |
| `Esc` | Clear all measurements and guides. |
| `Backspace` / `Delete` | Remove selected guides. |
| `Cmd/Ctrl + Z` | Undo. |
| `Cmd/Ctrl + Shift + Z` | Redo. |

## Features

- **Framework-agnostic** — works in any web app, no adapter needed
- **Zero config** — styles are auto-injected, no CSS import required
- **Toggle on/off** — enable the overlay with a single shortcut
- **Select mode** — click elements to measure their bounds
- **Guides mode** — add vertical or horizontal guides
- **Distance overlays** — hold Alt for quick spacing checks
- **Undo/redo** — command history for guide and measurement changes
- **Persist state** — keep guides and measurements on reload

## Development

```bash
pnpm install
pnpm build:pkg
pnpm test
pnpm lint
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License

Licensed under the [MIT License](./LICENSE).
