# Contributing to Mesurer

Thanks for your interest in contributing! Here's how to get started.

## Setup

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Build the core package: `pnpm build:pkg`

## Development

```bash
# Start dev server for a specific app
pnpm --filter mesurer-html dev
pnpm --filter mesurer-vue dev
pnpm --filter mesurer-svelte dev
pnpm --filter mesurer-solid dev
pnpm --filter mesurer-site dev

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

## Project Structure

```
├── packages/mesurer/    # Core library (framework-agnostic)
├── apps/
│   ├── site/            # React demo site
│   ├── html/            # Plain HTML demo
│   ├── vue/             # Vue 3 demo
│   ├── svelte/          # Svelte 5 demo
│   └── solid/           # SolidJS demo
```

## Pull Requests

- Create a feature branch from `main`
- Keep changes focused — one feature or fix per PR
- Add tests for new functionality
- Run `pnpm lint` and `pnpm test` before submitting
- Write a clear PR description

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Run `pnpm lint:fix` to auto-fix issues.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
