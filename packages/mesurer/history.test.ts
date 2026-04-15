import { describe, expect, it } from "vitest"
import { History } from "./history"
import { Store } from "./store"

function createPair() {
  const store = new Store()
  const history = new History(store)
  return { store, history }
}

describe("History", () => {
  it("recordSnapshot saves state", () => {
    const { store, history } = createPair()
    history.recordSnapshot()
    store.set("enabled", false)
    history.undo()
    expect(store.state.enabled).toBe(true)
    history.destroy()
  })

  it("undo/redo restore snapshots", () => {
    const { store, history } = createPair()
    history.recordSnapshot()
    store.set("toolMode", "select")
    history.recordSnapshot()
    store.set("toolMode", "guides")

    history.undo()
    expect(store.state.toolMode).toBe("select")

    history.undo()
    expect(store.state.toolMode).toBe("none")

    history.redo()
    expect(store.state.toolMode).toBe("select")
    history.destroy()
  })

  it("deduplicates identical snapshots", () => {
    const { store, history } = createPair()
    history.recordSnapshot()
    history.recordSnapshot() // same state, should be deduped
    store.set("enabled", false)
    history.undo()
    expect(store.state.enabled).toBe(true)
    // only one undo needed since duplicate was skipped
    history.undo()
    // no more history, should still be true (no change)
    expect(store.state.enabled).toBe(true)
    history.destroy()
  })

  it("createActionCommit only commits once", () => {
    const { store, history } = createPair()
    const commit = history.createActionCommit()
    commit()
    commit() // second call should be no-op
    store.set("enabled", false)
    history.undo()
    expect(store.state.enabled).toBe(true)
    history.destroy()
  })

  it("setWithHistory records before changing", () => {
    const { store, history } = createPair()
    history.setWithHistory("enabled", false)
    expect(store.state.enabled).toBe(false)
    history.undo()
    expect(store.state.enabled).toBe(true)
    history.destroy()
  })

  it("respects history limit of 50", () => {
    const { store, history } = createPair()
    for (let i = 0; i < 60; i++) {
      store.set("guides", [{ id: `g${i}`, orientation: "vertical" as const, position: i }])
      history.recordSnapshot()
    }
    // Should have at most 50 entries
    let undoCount = 0
    for (let i = 0; i < 100; i++) {
      const before = store.state.guides
      history.undo()
      if (store.state.guides === before) break
      undoCount++
    }
    expect(undoCount).toBeLessThanOrEqual(50)
    history.destroy()
  })
})
