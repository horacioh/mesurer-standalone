import type { StateUpdater, Store } from "./store"
import type { DistanceOverlay, Guide, InspectMeasurement, Measurement, ToolMode } from "./types"

type MesurerSnapshot = {
  enabled: boolean
  toolMode: ToolMode
  guideOrientation: "vertical" | "horizontal"
  measurements: Measurement[]
  activeMeasurement: Measurement | null
  selectedMeasurements: InspectMeasurement[]
  selectedMeasurement: InspectMeasurement | null
  heldDistances: DistanceOverlay[]
  guides: Guide[]
  selectedGuideIds: string[]
  draggingGuideId: string | null
}

const HISTORY_LIMIT = 50

const serializeRect = (rect: { left: number; top: number; width: number; height: number }) =>
  `${Math.round(rect.left)}:${Math.round(rect.top)}:${Math.round(rect.width)}:${Math.round(rect.height)}`

function getSnapshotSignature(snapshot: MesurerSnapshot): string {
  return [
    snapshot.enabled ? "1" : "0",
    snapshot.toolMode,
    snapshot.guideOrientation,
    snapshot.measurements.map((m) => `${m.id}@${serializeRect(m.rect)}`).join(","),
    snapshot.activeMeasurement
      ? `${snapshot.activeMeasurement.id}@${serializeRect(snapshot.activeMeasurement.rect)}`
      : "",
    snapshot.selectedMeasurements.map((m) => `${m.id}@${serializeRect(m.rect)}`).join(","),
    snapshot.selectedMeasurement
      ? `${snapshot.selectedMeasurement.id}@${serializeRect(snapshot.selectedMeasurement.rect)}`
      : "",
    snapshot.heldDistances.map((d) => d.id).join(","),
    snapshot.guides.map((g) => `${g.id}:${g.position}`).join(","),
    snapshot.selectedGuideIds.join(","),
    snapshot.draggingGuideId ?? "",
  ].join("|")
}

export class History {
  private store: Store
  private past: MesurerSnapshot[] = []
  private future: MesurerSnapshot[] = []
  private lastSignature: string | null = null
  private cleanup: (() => void) | null = null

  constructor(store: Store) {
    this.store = store
    this.setup()
  }

  private captureSnapshot(): MesurerSnapshot {
    const s = this.store.state
    return {
      enabled: s.enabled,
      toolMode: s.toolMode,
      guideOrientation: s.guideOrientation,
      measurements: [...s.measurements],
      activeMeasurement: s.activeMeasurement,
      selectedMeasurements: [...s.selectedMeasurements],
      selectedMeasurement: s.selectedMeasurement,
      heldDistances: [...s.heldDistances],
      guides: [...s.guides],
      selectedGuideIds: [...s.selectedGuideIds],
      draggingGuideId: s.draggingGuideId,
    }
  }

  private restoreSnapshot(snapshot: MesurerSnapshot) {
    this.store.batch(() => {
      this.store.set("enabled", snapshot.enabled)
      this.store.set("toolMode", snapshot.toolMode)
      this.store.set("guideOrientation", snapshot.guideOrientation)
      this.store.set("measurements", snapshot.measurements)
      this.store.set("activeMeasurement", snapshot.activeMeasurement)
      this.store.set("selectedMeasurements", snapshot.selectedMeasurements)
      this.store.set("selectedMeasurement", snapshot.selectedMeasurement)
      this.store.set("heldDistances", snapshot.heldDistances)
      this.store.set("guides", snapshot.guides)
      this.store.set("selectedGuideIds", snapshot.selectedGuideIds)
      this.store.set("draggingGuideId", snapshot.draggingGuideId)
      this.store.set("start", null)
      this.store.set("end", null)
      this.store.set("isDragging", false)
      this.store.set("guidePreview", null)
      this.store.set("hoverRect", null)
      this.store.setHoverElement(null)
      this.store.clearSelectionRect()

      const nextSelectedElement =
        snapshot.selectedMeasurement?.elementRef ??
        snapshot.selectedMeasurements[snapshot.selectedMeasurements.length - 1]?.elementRef ??
        null
      this.store.setSelectedElement(nextSelectedElement)
    })
  }

  recordSnapshot() {
    const snapshot = this.captureSnapshot()
    const signature = getSnapshotSignature(snapshot)
    if (this.lastSignature === signature) return
    this.past.push(snapshot)
    this.future = []
    this.lastSignature = signature
    if (this.past.length > HISTORY_LIMIT) this.past.shift()
  }

  undo() {
    const prev = this.past.pop()
    if (!prev) return
    const current = this.captureSnapshot()
    this.future.push(current)
    if (this.future.length > HISTORY_LIMIT) this.future.shift()
    this.lastSignature = null
    this.restoreSnapshot(prev)
  }

  redo() {
    const next = this.future.pop()
    if (!next) return
    this.past.push(this.captureSnapshot())
    if (this.past.length > HISTORY_LIMIT) this.past.shift()
    this.lastSignature = null
    this.restoreSnapshot(next)
  }

  createActionCommit(): () => void {
    let committed = false
    return () => {
      if (committed) return
      this.recordSnapshot()
      committed = true
    }
  }

  setWithHistory<K extends keyof { enabled: boolean; toolMode: ToolMode; guideOrientation: "vertical" | "horizontal" }>(
    key: K,
    updater: StateUpdater<any>,
  ) {
    const prev = this.store.state[key]
    const next = typeof updater === "function" ? updater(prev) : updater
    if (next === prev) return
    this.recordSnapshot()
    this.store.set(key, next)
  }

  private setup() {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() !== "z") return
      if (event.shiftKey) {
        if (this.future.length === 0) return
        event.preventDefault()
        this.redo()
        return
      }
      if (this.past.length === 0) return
      event.preventDefault()
      this.undo()
    }

    window.addEventListener("keydown", handleKeyDown)
    this.cleanup = () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }

  destroy() {
    this.cleanup?.()
  }
}
