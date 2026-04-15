import { describe, expect, it } from "vitest"
import { getGuideDistance, getGuideRect } from "./guides"

describe("getGuideRect", () => {
  it("returns a vertical guide rect spanning the viewport height", () => {
    const rect = getGuideRect({ id: "1", orientation: "vertical", position: 100 })
    expect(rect.left).toBe(100)
    expect(rect.width).toBe(1)
    expect(rect.top).toBe(0)
    expect(rect.height).toBeGreaterThan(0)
  })

  it("returns a horizontal guide rect spanning the viewport width", () => {
    const rect = getGuideRect({ id: "1", orientation: "horizontal", position: 200 })
    expect(rect.top).toBe(200)
    expect(rect.height).toBe(1)
    expect(rect.left).toBe(0)
    expect(rect.width).toBeGreaterThan(0)
  })
})

describe("getGuideDistance", () => {
  it("returns x distance for vertical guide", () => {
    const guide = { id: "1", orientation: "vertical" as const, position: 100 }
    expect(getGuideDistance(guide, { x: 120, y: 50 })).toBe(20)
  })

  it("returns y distance for horizontal guide", () => {
    const guide = { id: "1", orientation: "horizontal" as const, position: 200 }
    expect(getGuideDistance(guide, { x: 50, y: 180 })).toBe(20)
  })
})
