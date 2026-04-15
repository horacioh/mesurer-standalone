<template>
  <main class="min-h-screen px-5 py-20">
    <div class="mx-auto flex max-w-2xl flex-col gap-14">

      <!-- Header -->
      <div class="flex flex-col gap-4">
        <img
          src="/logo.webp"
          alt="Mesurer"
          class="h-9 w-9"
          width="36"
          height="36"
          loading="eager"
        />
        <div class="flex items-end gap-2">
          <h1 class="font-medium leading-tight text-strong">Mesurer</h1>
          <a
            href="https://www.npmjs.com/package/mesurer"
            target="_blank"
            rel="noreferrer"
            class="text-sm text-muted transition-colors hover:text-strong"
          >
            v0.0.3
          </a>
          <a
            href="https://github.com/ibelick/mesurer"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            class="mb-0.5 inline-flex h-4 w-4 items-center justify-center text-muted transition-colors hover:text-strong"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.92c.85 0 1.7.12 2.5.36 1.9-1.33 2.74-1.05 2.74-1.05.55 1.43.2 2.49.1 2.75.64.72 1.02 1.63 1.02 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.95.68 1.93 0 1.4-.01 2.53-.01 2.88 0 .28.18.6.69.5A10.2 10.2 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
            </svg>
          </a>
        </div>
        <p class="max-w-xl leading-relaxed text-muted">
          Measure and align everything on localhost.
        </p>
      </div>

      <!-- Installation -->
      <div class="flex flex-col gap-4">
        <p class="font-[450] text-strong">Installation</p>
        <code class="rounded-[2px] bg-subtle font-mono text-[13px] text-strong w-full py-2 px-3">
          <span class="text-muted select-none">$ </span>npm install mesurer
        </code>
        <p>
          Then initialize it anywhere in your app:
        </p>
        <pre class="rounded-[2px] bg-subtle font-mono text-[13px] text-strong w-full py-2 px-3 whitespace-pre-wrap"><code class="font-mono text-[13px] text-strong w-full">import { createMesurer } from "mesurer"

// Initialize anywhere in your app
createMesurer()</code></pre>
      </div>

      <!-- Props -->
      <div class="flex flex-col gap-4">
        <p class="font-[450] text-strong">Props</p>
        <div class="flex flex-col border-t border-border -mx-2">
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">highlightColor</code>
            </div>
            <div class="max-w-[60%] text-right text-muted">
              Base color for selection/hover overlays (defaults to
              <code class="code">oklch(0.62 0.18 255)</code>)
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">guideColor</code>
            </div>
            <div class="max-w-[60%] text-right text-muted">
              Base color for guides (defaults to
              <code class="code">oklch(0.63 0.26 29.23)</code>)
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">hoverHighlightEnabled</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Disables hover highlight and deselects on click
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">persistOnReload</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Persists state in <code class="code">localStorage</code> as
              <code class="code">mesurer-state</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Commands -->
      <div class="flex flex-col gap-4">
        <p class="font-[450] text-strong">Commands</p>
        <div class="flex flex-col border-t border-border -mx-2">
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">M</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Toggle measurer on/off
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">S</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Toggle Select mode
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">G</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Toggle Guides mode
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">H</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Set guide orientation to horizontal
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">V</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Set guide orientation to vertical
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">Alt</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Temporarily enable option/guide measurement overlays
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">Esc</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Clear all measurements and guides
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">Backspace</code> /
              <code class="code">Delete</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Remove selected guides
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">Cmd/Ctrl + Z</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Undo
            </div>
          </div>
          <div class="flex items-start justify-between gap-8 border-b border-border px-2 py-2">
            <div class="font-mono text-strong">
              <code class="code">Cmd/Ctrl + Shift + Z</code>
            </div>
            <div class="max-w-[60%] text-right text-balance text-muted">
              Redo
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>
