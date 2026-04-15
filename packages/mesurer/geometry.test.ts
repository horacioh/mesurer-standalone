import { describe, expect, it } from "vitest"
import {
  clamp,
  denormalizeRect,
  getDistanceToRect,
  getRectFromPoints,
  getViewportSize,
  intersectionArea,
  normalizeRect,
  rectAlmostEqual,
  rectArea,
  rectsOverlap,
} from "./geometry"

describe("getViewportSize", () => {
  it("returns width and height", () => {
    const size = getViewportSize()
    expect(size).toHaveProperty("width")
    expect(size).toHaveProperty("height")
    expect(size.width).toBeGreaterThan(0)
    expect(size.height).toBeGreaterThan(0)
  })
})

describe("normalizeRect / denormalizeRect", () => {
  it("round-trips correctly", () => {
    const viewport = { width: 800, height: 600 }
    const rect = { left: 100, top: 200, width: 300, height: 150 }
    const normalized = normalizeRect(rect, viewport)
    const restored = denormalizeRect(normalized, viewport)
    expect(restored.left).toBeCloseTo(rect.left)
    expect(restored.top).toBeCloseTo(rect.top)
    expect(restored.width).toBeCloseTo(rect.width)
    expect(restored.height).toBeCloseTo(rect.height)
  })

  it("normalizes to 0-1 range", () => {
    const viewport = { width: 1000, height: 500 }
    const rect = { left: 500, top: 250, width: 100, height: 50 }
    const normalized = normalizeRect(rect, viewport)
    expect(normalized.left).toBe(0.5)
    expect(normalized.top).toBe(0.5)
    expect(normalized.width).toBe(0.1)
    expect(normalized.height).toBe(0.1)
  })
})

describe("getRectFromPoints", () => {
  it("creates rect from two points", () => {
    const rect = getRectFromPoints({ x: 10, y: 20 }, { x: 50, y: 80 })
    expect(rect).toEqual({ left: 10, top: 20, width: 40, height: 60 })
  })

  it("handles reversed points", () => {
    const rect = getRectFromPoints({ x: 50, y: 80 }, { x: 10, y: 20 })
    expect(rect).toEqual({ left: 10, top: 20, width: 40, height: 60 })
  })
})

describe("clamp", () => {
  it("clamps below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it("clamps above max", () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it("returns value when in range", () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
})

describe("rectsOverlap", () => {
  it("returns true for overlapping rects", () => {
    const a = { left: 0, top: 0, width: 10, height: 10 }
    const b = { left: 5, top: 5, width: 10, height: 10 }
    expect(rectsOverlap(a, b)).toBe(true)
  })

  it("returns false for non-overlapping rects", () => {
    const a = { left: 0, top: 0, width: 10, height: 10 }
    const b = { left: 20, top: 20, width: 10, height: 10 }
    expect(rectsOverlap(a, b)).toBe(false)
  })

  it("returns false for touching rects (no overlap)", () => {
    const a = { left: 0, top: 0, width: 10, height: 10 }
    const b = { left: 10, top: 0, width: 10, height: 10 }
    expect(rectsOverlap(a, b)).toBe(false)
  })
})

describe("rectArea", () => {
  it("computes area", () => {
    expect(rectArea({ left: 0, top: 0, width: 5, height: 8 })).toBe(40)
  })
})

describe("intersectionArea", () => {
  it("computes intersection area of overlapping rects", () => {
    const a = { left: 0, top: 0, width: 10, height: 10 }
    const b = { left: 5, top: 5, width: 10, height: 10 }
    expect(intersectionArea(a, b)).toBe(25)
  })

  it("returns 0 for non-overlapping rects", () => {
    const a = { left: 0, top: 0, width: 10, height: 10 }
    const b = { left: 20, top: 20, width: 10, height: 10 }
    expect(intersectionArea(a, b)).toBe(0)
  })
})

describe("rectAlmostEqual", () => {
  it("returns true for nearly equal rects", () => {
    const a = { left: 10, top: 20, width: 30, height: 40 }
    const b = { left: 10.1, top: 20.1, width: 30.1, height: 40.1 }
    expect(rectAlmostEqual(a, b)).toBe(true)
  })

  it("returns false for different rects", () => {
    const a = { left: 10, top: 20, width: 30, height: 40 }
    const b = { left: 15, top: 20, width: 30, height: 40 }
    expect(rectAlmostEqual(a, b)).toBe(false)
  })
})

describe("getDistanceToRect", () => {
  it("returns 0 for point inside rect", () => {
    const rect = { left: 0, top: 0, width: 10, height: 10 }
    expect(getDistanceToRect({ x: 5, y: 5 }, rect)).toBe(0)
  })

  it("returns horizontal distance for point to the left", () => {
    const rect = { left: 10, top: 0, width: 10, height: 10 }
    expect(getDistanceToRect({ x: 5, y: 5 }, rect)).toBe(5)
  })

  it("returns diagonal distance for corner point", () => {
    const rect = { left: 10, top: 10, width: 10, height: 10 }
    expect(getDistanceToRect({ x: 7, y: 7 }, rect)).toBeCloseTo(Math.hypot(3, 3))
  })
})
