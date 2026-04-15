import type { History } from "./history"
import type { Store } from "./store"

export function setupHotkeys(
  store: Store,
  history: History,
  clearAll: () => void,
  removeSelectedGuides: () => boolean,
): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      clearAll()
      return
    }

    if (event.key.toLowerCase() === "m") {
      history.setWithHistory("enabled", (prev: boolean) => !prev)
    }

    const key = event.key.toLowerCase()
    const isOverlayActive = store.state.enabled && (store.state.toolMode !== "none" || store.state.toolbarActive)

    if (isOverlayActive) {
      if (key === "s") {
        history.setWithHistory("toolMode", (prev: string) => (prev === "select" ? "none" : "select"))
        store.set("toolbarActive", true)
      }
      if (key === "g") {
        history.setWithHistory("toolMode", (prev: string) => (prev === "guides" ? "none" : "guides"))
        store.set("toolbarActive", true)
      }
      if (key === "h") {
        history.setWithHistory("guideOrientation", "horizontal")
        store.set("toolbarActive", true)
      }
      if (key === "v") {
        history.setWithHistory("guideOrientation", "vertical")
        store.set("toolbarActive", true)
      }
    }

    if (event.key === "Alt") {
      store.set("altPressed", true)
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      const removed = removeSelectedGuides()
      if (removed) event.preventDefault()
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Alt") {
      store.set("altPressed", false)
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
  }
}
