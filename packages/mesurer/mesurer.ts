import { MEASURE_TRANSITION_MS } from "./constants"
import { computeDerived } from "./derived"
import { GuideDragHold } from "./guide-drag-hold"
import { History } from "./history"
import { setupHotkeys } from "./hotkeys"
import { setupLiveTracking } from "./live-tracking"
import { createPointerHandlers } from "./pointer-handler"
import { createOverlay } from "./render-overlay"
import { createToolbar } from "./render-toolbar"
import { setupResizeSync } from "./resize-sync"
import { Store } from "./store"
import { ensureMeasurerStyles } from "./style-inject"
import { MESURER_STYLES } from "./styles.generated"
import type { DistanceOverlay, Measurement, ToolMode } from "./types"

export type MesurerOptions = {
  highlightColor?: string
  guideColor?: string
  hoverHighlightEnabled?: boolean
  persistOnReload?: boolean
}

export type MesurerInstance = {
  destroy: () => void
  enable: () => void
  disable: () => void
  toggle: () => void
}

const stripMeasurement = (m: Measurement): Measurement => ({ ...m, elementRef: undefined })
const stripDistance = (d: DistanceOverlay): DistanceOverlay => ({
  ...d,
  elementRefA: undefined,
  elementRefB: undefined,
})

export function createMesurer(options: MesurerOptions = {}): MesurerInstance {
  const {
    highlightColor = "oklch(0.62 0.18 255)",
    guideColor = "oklch(0.63 0.26 29.23)",
    persistOnReload = false,
  } = options

  // Inject styles
  ensureMeasurerStyles(MESURER_STYLES)

  // Load persisted state
  let initialState: Partial<any> = {}
  if (persistOnReload) {
    try {
      const stored = window.localStorage.getItem("mesurer-state")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.version === 1) {
          initialState = {
            enabled: parsed.enabled,
            toolMode: parsed.toolMode as ToolMode,
            guideOrientation: parsed.guideOrientation,
            guides: parsed.guides ?? [],
            selectedGuideIds: parsed.selectedGuideIds ?? [],
            measurements: parsed.measurements ?? [],
            activeMeasurement: parsed.activeMeasurement ?? null,
            heldDistances: parsed.heldDistances ?? [],
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  const store = new Store(initialState)
  const history = new History(store)
  const guideDragHold = new GuideDragHold()

  // Create root container
  const root = document.createElement("div")
  root.className = "pointer-events-none fixed inset-0 z-50"
  root.style.position = "fixed"
  root.style.inset = "0"
  root.style.zIndex = "50"
  root.style.pointerEvents = "none"

  // Current derived state (for pointer handler access)
  let currentDerived = computeDerived(store, highlightColor, guideColor)

  // Create overlay and toolbar
  const overlay = createOverlay(store, history, guideDragHold)
  const toolbar = createToolbar(store, history)
  store.overlayEl = overlay.element as HTMLDivElement
  store.toolbarEl = toolbar

  root.appendChild(overlay.element)
  root.appendChild(toolbar)
  document.body.appendChild(root)

  // Pointer handlers
  const pointerHandlers = createPointerHandlers(store, history, guideDragHold, () => currentDerived.optionPairOverlay)
  overlay.element.addEventListener("pointerdown", pointerHandlers.handlePointerDown)
  overlay.element.addEventListener("pointermove", pointerHandlers.handlePointerMove)
  overlay.element.addEventListener("pointerup", pointerHandlers.handlePointerUp)
  overlay.element.addEventListener("pointerleave", pointerHandlers.handlePointerLeave)

  // clearAll and removeSelectedGuides for hotkeys
  function clearAll() {
    history.recordSnapshot()
    guideDragHold.clear()
    store.batch(() => {
      store.set("start", null)
      store.set("end", null)
      store.set("isDragging", false)
      store.set("activeMeasurement", null)
      store.set("measurements", [])
      store.set("selectedMeasurement", null)
      store.set("selectedMeasurements", [])
      store.clearSelectionRect()
      store.setSelectedElement(null)
      store.set("hoverRect", null)
      store.setHoverElement(null)
      store.set("guides", [])
      store.set("selectedGuideIds", [])
      store.set("heldDistances", [])
    })
  }

  function removeSelectedGuides(): boolean {
    if (store.state.selectedGuideIds.length === 0) return false
    history.recordSnapshot()
    const ids = store.state.selectedGuideIds
    store.set("guides", (prev) => prev.filter((g) => !ids.includes(g.id)))
    store.set("selectedGuideIds", [])
    return true
  }

  // Event systems
  const cleanupHotkeys = setupHotkeys(store, history, clearAll, removeSelectedGuides)
  const cleanupResize = setupResizeSync(store)
  const cleanupLiveTracking = setupLiveTracking(store)

  // Selection animation cleanup
  let selectionAnimationTimeout: number | null = null

  // Toolbar hide on outside click
  const handleToolbarHide = (event: PointerEvent) => {
    if (!store.state.toolbarActive || store.state.toolMode !== "none") return
    if (toolbar.contains(event.target as Node)) return
    store.set("toolbarActive", false)
  }
  window.addEventListener("pointerdown", handleToolbarHide)

  // Render on state change
  const unsubRender = store.subscribe(() => {
    currentDerived = computeDerived(store, highlightColor, guideColor)
    overlay.update(currentDerived)

    // Selection animation cleanup (port of the useEffect)
    const s = store.state
    const hasSelectionAnimationState =
      !!s.selectionOriginRect ||
      !!s.selectedMeasurement?.originRect ||
      s.selectedMeasurements.some((m) => !!m.originRect)

    if (!hasSelectionAnimationState) {
      if (selectionAnimationTimeout !== null) {
        window.clearTimeout(selectionAnimationTimeout)
        selectionAnimationTimeout = null
      }
      return
    }

    if (selectionAnimationTimeout !== null) return

    selectionAnimationTimeout = window.setTimeout(() => {
      selectionAnimationTimeout = null
      if (store.state.selectionOriginRect) store.set("selectionOriginRect", null)
      store.set("selectedMeasurement", (prev) => {
        if (!prev?.originRect) return prev
        const { originRect: _, ...next } = prev
        return next
      })
      store.set("selectedMeasurements", (prev) => {
        let changed = false
        const next = prev.map((m) => {
          if (!m.originRect) return m
          changed = true
          const { originRect: _, ...rest } = m
          return rest
        })
        return changed ? next : prev
      })
    }, MEASURE_TRANSITION_MS)

    // Persist
    if (persistOnReload) {
      try {
        window.localStorage.setItem(
          "mesurer-state",
          JSON.stringify({
            version: 1,
            enabled: s.enabled,
            toolMode: s.toolMode,
            guideOrientation: s.guideOrientation,
            guides: s.guides,
            selectedGuideIds: s.selectedGuideIds,
            measurements: s.measurements.map(stripMeasurement),
            activeMeasurement: s.activeMeasurement ? stripMeasurement(s.activeMeasurement) : null,
            heldDistances: s.heldDistances.map(stripDistance),
          }),
        )
      } catch {
        /* ignore */
      }
    }
  })

  // Initial render
  currentDerived = computeDerived(store, highlightColor, guideColor)
  overlay.update(currentDerived)

  return {
    destroy() {
      unsubRender()
      cleanupHotkeys()
      cleanupResize()
      cleanupLiveTracking()
      pointerHandlers.destroy()
      history.destroy()
      window.removeEventListener("pointerdown", handleToolbarHide)
      if (selectionAnimationTimeout !== null) window.clearTimeout(selectionAnimationTimeout)
      ;(toolbar as any).__mesurer_cleanup?.()
      root.remove()
    },
    enable() {
      store.set("enabled", true)
    },
    disable() {
      store.set("enabled", false)
    },
    toggle() {
      store.set("enabled", (prev) => !prev)
    },
  }
}
