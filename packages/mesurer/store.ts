import type { DistanceOverlay, Guide, InspectMeasurement, Measurement, Point, Rect, ToolMode } from "./types"

export type MesurerState = {
  // toggles
  enabled: boolean
  altPressed: boolean
  toolMode: ToolMode
  guideOrientation: "vertical" | "horizontal"

  // drag
  start: Point | null
  end: Point | null
  isDragging: boolean

  // measurements
  activeMeasurement: Measurement | null
  measurements: Measurement[]
  selectedMeasurement: InspectMeasurement | null
  selectedMeasurements: InspectMeasurement[]
  hoverRect: Rect | null
  heldDistances: DistanceOverlay[]

  // guides
  guides: Guide[]
  draggingGuideId: string | null
  selectedGuideIds: string[]

  // local/transient
  selectionOriginRect: Rect | null
  hoverPointer: Point | null
  hoverElement: HTMLElement | null
  selectedElement: HTMLElement | null
  guidePreview: { orientation: "vertical" | "horizontal"; position: number } | null
  toolbarActive: boolean
}

export type StateUpdater<T> = T | ((prev: T) => T)

function resolve<T>(updater: StateUpdater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater
}

export class Store {
  state: MesurerState
  private listeners: Set<() => void> = new Set()

  // DOM refs (not part of reactive state)
  overlayEl: HTMLDivElement | null = null
  toolbarEl: HTMLDivElement | null = null
  selectedElementRef: HTMLElement | null = null
  hoverElementRef: HTMLElement | null = null
  selectionRectRef: Rect | null = null

  constructor(initial?: Partial<MesurerState>) {
    this.state = {
      enabled: true,
      altPressed: false,
      toolMode: "none",
      guideOrientation: "vertical",
      start: null,
      end: null,
      isDragging: false,
      activeMeasurement: null,
      measurements: [],
      selectedMeasurement: null,
      selectedMeasurements: [],
      hoverRect: null,
      heldDistances: [],
      guides: [],
      draggingGuideId: null,
      selectedGuideIds: [],
      selectionOriginRect: null,
      hoverPointer: null,
      hoverElement: null,
      selectedElement: null,
      guidePreview: null,
      toolbarActive: true,
      ...initial,
    }
  }

  set<K extends keyof MesurerState>(key: K, updater: StateUpdater<MesurerState[K]>) {
    const prev = this.state[key]
    const next = resolve(updater, prev)
    if (next === prev) return
    this.state[key] = next
    this.notify()
  }

  // Batch multiple updates without triggering listeners in between
  batch(fn: () => void) {
    const saved = this.listeners
    this.listeners = new Set()
    fn()
    this.listeners = saved
    this.notify()
  }

  setSelectedElement(element: HTMLElement | null) {
    this.selectedElementRef = element
    this.set("selectedElement", element)
  }

  setHoverElement(element: HTMLElement | null) {
    this.hoverElementRef = element
    this.set("hoverElement", element)
  }

  clearSelectionRect() {
    this.selectionRectRef = null
    this.set("selectionOriginRect", null)
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }
}
