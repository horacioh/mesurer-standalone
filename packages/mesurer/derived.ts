import { getDistanceOverlay } from "./distances"
import { getEdgeVisibilityForRects } from "./edge-visibility"
import type { EdgeVisibility } from "./edge-visibility"
import { getGuideRect } from "./guides"
import { getHoveredGuide, getOptionContainerLines, getOptionPairOverlay, getSelectedGuide } from "./option-measurements"
import { getPrimarySelectedMeasurement } from "./selection-helpers"
import type { Store } from "./store"
import type { DistanceOverlay as DistanceOverlayType, Guide, InspectMeasurement, Measurement, Rect } from "./types"
import { formatValue } from "./utils"

export type DerivedState = {
  activeRect: Rect | null
  activeWidth: number
  activeHeight: number
  displayedMeasurements: Measurement[]
  displayedSelectedMeasurements: InspectMeasurement[]
  hoverGuide: Guide | null
  optionPairOverlay: DistanceOverlayType | null
  optionContainerLines: ReturnType<typeof getOptionContainerLines>
  guideDistanceOverlay: DistanceOverlayType | null
  outlineColor: string
  fillColor: string
  guideColorActive: string
  guideColorHover: string
  guideColorDefault: string
  guideColorPreview: string
  hoverRectToShow: Rect | null
  selectedEdgeVisibility: EdgeVisibility[]
  hoverEdgeVisibility: EdgeVisibility | null
  measurementEdgeVisibility: EdgeVisibility[]
}

export function computeDerived(store: Store, highlightColor: string, guideColor: string): DerivedState {
  const s = store.state
  const {
    start,
    end,
    selectedMeasurements,
    selectedMeasurement,
    selectionOriginRect,
    guides,
    selectedGuideIds,
    hoverPointer,
    hoverRect,
    hoverElement,
    selectedElement,
    altPressed,
    guidePreview,
    measurements,
    activeMeasurement,
  } = s

  const holdEnabled = false
  const multiMeasureEnabled = false
  const guidesEnabled = s.toolMode === "guides"
  const displayedMeasurements: Measurement[] = holdEnabled
    ? measurements
    : multiMeasureEnabled && measurements.length > 0
      ? measurements
      : activeMeasurement
        ? [activeMeasurement]
        : []

  // activeRect
  const activeRect =
    start && end
      ? {
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
        }
      : null
  const activeWidth = activeRect ? formatValue(activeRect.width) : 0
  const activeHeight = activeRect ? formatValue(activeRect.height) : 0

  // grouped selection
  let groupedSelection: InspectMeasurement | null = null
  if (selectedMeasurements.length > 1) {
    const rects = selectedMeasurements.map((m) => m.rect)
    let left = Number.POSITIVE_INFINITY,
      top = Number.POSITIVE_INFINITY,
      right = Number.NEGATIVE_INFINITY,
      bottom = Number.NEGATIVE_INFINITY
    rects.forEach((r) => {
      left = Math.min(left, r.left)
      top = Math.min(top, r.top)
      right = Math.max(right, r.left + r.width)
      bottom = Math.max(bottom, r.top + r.height)
    })
    const unionRect = { left, top, width: right - left, height: bottom - top }
    const base = selectedMeasurements[selectedMeasurements.length - 1]
    const selectionKey = selectedMeasurements.map((m) => m.id).join("|")
    groupedSelection = {
      ...base,
      id: `group-${selectionKey}`,
      rect: unionRect,
      paddingRect: unionRect,
      marginRect: unionRect,
      originRect: selectionOriginRect ?? undefined,
    }
  }

  const displayedSelectedMeasurements = groupedSelection
    ? [groupedSelection]
    : selectedMeasurements.length > 0
      ? selectedMeasurements
      : selectedMeasurement
        ? [selectedMeasurement]
        : []

  const selectedGuide = getSelectedGuide(guides, selectedGuideIds)
  const hoverGuide = getHoveredGuide(hoverPointer, guides)
  const primarySelectedMeasurement = getPrimarySelectedMeasurement(selectedMeasurements, selectedMeasurement)
  const effectivePrimarySelected = groupedSelection ?? primarySelectedMeasurement

  const optionPairOverlay = getOptionPairOverlay({
    altPressed,
    primarySelectedMeasurement: effectivePrimarySelected,
    selectedGuide,
    hoverGuide,
    hoverElement,
    selectedElementRef: selectedElement,
  })

  const optionContainerLines = getOptionContainerLines({
    altPressed,
    primarySelectedMeasurement: effectivePrimarySelected,
    optionPairOverlay,
    selectedGuideIds,
    selectedElement,
    hoverElement,
  })

  let guideDistanceOverlay: DistanceOverlayType | null = null
  if (altPressed && guidesEnabled && guidePreview) {
    const previewGuide = { id: "preview", orientation: guidePreview.orientation, position: guidePreview.position }
    const sameOrientation = guides.filter((g) => g.orientation === guidePreview.orientation)
    if (sameOrientation.length > 0) {
      const nearest = sameOrientation.reduce(
        (closest, guide) => {
          const distance = Math.abs(guide.position - previewGuide.position)
          if (!closest) return { guide, distance }
          return distance < closest.distance ? { guide, distance } : closest
        },
        null as { guide: Guide; distance: number } | null,
      )
      if (nearest) {
        guideDistanceOverlay = getDistanceOverlay(getGuideRect(previewGuide), getGuideRect(nearest.guide))
      }
    }
  }

  const outlineColor = `color-mix(in oklch, ${highlightColor} 80%, transparent)`
  const fillColor = `color-mix(in oklch, ${highlightColor} 8%, transparent)`
  const guideColorActive = `color-mix(in oklch, ${guideColor} 100%, transparent)`
  const guideColorHover = `color-mix(in oklch, ${guideColor} 90%, transparent)`
  const guideColorDefault = `color-mix(in oklch, ${guideColor} 70%, transparent)`
  const guideColorPreview = `color-mix(in oklch, ${guideColor} 50%, transparent)`

  const selectedRects = displayedSelectedMeasurements.map((m) => m.rect)
  const hoverRectToShow = hoverRect && selectedMeasurements.length <= 1 ? hoverRect : null

  const selectionEdgeVisibility = getEdgeVisibilityForRects(selectedRects)
  const selectedEdgeVisibility = selectionEdgeVisibility.slice(0, selectedRects.length)
  const hoverEdgeVisibility = hoverRectToShow ? { top: true, right: true, bottom: true, left: true } : null
  const measurementEdgeVisibility = getEdgeVisibilityForRects(displayedMeasurements.map((m) => m.rect))

  return {
    activeRect,
    activeWidth,
    activeHeight,
    displayedMeasurements,
    displayedSelectedMeasurements,
    hoverGuide,
    optionPairOverlay,
    optionContainerLines,
    guideDistanceOverlay,
    outlineColor,
    fillColor,
    guideColorActive,
    guideColorHover,
    guideColorDefault,
    guideColorPreview,
    hoverRectToShow,
    selectedEdgeVisibility,
    hoverEdgeVisibility,
    measurementEdgeVisibility,
  }
}
