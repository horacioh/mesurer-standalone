<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./logo.svg">
  <img src="./logo.svg" alt="Mesurer" width="200">
</picture>

<br>

[![npm version](https://img.shields.io/npm/v/mesurer)](https://www.npmjs.com/package/mesurer)
[![downloads](https://img.shields.io/npm/dm/mesurer)](https://www.npmjs.com/package/mesurer)

**[Mesurer](https://github.com/ibelick/mesurer)** is a lightweight measurement and alignment overlay for React apps. Toggle it on, select elements, and measure distances directly in the browser.

[Documentation and demo](https://mesurer.ibelick.com/)

## Install

```bash
npm install mesurer
```

## Usage

```tsx
import { Measurer } from "mesurer";

function App() {
  return (
    <>
      <YourApp />
      <Measurer />
    </>
  );
}
```

## Features

- **Toggle on/off** – Enable the overlay with a single shortcut
- **Select mode** – Click elements to measure their bounds
- **Guides mode** – Add vertical or horizontal guides
- **Distance overlays** – Hold Alt for quick spacing checks
- **Undo/redo** – Command history for guide and measurement changes
- **Persist state** – Keep guides and measurements on reload

## Requirements

- React 18+
- Tailwind CSS v4 with package content included

## License

Licensed under the MIT License.
