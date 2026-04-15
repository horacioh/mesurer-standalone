import { describe, expect, it } from "vitest"
import { cn, createId, formatValue } from "./utils"

describe("formatValue", () => {
  it("rounds numbers", () => {
    expect(formatValue(3.7)).toBe(4)
    expect(formatValue(3.2)).toBe(3)
    expect(formatValue(0)).toBe(0)
  })
})

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c")
  })

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})

describe("createId", () => {
  it("returns a string", () => {
    expect(typeof createId()).toBe("string")
  })

  it("returns unique values", () => {
    expect(createId()).not.toBe(createId())
  })
})
