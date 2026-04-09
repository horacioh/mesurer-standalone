<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://mesurer.ibelick.com/logo-dark.svg">
  <img src="https://mesurer.ibelick.com/logo.svg" alt="Mesurer" width="200">
</picture>

<br>

[![npm version](https://img.shields.io/npm/v/mesurer)](https://www.npmjs.com/package/mesurer)
[![downloads](https://img.shields.io/npm/dm/mesurer)](https://www.npmjs.com/package/mesurer)

**[Mesurer](https://mesurer.ibelick.com)** is a lightweight measurement and alignment overlay for React apps. Toggle it on, select elements, and measure distances directly in the browser.

[Full documentation](https://mesurer.ibelick.com/)

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

No additional CSS import is required.

## Features

- **Toggle on/off** – Enable the overlay with a single shortcut
- **Select mode** – Click elements to measure their bounds
- **Guides mode** – Add vertical or horizontal guides
- **Distance overlays** – Hold Alt for quick spacing checks
- **Undo/redo** – Command history for guide and measurement changes
- **Persist state** – Keep guides and measurements on reload

## Requirements

- React 18+

## License

Licensed under the MIT License.
