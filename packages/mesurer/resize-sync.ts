import { updateDistanceForResize } from "./distances"
import { getInspectMeasurement, updateMeasurementForResize } from "./dom"
import { getViewportSize } from "./geometry"
import type { Store } from "./store"

export function setupResizeSync(store: Store): () => void {
  let resizeFrame: number | null = null
  let viewport = getViewportSize()

  const handleResize = () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame)

    resizeFrame = requestAnimationFrame(() => {
      const newViewport = getViewportSize()
      const previousViewport = viewport

      store.set("measurements", (prev) => prev.map((m) => updateMeasurementForResize(m, newViewport)))
      store.set("activeMeasurement", (prev) => (prev ? updateMeasurementForResize(prev, newViewport) : prev))
      store.set("heldDistances", (prev) => prev.map((d) => updateDistanceForResize(d, newViewport)))

      if (store.selectedElementRef) {
        store.set("selectedMeasurement", getInspectMeasurement(store.selectedElementRef))
      }

      if (previousViewport.width > 0 && previousViewport.height > 0) {
        const scaleX = newViewport.width / previousViewport.width
        const scaleY = newViewport.height / previousViewport.height
        store.set("guides", (prev) =>
          prev.map((guide) =>
            guide.orientation === "vertical"
              ? { ...guide, position: guide.position * scaleX }
              : { ...guide, position: guide.position * scaleY },
          ),
        )
      }

      viewport = newViewport
    })
  }

  window.addEventListener("resize", handleResize)

  return () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame)
    window.removeEventListener("resize", handleResize)
  }
}
