import { GUIDE_HITBOX_SIZE, MEASURE_LABEL_OFFSET } from "./constants"
import type { DerivedState } from "./derived"
import type { GuideDragHold } from "./guide-drag-hold"
import type { History } from "./history"
import { createMeasureTag, el } from "./render-helpers"
import type { Store } from "./store"
import type { DistanceOverlay, Guide } from "./types"
import { formatValue } from "./utils"

function renderEdges(
  container: HTMLElement,
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean },
  color: string,
) {
  if (edges.top)
    container.appendChild(
      el("div", { className: "absolute left-0 top-0 h-px w-full", style: { backgroundColor: color } }),
    )
  if (edges.right)
    container.appendChild(
      el("div", { className: "absolute right-0 top-0 h-full w-px", style: { backgroundColor: color } }),
    )
  if (edges.bottom)
    container.appendChild(
      el("div", { className: "absolute bottom-0 left-0 h-px w-full", style: { backgroundColor: color } }),
    )
  if (edges.left)
    container.appendChild(
      el("div", { className: "absolute left-0 top-0 h-full w-px", style: { backgroundColor: color } }),
    )
}

function renderDistanceOverlay(
  distance: DistanceOverlay,
  labelOffset: number,
  onRemove?: (id: string) => void,
): HTMLElement {
  const wrapper = el("div", { className: onRemove ? "pointer-events-auto" : "pointer-events-none" })
  if (onRemove) {
    wrapper.addEventListener("click", (e) => {
      e.stopPropagation()
      onRemove(distance.id)
    })
  }

  wrapper.appendChild(
    el("div", {
      className: "absolute rounded border border-[#2563eb]/70",
      style: {
        left: distance.rectA.left,
        top: distance.rectA.top,
        width: distance.rectA.width,
        height: distance.rectA.height,
      },
    }),
  )
  wrapper.appendChild(
    el("div", {
      className: "absolute rounded border border-[#2563eb]/70",
      style: {
        left: distance.rectB.left,
        top: distance.rectB.top,
        width: distance.rectB.width,
        height: distance.rectB.height,
      },
    }),
  )

  for (const connector of distance.connectors) {
    if (Math.abs(connector.x1 - connector.x2) < 1) {
      wrapper.appendChild(
        el("div", {
          className: "absolute border-l border-dashed border-[#2563eb]/70",
          style: {
            left: connector.x1,
            top: Math.min(connector.y1, connector.y2),
            height: Math.abs(connector.y2 - connector.y1),
          },
        }),
      )
    } else {
      wrapper.appendChild(
        el("div", {
          className: "absolute border-t border-dashed border-[#2563eb]/70",
          style: {
            left: Math.min(connector.x1, connector.x2),
            top: connector.y1,
            width: Math.abs(connector.x2 - connector.x1),
          },
        }),
      )
    }
  }

  if (distance.horizontal && distance.horizontal.value > 0) {
    wrapper.appendChild(
      el("div", {
        className: "absolute h-px bg-[#2563eb]",
        style: {
          left: Math.min(distance.horizontal.x1, distance.horizontal.x2),
          width: Math.abs(distance.horizontal.x2 - distance.horizontal.x1),
          top: distance.horizontal.y,
        },
      }),
    )
    wrapper.appendChild(
      createMeasureTag(
        "-translate-x-1/2 bg-ink-900/90",
        {
          left: (distance.horizontal.x1 + distance.horizontal.x2) / 2,
          top: distance.horizontal.y + labelOffset,
        },
        String(formatValue(distance.horizontal.value)),
      ),
    )
  }

  if (distance.vertical && distance.vertical.value > 0) {
    wrapper.appendChild(
      el("div", {
        className: "absolute w-px bg-[#2563eb]",
        style: {
          top: Math.min(distance.vertical.y1, distance.vertical.y2),
          height: Math.abs(distance.vertical.y2 - distance.vertical.y1),
          left: distance.vertical.x,
        },
      }),
    )
    wrapper.appendChild(
      createMeasureTag(
        "-translate-y-1/2 bg-ink-900/90",
        {
          left: distance.vertical.x + labelOffset,
          top: (distance.vertical.y1 + distance.vertical.y2) / 2,
        },
        String(formatValue(distance.vertical.value)),
      ),
    )
  }

  return wrapper
}

export function createOverlay(
  store: Store,
  history: History,
  guideDragHold: GuideDragHold,
): { element: HTMLElement; update: (derived: DerivedState) => void } {
  const overlayEl = el("div", { className: "absolute inset-0 pointer-events-none opacity-0" })

  function handleGuidePointerDown(guide: Guide, event: PointerEvent) {
    const commit = history.createActionCommit()
    if (!store.state.enabled) return
    event.stopPropagation()
    if (event.shiftKey) {
      commit()
      const prev = store.state.selectedGuideIds
      store.set(
        "selectedGuideIds",
        prev.includes(guide.id) ? prev.filter((id) => id !== guide.id) : [...prev, guide.id],
      )
      return
    }
    commit()
    store.set("selectedGuideIds", [guide.id])
    guideDragHold.schedule(guide.id, store)
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function handleGuidePointerUp(guide: Guide, event: PointerEvent) {
    event.stopPropagation()
    guideDragHold.clear()
    if (store.state.draggingGuideId === guide.id) store.set("draggingGuideId", null)
    if ((event.currentTarget as HTMLElement).hasPointerCapture?.(event.pointerId)) {
      ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
    }
  }

  function update(d: DerivedState) {
    const s = store.state
    const guidesEnabled = s.toolMode === "guides"

    // Update overlay interactivity
    if (s.enabled && s.toolMode !== "none") {
      const cursorClass = guidesEnabled
        ? d.hoverGuide || s.draggingGuideId
          ? "cursor-default"
          : "cursor-crosshair"
        : "cursor-default"
      overlayEl.className = `absolute inset-0 pointer-events-auto ${cursorClass} opacity-100`
    } else {
      overlayEl.className = "absolute inset-0 pointer-events-none opacity-0"
    }

    // Rebuild content
    overlayEl.replaceChildren()

    // Measurement boxes (non-guides mode)
    if (!guidesEnabled) {
      for (let i = 0; i < d.displayedMeasurements.length; i++) {
        const m = d.displayedMeasurements[i]
        const edges = d.measurementEdgeVisibility[i] ?? { top: true, right: true, bottom: true, left: true }
        const outlineColor = "color-mix(in oklch, oklch(0.62 0.18 255) 80%, transparent)"
        const fillColor = "color-mix(in oklch, oklch(0.62 0.18 255) 8%, transparent)"
        const box = el("div", { className: "pointer-events-none" })
        const rect = el("div", {
          className: "absolute",
          style: {
            left: m.rect.left,
            top: m.rect.top,
            width: m.rect.width,
            height: m.rect.height,
            backgroundColor: fillColor,
          },
        })
        renderEdges(rect, edges, outlineColor)
        box.appendChild(rect)
        box.appendChild(
          createMeasureTag(
            "-translate-x-1/2 bg-ink-900/90",
            {
              left: m.rect.left + m.rect.width / 2,
              top: m.rect.top + m.rect.height + MEASURE_LABEL_OFFSET,
            },
            `${formatValue(m.rect.width)} x ${formatValue(m.rect.height)}`,
          ),
        )
        overlayEl.appendChild(box)
      }
    }

    // Active drag rect
    if (!guidesEnabled && d.activeRect && s.isDragging) {
      const dragBox = el("div", {
        className: "pointer-events-none absolute",
        style: {
          left: d.activeRect.left,
          top: d.activeRect.top,
          width: d.activeRect.width,
          height: d.activeRect.height,
          backgroundColor: d.fillColor,
        },
      })
      renderEdges(dragBox, { top: true, right: true, bottom: true, left: true }, d.outlineColor)
      overlayEl.appendChild(dragBox)
      overlayEl.appendChild(
        createMeasureTag(
          "-translate-x-1/2 bg-ink-900/90",
          {
            left: d.activeRect.left + d.activeRect.width / 2,
            top: d.activeRect.top + d.activeRect.height + MEASURE_LABEL_OFFSET,
          },
          `${d.activeWidth} x ${d.activeHeight}`,
        ),
      )
    }

    // Hover rect
    if (!guidesEnabled && d.hoverRectToShow) {
      const hoverBox = el("div", {
        className: "pointer-events-none absolute",
        style: {
          left: d.hoverRectToShow.left,
          top: d.hoverRectToShow.top,
          width: d.hoverRectToShow.width,
          height: d.hoverRectToShow.height,
          backgroundColor: d.fillColor,
        },
      })
      const hEdges = d.hoverEdgeVisibility ?? { top: true, right: true, bottom: true, left: true }
      renderEdges(hoverBox, hEdges, d.outlineColor)
      overlayEl.appendChild(hoverBox)
    }

    // Guide preview
    if (guidesEnabled && s.guidePreview) {
      const gp = s.guidePreview
      const preview = el("div", {
        className: "pointer-events-none absolute",
        style:
          gp.orientation === "vertical"
            ? { left: gp.position - GUIDE_HITBOX_SIZE / 2, top: 0, width: GUIDE_HITBOX_SIZE, height: "100%" }
            : { top: gp.position - GUIDE_HITBOX_SIZE / 2, left: 0, height: GUIDE_HITBOX_SIZE, width: "100%" },
      })
      preview.appendChild(
        el("div", {
          className: "absolute",
          style:
            gp.orientation === "vertical"
              ? {
                  left: GUIDE_HITBOX_SIZE / 2 - 1,
                  top: 0,
                  width: 2,
                  height: "100%",
                  backgroundColor: d.guideColorPreview,
                }
              : {
                  top: GUIDE_HITBOX_SIZE / 2 - 1,
                  left: 0,
                  height: 2,
                  width: "100%",
                  backgroundColor: d.guideColorPreview,
                },
        }),
      )
      overlayEl.appendChild(preview)
    }

    // Selected measurement boxes
    if (!guidesEnabled) {
      for (let i = 0; i < d.displayedSelectedMeasurements.length; i++) {
        const m = d.displayedSelectedMeasurements[i]
        const edges = d.selectedEdgeVisibility[i] ?? { top: true, right: true, bottom: true, left: true }
        const outlineColor = "color-mix(in oklch, oklch(0.62 0.18 255) 80%, transparent)"
        const fillColor = "color-mix(in oklch, oklch(0.62 0.18 255) 8%, transparent)"
        const box = el("div", { className: "pointer-events-none" })
        const rect = el("div", {
          className: "absolute",
          style: {
            left: m.rect.left,
            top: m.rect.top,
            width: m.rect.width,
            height: m.rect.height,
            backgroundColor: fillColor,
          },
        })
        renderEdges(rect, edges, outlineColor)
        box.appendChild(rect)
        box.appendChild(
          createMeasureTag(
            "-translate-x-1/2 bg-ink-900/90",
            {
              left: m.rect.left + m.rect.width / 2,
              top: m.rect.top + m.rect.height + MEASURE_LABEL_OFFSET,
            },
            `${formatValue(m.rect.width)} x ${formatValue(m.rect.height)}`,
          ),
        )
        overlayEl.appendChild(box)
      }
    }

    // Held distances
    for (const distance of s.heldDistances) {
      overlayEl.appendChild(
        renderDistanceOverlay(distance, MEASURE_LABEL_OFFSET, (id) => {
          history.recordSnapshot()
          store.set("heldDistances", (prev) => prev.filter((d) => d.id !== id))
        }),
      )
    }

    // Option pair overlay
    if (!guidesEnabled && s.altPressed && d.optionPairOverlay) {
      overlayEl.appendChild(renderDistanceOverlay(d.optionPairOverlay, MEASURE_LABEL_OFFSET))
    }

    // Guide distance overlay
    if (guidesEnabled && s.altPressed && d.guideDistanceOverlay) {
      overlayEl.appendChild(renderDistanceOverlay(d.guideDistanceOverlay, MEASURE_LABEL_OFFSET))
    }

    // Option container lines
    if (!guidesEnabled && s.altPressed && d.optionContainerLines) {
      const lines = d.optionContainerLines
      if (lines.top.value > 0) {
        overlayEl.appendChild(
          el("div", {
            className: "absolute w-px bg-[#2563eb]",
            style: { top: lines.top.y1, height: lines.top.y2 - lines.top.y1, left: lines.top.x },
          }),
        )
        overlayEl.appendChild(
          createMeasureTag(
            "-translate-y-1/2 bg-ink-900/90",
            {
              left: lines.top.x + MEASURE_LABEL_OFFSET,
              top: (lines.top.y1 + lines.top.y2) / 2,
            },
            String(formatValue(lines.top.value)),
          ),
        )
      }
      if (lines.bottom.value > 0) {
        overlayEl.appendChild(
          el("div", {
            className: "absolute w-px bg-[#2563eb]",
            style: { top: lines.bottom.y1, height: lines.bottom.y2 - lines.bottom.y1, left: lines.bottom.x },
          }),
        )
        overlayEl.appendChild(
          createMeasureTag(
            "-translate-y-1/2 bg-ink-900/90",
            {
              left: lines.bottom.x + MEASURE_LABEL_OFFSET,
              top: (lines.bottom.y1 + lines.bottom.y2) / 2,
            },
            String(formatValue(lines.bottom.value)),
          ),
        )
      }
      if (lines.left.value > 0) {
        overlayEl.appendChild(
          el("div", {
            className: "absolute h-px bg-[#2563eb]",
            style: { left: lines.left.x1, width: lines.left.x2 - lines.left.x1, top: lines.left.y },
          }),
        )
        overlayEl.appendChild(
          createMeasureTag(
            "-translate-x-1/2 bg-ink-900/90",
            {
              left: (lines.left.x1 + lines.left.x2) / 2,
              top: lines.left.y + MEASURE_LABEL_OFFSET,
            },
            String(formatValue(lines.left.value)),
          ),
        )
      }
      if (lines.right.value > 0) {
        overlayEl.appendChild(
          el("div", {
            className: "absolute h-px bg-[#2563eb]",
            style: { left: lines.right.x1, width: lines.right.x2 - lines.right.x1, top: lines.right.y },
          }),
        )
        overlayEl.appendChild(
          createMeasureTag(
            "-translate-x-1/2 bg-ink-900/90",
            {
              left: (lines.right.x1 + lines.right.x2) / 2,
              top: lines.right.y + MEASURE_LABEL_OFFSET,
            },
            String(formatValue(lines.right.value)),
          ),
        )
      }
    }

    // Guides
    for (const guide of s.guides) {
      const isSelected = s.selectedGuideIds.includes(guide.id)
      const isHovered = d.hoverGuide?.id === guide.id
      const strokeWidth = isSelected || isHovered ? 2 : 1
      const strokeColor = isSelected ? d.guideColorActive : isHovered ? d.guideColorHover : d.guideColorDefault

      const guideEl = el("div", {
        className: "absolute",
        style:
          guide.orientation === "vertical"
            ? { left: guide.position - GUIDE_HITBOX_SIZE / 2, top: 0, width: GUIDE_HITBOX_SIZE, height: "100%" }
            : { top: guide.position - GUIDE_HITBOX_SIZE / 2, left: 0, height: GUIDE_HITBOX_SIZE, width: "100%" },
      })
      guideEl.appendChild(
        el("div", {
          className: "absolute",
          style:
            guide.orientation === "vertical"
              ? {
                  left: GUIDE_HITBOX_SIZE / 2 - 1,
                  top: 0,
                  width: strokeWidth,
                  height: "100%",
                  backgroundColor: strokeColor,
                }
              : {
                  top: GUIDE_HITBOX_SIZE / 2 - 1,
                  left: 0,
                  height: strokeWidth,
                  width: "100%",
                  backgroundColor: strokeColor,
                },
        }),
      )

      guideEl.addEventListener("pointerdown", (e) => handleGuidePointerDown(guide, e))
      guideEl.addEventListener("pointerup", (e) => handleGuidePointerUp(guide, e))
      guideEl.addEventListener("pointercancel", (e) => handleGuidePointerUp(guide, e))

      overlayEl.appendChild(guideEl)
    }
  }

  return { element: overlayEl, update }
}
