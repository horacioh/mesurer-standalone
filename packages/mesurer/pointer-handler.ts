import { getInspectMeasurement } from "./dom"
import { getRectFromPoints } from "./geometry"
import type { GuideDragHold } from "./guide-drag-hold"
import { getSnapGuidePosition } from "./guides"
import type { History } from "./history"
import { getElementsInRectCached, getSnappedClickTarget, getTargetElement } from "./selection"
import { getSelectedMeasurementHit } from "./selection-helpers"
import type { Store } from "./store"
import type { Point, Rect } from "./types"
import { createId } from "./utils"

export type PointerHandlers = {
  handlePointerDown: (event: PointerEvent) => void
  handlePointerMove: (event: PointerEvent) => void
  handlePointerUp: (event: PointerEvent) => void
  handlePointerLeave: () => void
  destroy: () => void
}

export function createPointerHandlers(
  store: Store,
  history: History,
  guideDragHold: GuideDragHold,
  getOptionPairOverlay: () => any,
): PointerHandlers {
  let hoverFrame: number | null = null
  let hoverPoint: Point | null = null
  const selectionCache = {
    key: "",
    entries: [] as Array<{ element: HTMLElement; rect: Rect }>,
    overlayNode: null as HTMLDivElement | null,
    frame: -1,
  }
  let shiftDrag = false
  let shiftToggleElement: HTMLElement | null = null

  function updateHoverTarget(point: Point) {
    const target = getTargetElement(point, store.overlayEl)
    if (target) {
      const rect = target.getBoundingClientRect()
      store.set("hoverRect", { left: rect.left, top: rect.top, width: rect.width, height: rect.height })
      store.setHoverElement(target)
    } else {
      store.set("hoverRect", null)
      store.setHoverElement(null)
    }
  }

  function handlePointerDown(event: PointerEvent) {
    const commit = history.createActionCommit()
    if (store.toolbarEl && store.toolbarEl.contains(event.target as Node)) return
    if (!store.state.enabled || event.button !== 0) return
    if (store.state.toolMode === "none") return

    store.clearSelectionRect()
    const point = { x: event.clientX, y: event.clientY }
    shiftDrag = event.shiftKey
    shiftToggleElement = event.shiftKey
      ? (getSelectedMeasurementHit({
          point,
          selectedMeasurements: store.state.selectedMeasurements,
          overlayNode: store.overlayEl,
        })?.elementRef ?? null)
      : null
    selectionCache.key = ""

    const s = store.state
    if (s.altPressed && getOptionPairOverlay()) {
      commit()
      store.set("heldDistances", (prev) => [...prev, { ...getOptionPairOverlay(), id: createId() }])
      return
    }

    if (s.toolMode === "guides") {
      commit()
      const position = getSnapGuidePosition({
        orientation: s.guideOrientation,
        point,
        snapGuidesEnabled: true,
        overlayNode: store.overlayEl,
        guides: s.guides,
        draggingGuideId: s.draggingGuideId,
      })
      const id = createId()
      store.set("selectedGuideIds", [])
      store.set("guides", (prev) => [...prev, { id, orientation: s.guideOrientation, position }])
      store.set("selectedGuideIds", [id])
      guideDragHold.schedule(id, store)
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
      return
    }

    if (s.selectedGuideIds.length > 0) {
      commit()
      store.set("selectedGuideIds", [])
    }

    store.set("start", point)
    store.set("end", point)
    store.set("isDragging", false)
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent) {
    if (store.toolbarEl && store.toolbarEl.contains(event.target as Node)) return
    if (!store.state.enabled) return

    const s = store.state
    if (s.toolMode === "none") {
      store.set("hoverRect", null)
      store.setHoverElement(null)
      store.set("hoverPointer", null)
      store.set("guidePreview", null)
      return
    }

    const point = { x: event.clientX, y: event.clientY }
    if (event.altKey !== s.altPressed) {
      store.set("altPressed", event.altKey)
    }

    hoverPoint = point
    if (!hoverFrame) {
      hoverFrame = requestAnimationFrame(() => {
        const latest = hoverPoint
        if (latest && !store.state.draggingGuideId) {
          updateHoverTarget(latest)
        }
        if (latest && store.state.guides.length > 0) {
          store.set("hoverPointer", latest)
        } else {
          store.set("hoverPointer", null)
        }

        if (store.state.toolMode === "guides" && latest && !store.state.draggingGuideId) {
          const position = getSnapGuidePosition({
            orientation: store.state.guideOrientation,
            point: latest,
            snapGuidesEnabled: true,
            overlayNode: store.overlayEl,
            guides: store.state.guides,
            draggingGuideId: store.state.draggingGuideId,
          })
          store.set("guidePreview", { orientation: store.state.guideOrientation, position })
        } else {
          store.set("guidePreview", null)
        }
        hoverFrame = null
      })
    }

    if (s.draggingGuideId) {
      store.set("guides", (prev) =>
        prev.map((guide) =>
          guide.id === s.draggingGuideId
            ? {
                ...guide,
                position: getSnapGuidePosition({
                  orientation: guide.orientation,
                  point,
                  snapGuidesEnabled: true,
                  overlayNode: store.overlayEl,
                  guides: store.state.guides,
                  draggingGuideId: store.state.draggingGuideId,
                }),
              }
            : guide,
        ),
      )
    }

    if (!s.start) return
    store.set("end", point)

    if (!s.isDragging) {
      const dx = Math.abs(point.x - s.start.x)
      const dy = Math.abs(point.y - s.start.y)
      const threshold = shiftDrag ? 12 : 4
      if (dx > threshold || dy > threshold) {
        store.set("isDragging", true)
      }
    }
  }

  function handlePointerUp(event: PointerEvent) {
    const commit = history.createActionCommit()
    if (store.toolbarEl && store.toolbarEl.contains(event.target as Node)) return
    if (!store.state.enabled) return

    guideDragHold.clear()
    const s = store.state
    if (s.toolMode === "none") {
      store.set("start", null)
      store.set("end", null)
      store.set("isDragging", false)
      return
    }

    const point = { x: event.clientX, y: event.clientY }
    const resetDragState = () => {
      store.set("start", null)
      store.set("end", null)
      store.set("isDragging", false)
      shiftDrag = false
      shiftToggleElement = null
    }
    const clearTransientMeasurements = () => {
      store.set("activeMeasurement", null)
      store.set("measurements", [])
    }

    if ((event.currentTarget as HTMLElement).hasPointerCapture?.(event.pointerId)) {
      ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
    }

    if (s.draggingGuideId) store.set("draggingGuideId", null)

    if (!s.start || !s.end) {
      resetDragState()
      return
    }

    const dragDx = Math.abs(point.x - s.start.x)
    const dragDy = Math.abs(point.y - s.start.y)
    const isShiftClick = event.shiftKey && dragDx <= 12 && dragDy <= 12

    if (s.isDragging && !isShiftClick) {
      const selectionRect = getRectFromPoints(s.start, point)
      store.selectionRectRef = selectionRect
      store.set("selectionOriginRect", selectionRect)
      const elements = getElementsInRectCached(selectionRect, store.overlayEl, selectionCache)
      const hasSameSelection =
        elements.length === s.selectedMeasurements.length &&
        elements.every((el, i) => s.selectedMeasurements[i]?.elementRef === el)
      const lastElement = elements[elements.length - 1] ?? null
      const lastChanged = (s.selectedMeasurement?.elementRef ?? null) !== lastElement

      if (elements.length > 0) {
        if (!hasSameSelection) {
          commit()
          const nextMeasurements = elements.map((el) => ({ ...getInspectMeasurement(el), originRect: selectionRect }))
          store.set("selectedMeasurements", nextMeasurements)
          store.setSelectedElement(lastElement)
          store.set("selectedMeasurement", nextMeasurements[nextMeasurements.length - 1])
        } else if (lastChanged) {
          commit()
          store.setSelectedElement(lastElement)
          const lastM = s.selectedMeasurements.find((m) => m.elementRef === lastElement)
          if (lastM) store.set("selectedMeasurement", lastM)
        }
      } else if (s.selectedMeasurements.length > 0 || s.selectedMeasurement) {
        commit()
        store.setSelectedElement(null)
        store.set("selectedMeasurement", null)
        store.set("selectedMeasurements", [])
        store.clearSelectionRect()
      }
      clearTransientMeasurements()
      resetDragState()
      return
    }

    const selectedHit = shiftToggleElement
      ? (s.selectedMeasurements.find((m) => m.elementRef === shiftToggleElement) ?? null)
      : getSelectedMeasurementHit({ point, selectedMeasurements: s.selectedMeasurements, overlayNode: store.overlayEl })

    if (event.shiftKey && selectedHit) {
      commit()
      const nextSelected = s.selectedMeasurements.filter((m) => m.elementRef !== selectedHit.elementRef)
      store.set("selectedMeasurements", nextSelected)
      store.clearSelectionRect()
      const nextPrimary = nextSelected.length > 0 ? nextSelected[nextSelected.length - 1] : null
      store.setSelectedElement(nextPrimary?.elementRef ?? null)
      store.set("selectedMeasurement", nextPrimary)
      clearTransientMeasurements()
      resetDragState()
      return
    }

    const target = event.shiftKey
      ? (getTargetElement(point, store.overlayEl) ?? getSnappedClickTarget(point, store.overlayEl, true))
      : getSnappedClickTarget(point, store.overlayEl, true)

    if (target) {
      const inspectMeasurement = getInspectMeasurement(target)
      clearTransientMeasurements()

      if (event.shiftKey) {
        const alreadySelected = s.selectedMeasurements.some((m) => m.elementRef === target)
        if (alreadySelected) {
          commit()
          const nextSelected = s.selectedMeasurements.filter((m) => m.elementRef !== target)
          store.set("selectedMeasurements", nextSelected)
          store.clearSelectionRect()
          const nextPrimary = nextSelected.length > 0 ? nextSelected[nextSelected.length - 1] : null
          store.setSelectedElement(nextPrimary?.elementRef ?? null)
          store.set("selectedMeasurement", nextPrimary)
        } else {
          commit()
          store.set("selectedMeasurements", (prev) => [...prev, inspectMeasurement])
          store.setSelectedElement(target)
          store.set("selectedMeasurement", inspectMeasurement)
          store.clearSelectionRect()
        }
        clearTransientMeasurements()
        resetDragState()
        return
      }

      store.setSelectedElement(target)
      commit()
      store.set("selectedMeasurements", [inspectMeasurement])
      store.set("selectedMeasurement", inspectMeasurement)
      store.clearSelectionRect()
    } else {
      if (event.shiftKey) {
        clearTransientMeasurements()
        resetDragState()
        return
      }
      commit()
      store.setSelectedElement(null)
      store.set("selectedMeasurement", null)
      store.set("selectedMeasurements", [])
      store.clearSelectionRect()
    }
    resetDragState()
  }

  function handlePointerLeave() {
    guideDragHold.clear()
    store.set("start", null)
    store.set("end", null)
    store.set("isDragging", false)
    store.set("draggingGuideId", null)
    store.set("guidePreview", null)
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    destroy: () => {
      if (hoverFrame) cancelAnimationFrame(hoverFrame)
    },
  }
}
