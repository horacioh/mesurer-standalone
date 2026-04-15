import { getDistanceOverlay } from "./distances"
import { getInspectMeasurement, getRectFromDom } from "./dom"
import { normalizeRect, rectAlmostEqual } from "./geometry"
import type { Store } from "./store"

export function setupLiveTracking(store: Store): () => void {
  let frameId: number | null = null

  const tick = () => {
    if (!store.state.enabled) {
      frameId = requestAnimationFrame(tick)
      return
    }

    store.set("measurements", (prev) =>
      prev.map((measurement) => {
        if (!measurement.elementRef || !document.contains(measurement.elementRef)) return measurement
        const rect = getRectFromDom(measurement.elementRef)
        if (rectAlmostEqual(rect, measurement.rect)) return measurement
        return { ...measurement, rect, normalizedRect: normalizeRect(rect), originRect: undefined }
      }),
    )

    store.set("activeMeasurement", (prev) => {
      if (!prev?.elementRef || !document.contains(prev.elementRef)) return prev
      const rect = getRectFromDom(prev.elementRef)
      if (rectAlmostEqual(rect, prev.rect)) return prev
      return { ...prev, rect, normalizedRect: normalizeRect(rect), originRect: undefined }
    })

    store.set("heldDistances", (prev) =>
      prev.map((distance) => {
        const canTrackA = distance.elementRefA && document.contains(distance.elementRefA)
        const canTrackB = distance.elementRefB && document.contains(distance.elementRefB)
        if (!canTrackA && !canTrackB) return distance
        const rectA = canTrackA ? getRectFromDom(distance.elementRefA!) : distance.rectA
        const rectB = canTrackB ? getRectFromDom(distance.elementRefB!) : distance.rectB
        if (rectAlmostEqual(rectA, distance.rectA) && rectAlmostEqual(rectB, distance.rectB)) return distance
        const updated = getDistanceOverlay(rectA, rectB, distance.elementRefA, distance.elementRefB)
        return { ...updated, id: distance.id }
      }),
    )

    const selected = store.selectedElementRef
    if (selected && document.contains(selected)) {
      store.set("selectedMeasurement", (prev) => {
        const next = getInspectMeasurement(selected)
        if (prev && rectAlmostEqual(prev.rect, next.rect)) return prev
        return next
      })
    }

    store.set("selectedMeasurements", (prev) =>
      prev.map((measurement) => {
        if (!measurement.elementRef || !document.contains(measurement.elementRef)) return measurement
        const next = getInspectMeasurement(measurement.elementRef)
        if (rectAlmostEqual(next.rect, measurement.rect)) return measurement
        return { ...next, id: measurement.id }
      }),
    )

    const hover = store.hoverElementRef
    if (hover && document.contains(hover)) {
      const rect = getRectFromDom(hover)
      store.set("hoverRect", (prev) => (prev && rectAlmostEqual(prev, rect) ? prev : rect))
    }

    frameId = requestAnimationFrame(tick)
  }

  frameId = requestAnimationFrame(tick)

  return () => {
    if (frameId) cancelAnimationFrame(frameId)
  }
}
