# Changelog

## 0.1.0 (Unreleased)

### Breaking Changes

- Removed React dependency — mesurer is now framework-agnostic
- Replaced `<Measurer />` React component with `createMesurer()` function API

### Added

- `createMesurer(options?)` — initialize mesurer in any web app
- `destroy()`, `enable()`, `disable()`, `toggle()` instance methods
- Demo apps: plain HTML, Vue 3, Svelte 5, SolidJS
- Vitest test suite for core logic
- Biome linting and formatting
- GitHub Actions CI pipeline

### Removed

- React and ReactDOM peer dependencies
- All React hooks and components

## 0.0.3

- Update site OG, toolbar UI, readme

## 0.0.2

- Zero-config style injection

## 0.0.1

- Initial release
