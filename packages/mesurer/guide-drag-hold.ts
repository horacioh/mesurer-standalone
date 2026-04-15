import { GUIDE_DRAG_HOLD_MS } from "./constants"
import type { Store } from "./store"

export class GuideDragHold {
  private timerId: number | null = null
  private guideId: string | null = null

  clear() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
    this.guideId = null
  }

  schedule(id: string, store: Store) {
    this.clear()
    this.guideId = id
    this.timerId = window.setTimeout(() => {
      if (this.guideId === id) {
        store.set("draggingGuideId", id)
      }
    }, GUIDE_DRAG_HOLD_MS)
  }
}
