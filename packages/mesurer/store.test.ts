import { describe, expect, it, vi } from "vitest"
import { Store } from "./store"

describe("Store", () => {
  it("initializes with defaults", () => {
    const store = new Store()
    expect(store.state.enabled).toBe(true)
    expect(store.state.toolMode).toBe("none")
    expect(store.state.measurements).toEqual([])
  })

  it("accepts initial overrides", () => {
    const store = new Store({ enabled: false, toolMode: "select" })
    expect(store.state.enabled).toBe(false)
    expect(store.state.toolMode).toBe("select")
  })

  it("set() with direct value", () => {
    const store = new Store()
    store.set("enabled", false)
    expect(store.state.enabled).toBe(false)
  })

  it("set() with updater function", () => {
    const store = new Store()
    store.set("enabled", (prev) => !prev)
    expect(store.state.enabled).toBe(false)
  })

  it("set() does not notify if value unchanged", () => {
    const store = new Store()
    const listener = vi.fn()
    store.subscribe(listener)
    store.set("enabled", true) // already true
    expect(listener).not.toHaveBeenCalled()
  })

  it("subscribe() and notification", () => {
    const store = new Store()
    const listener = vi.fn()
    store.subscribe(listener)
    store.set("enabled", false)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("subscribe() returns unsubscribe function", () => {
    const store = new Store()
    const listener = vi.fn()
    const unsub = store.subscribe(listener)
    unsub()
    store.set("enabled", false)
    expect(listener).not.toHaveBeenCalled()
  })

  it("batch() batches notifications", () => {
    const store = new Store()
    const listener = vi.fn()
    store.subscribe(listener)
    store.batch(() => {
      store.set("enabled", false)
      store.set("toolMode", "select")
    })
    // batch fires one notification at the end
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.state.enabled).toBe(false)
    expect(store.state.toolMode).toBe("select")
  })

  it("setSelectedElement() updates ref and state", () => {
    const store = new Store()
    const el = document.createElement("div")
    store.setSelectedElement(el)
    expect(store.selectedElementRef).toBe(el)
    expect(store.state.selectedElement).toBe(el)
  })

  it("setHoverElement() updates ref and state", () => {
    const store = new Store()
    const el = document.createElement("div")
    store.setHoverElement(el)
    expect(store.hoverElementRef).toBe(el)
    expect(store.state.hoverElement).toBe(el)
  })

  it("clearSelectionRect() clears ref and state", () => {
    const store = new Store()
    store.selectionRectRef = { left: 0, top: 0, width: 10, height: 10 }
    store.set("selectionOriginRect", { left: 0, top: 0, width: 10, height: 10 })
    store.clearSelectionRect()
    expect(store.selectionRectRef).toBeNull()
    expect(store.state.selectionOriginRect).toBeNull()
  })
})
