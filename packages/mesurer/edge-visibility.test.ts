import { describe, expect, it } from "vitest"
import { getEdgeVisibilityForRects } from "./edge-visibility"

describe("getEdgeVisibilityForRects", () => {
  it("single rect: all edges visible", () => {
    const result = getEdgeVisibilityForRects([{ left: 10, top: 10, width: 100, height: 50 }])
    expect(result).toEqual([{ top: true, right: true, bottom: true, left: true }])
  })

  it("two non-overlapping rects: all edges visible", () => {
    const result = getEdgeVisibilityForRects([
      { left: 0, top: 0, width: 10, height: 10 },
      { left: 50, top: 50, width: 10, height: 10 },
    ])
    expect(result[0]).toEqual({ top: true, right: true, bottom: true, left: true })
    expect(result[1]).toEqual({ top: true, right: true, bottom: true, left: true })
  })

  it("two adjacent rects: shared edges hidden", () => {
    const result = getEdgeVisibilityForRects([
      { left: 0, top: 0, width: 10, height: 10 },
      { left: 10, top: 0, width: 10, height: 10 },
    ])
    expect(result[0].right).toBe(false)
    expect(result[1].left).toBe(false)
    // non-shared edges stay visible
    expect(result[0].left).toBe(true)
    expect(result[1].right).toBe(true)
  })

  it("vertically adjacent rects: shared edges hidden", () => {
    const result = getEdgeVisibilityForRects([
      { left: 0, top: 0, width: 10, height: 10 },
      { left: 0, top: 10, width: 10, height: 10 },
    ])
    expect(result[0].bottom).toBe(false)
    expect(result[1].top).toBe(false)
  })
})
