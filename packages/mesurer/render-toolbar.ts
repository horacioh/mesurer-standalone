import type { History } from "./history"
import { caretDownIcon, checkIcon, cursorIcon, el, minusIcon, rulerIcon } from "./render-helpers"
import type { Store } from "./store"
import { cn } from "./utils"

const TOOLBAR_TOOLTIP_DELAY_MS = 800
const TOOLBAR_DRAG_SLOP = 6

export function createToolbar(store: Store, history: History): HTMLDivElement {
  let posX = 16
  let posY = 16
  let visibleTooltipId: string | null = null
  let tooltipTimer: number | null = null
  let instantTooltip = false
  let guideMenuOpen = false
  let activeMenuIndex = 0

  // Drag state
  const drag = {
    active: false,
    didDrag: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    width: 0,
    height: 0,
  }
  let suppressClick = false
  let detachDragListeners: (() => void) | null = null

  const toolbar = document.createElement("div")
  toolbar.className =
    "pointer-events-auto absolute z-[90] flex items-center gap-1 rounded-[12px] bg-[#fff] p-1 outline outline-transparent shadow-[0px_0px_.5px_rgba(0,0,0,.18),0px_3px_8px_rgba(0,0,0,.1),0px_1px_3px_rgba(0,0,0,.1)]"
  toolbar.style.left = `${posX}px`
  toolbar.style.top = `${posY}px`

  // Tooltip helpers
  function clearTooltipTimer() {
    if (tooltipTimer !== null) {
      window.clearTimeout(tooltipTimer)
      tooltipTimer = null
    }
  }
  function showTooltip(id: string) {
    clearTooltipTimer()
    if (instantTooltip) {
      visibleTooltipId = id
      updateTooltips()
      return
    }
    tooltipTimer = window.setTimeout(() => {
      visibleTooltipId = id
      instantTooltip = true
      tooltipTimer = null
      updateTooltips()
    }, TOOLBAR_TOOLTIP_DELAY_MS)
  }
  function hideTooltip(id: string) {
    clearTooltipTimer()
    if (visibleTooltipId === id) {
      visibleTooltipId = null
      updateTooltips()
    }
  }
  function hideAllTooltips() {
    clearTooltipTimer()
    visibleTooltipId = null
    instantTooltip = false
    updateTooltips()
  }

  // Tooltip elements tracked for updates
  const tooltipEls: { id: string; el: HTMLElement }[] = []
  function updateTooltips() {
    for (const t of tooltipEls) {
      t.el.className = cn(
        "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[11px] text-white transition-opacity duration-150 select-none",
        nearTop() ? "top-full mt-2" : "bottom-full mb-2",
        visibleTooltipId === t.id ? "opacity-100" : "opacity-0",
      )
    }
  }
  function nearTop() {
    return posY < 56
  }

  function createButton(id: string, label: string, shortcut: string, icon: HTMLElement, onClick: () => void) {
    const wrapper = el("div", { className: "relative" })
    const btn = el(
      "button",
      {
        className:
          "flex size-8 items-center justify-center rounded-[8px] outline-none bg-transparent text-black hover:bg-black/4",
        type: "button",
      },
      icon,
    )
    const tooltip = el("span", {
      className:
        "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[11px] text-white transition-opacity duration-150 select-none bottom-full mb-2 opacity-0",
    })
    tooltip.innerHTML = `${label} <kbd class="text-white/60">${shortcut}</kbd>`
    tooltipEls.push({ id, el: tooltip })

    wrapper.addEventListener("mouseenter", () => showTooltip(id))
    wrapper.addEventListener("mouseleave", () => hideTooltip(id))
    btn.addEventListener("click", onClick)

    wrapper.appendChild(btn)
    wrapper.appendChild(tooltip)
    return { wrapper, btn }
  }

  // Select button
  const selectBtn = createButton("select", "Select", "S", cursorIcon(20), () => {
    history.setWithHistory("enabled", true)
    history.setWithHistory("toolMode", (prev: string) => (prev === "select" ? "none" : "select"))
    store.set("toolbarActive", true)
  })

  // Guides button
  const guidesBtn = createButton("guides", "Guides", "G", rulerIcon(20), () => {
    history.setWithHistory("enabled", true)
    history.setWithHistory("toolMode", (prev: string) => (prev === "guides" ? "none" : "guides"))
    store.set("toolbarActive", true)
  })

  // Guide orientation menu
  const guideMenuWrapper = el("div", { className: "group relative -ml-1 flex items-stretch" })
  const caretBtn = el(
    "button",
    {
      className: "flex h-8 w-4 items-center justify-center rounded-[6px] outline-none hover:bg-black/10 text-black",
      type: "button",
    },
    caretDownIcon(8),
  )

  const guideMenuTooltip = el(
    "span",
    {
      className:
        "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[11px] text-white transition-opacity duration-150 select-none bottom-full mb-2 opacity-0",
    },
    "Orientation Guide",
  )
  tooltipEls.push({ id: "guide-menu", el: guideMenuTooltip })
  guideMenuWrapper.addEventListener("mouseenter", () => showTooltip("guide-menu"))
  guideMenuWrapper.addEventListener("mouseleave", () => hideTooltip("guide-menu"))

  let menuPanel: HTMLElement | null = null

  function selectGuideOrientation(orientation: "vertical" | "horizontal") {
    history.setWithHistory("enabled", true)
    history.setWithHistory("toolMode", "guides")
    history.setWithHistory("guideOrientation", orientation)
    store.set("toolbarActive", true)
    closeGuideMenu()
  }

  function openGuideMenu() {
    guideMenuOpen = true
    activeMenuIndex = store.state.guideOrientation === "horizontal" ? 0 : 1
    renderGuideMenu()
  }

  function closeGuideMenu() {
    guideMenuOpen = false
    if (menuPanel) {
      menuPanel.remove()
      menuPanel = null
    }
  }

  function renderGuideMenu() {
    if (menuPanel) menuPanel.remove()
    const nearBottom = window.innerHeight > 0 && posY > window.innerHeight - 56
    const menuSide = nearBottom ? "top" : "bottom"

    menuPanel = el("div", {
      className: cn(
        "absolute z-[70] w-44 rounded-lg border border-ink-200 bg-white p-1 shadow-[0px_10px_30px_rgba(0,0,0,0.08)] outline-none focus:outline-none flex flex-col gap-px",
        menuSide === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
      ),
      tabIndex: "0",
    })

    const hBtn = el(
      "button",
      {
        className: cn(
          "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px]",
          activeMenuIndex === 0 || store.state.guideOrientation === "horizontal"
            ? "bg-[#0d99ff] text-white"
            : "text-ink-700 hover:bg-[#0d99ff] hover:text-white",
        ),
        type: "button",
      },
      checkIcon(12, store.state.guideOrientation === "horizontal" ? "opacity-100" : "opacity-0"),
      minusIcon(12),
      el("span", { className: "flex-1" }, "Horizontal"),
      el("span", {}, "H"),
    )
    hBtn.addEventListener("click", () => selectGuideOrientation("horizontal"))

    const vBtn = el(
      "button",
      {
        className: cn(
          "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px]",
          activeMenuIndex === 1 || store.state.guideOrientation === "vertical"
            ? "bg-[#0d99ff] text-white"
            : "text-ink-700 hover:bg-[#0d99ff] hover:text-white",
        ),
        type: "button",
      },
      checkIcon(12, store.state.guideOrientation === "vertical" ? "opacity-100" : "opacity-0"),
      minusIcon(12, "rotate-90"),
      el("span", { className: "flex-1" }, "Vertical"),
      el("span", {}, "V"),
    )
    vBtn.addEventListener("click", () => selectGuideOrientation("vertical"))

    menuPanel.appendChild(hBtn)
    menuPanel.appendChild(vBtn)

    menuPanel.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase()
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        activeMenuIndex = (activeMenuIndex + 1) % 2
        renderGuideMenu()
      }
      if (event.key === "Enter") {
        event.preventDefault()
        selectGuideOrientation(activeMenuIndex === 0 ? "horizontal" : "vertical")
      }
      if (key === "h") {
        event.preventDefault()
        selectGuideOrientation("horizontal")
      }
      if (key === "v") {
        event.preventDefault()
        selectGuideOrientation("vertical")
      }
      if (event.key === "Escape") {
        event.preventDefault()
        closeGuideMenu()
      }
    })

    guideMenuWrapper.appendChild(menuPanel)
    requestAnimationFrame(() => {
      if (!menuPanel) return
      menuPanel.focus()
      const rect = menuPanel.getBoundingClientRect()
      if (rect.right > window.innerWidth - 8) {
        menuPanel.style.right = "0"
        menuPanel.style.left = "auto"
      } else if (rect.left < 8) {
        menuPanel.style.left = "0"
        menuPanel.style.right = "auto"
      }
    })
  }

  caretBtn.addEventListener("click", () => {
    store.set("toolbarActive", true)
    if (guideMenuOpen) closeGuideMenu()
    else openGuideMenu()
  })

  guideMenuWrapper.appendChild(caretBtn)
  guideMenuWrapper.appendChild(guideMenuTooltip)

  toolbar.appendChild(selectBtn.wrapper)
  toolbar.appendChild(guidesBtn.wrapper)
  toolbar.appendChild(guideMenuWrapper)

  // Close menu on outside click
  const handleOutsideClick = (event: PointerEvent) => {
    if (guideMenuOpen && menuPanel && !guideMenuWrapper.contains(event.target as Node)) {
      closeGuideMenu()
    }
  }
  window.addEventListener("pointerdown", handleOutsideClick)

  // Drag
  toolbar.addEventListener("pointerdown", (event) => {
    store.set("toolbarActive", true)

    if (event.button !== 0) return
    if (detachDragListeners) {
      detachDragListeners()
      detachDragListeners = null
    }

    drag.active = false
    drag.didDrag = false
    drag.pointerId = event.pointerId
    drag.startX = event.clientX
    drag.startY = event.clientY
    drag.originX = posX
    drag.originY = posY
    const rect = toolbar.getBoundingClientRect()
    drag.width = rect.width
    drag.height = rect.height

    const handleMove = (e: PointerEvent) => {
      if (drag.pointerId !== e.pointerId) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      if (!drag.active) {
        drag.active = Math.abs(dx) > TOOLBAR_DRAG_SLOP || Math.abs(dy) > TOOLBAR_DRAG_SLOP
      }
      if (!drag.active) return
      drag.didDrag = true
      const maxX = Math.max(8, window.innerWidth - drag.width - 8)
      const maxY = Math.max(8, window.innerHeight - drag.height - 8)
      posX = Math.min(maxX, Math.max(8, drag.originX + dx))
      posY = Math.min(maxY, Math.max(8, drag.originY + dy))
      toolbar.style.left = `${posX}px`
      toolbar.style.top = `${posY}px`
    }

    const handleEnd = (e: PointerEvent) => {
      if (drag.pointerId !== e.pointerId && drag.pointerId !== -1) return
      suppressClick = drag.didDrag
      drag.active = false
      drag.didDrag = false
      drag.pointerId = -1
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleEnd)
      window.removeEventListener("pointercancel", handleEnd)
      detachDragListeners = null
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleEnd)
    window.addEventListener("pointercancel", handleEnd)
    detachDragListeners = () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleEnd)
      window.removeEventListener("pointercancel", handleEnd)
    }
  })

  toolbar.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return
      event.preventDefault()
      event.stopPropagation()
      suppressClick = false
    },
    true,
  )

  toolbar.addEventListener("mouseleave", hideAllTooltips)

  // Update active states on store change
  function update() {
    const s = store.state
    selectBtn.btn.className = cn(
      "flex size-8 items-center justify-center rounded-[8px] outline-none",
      s.toolMode === "select" ? "bg-[#0d99ff] text-white" : "bg-transparent text-black hover:bg-black/4",
    )
    guidesBtn.btn.className = cn(
      "flex size-8 items-center justify-center rounded-[8px] outline-none",
      s.toolMode === "guides" ? "bg-[#0d99ff] text-white" : "bg-transparent text-black hover:bg-black/4",
    )
    // Update ruler icon rotation
    const rulerSvg = guidesBtn.btn.querySelector("svg")
    if (rulerSvg) {
      rulerSvg.setAttribute("class", s.guideOrientation === "vertical" ? "rotate-[135deg]" : "rotate-[45deg]")
    }
  }

  const unsub = store.subscribe(update)
  update()
  ;(toolbar as any).__mesurer_cleanup = () => {
    unsub()
    clearTooltipTimer()
    window.removeEventListener("pointerdown", handleOutsideClick)
    if (detachDragListeners) detachDragListeners()
  }

  return toolbar
}
