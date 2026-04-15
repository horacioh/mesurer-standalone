import { describe, expect, it } from "vitest"
import * as constants from "./constants"

describe("constants", () => {
  const entries = Object.entries(constants)

  it("exports constants", () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it.each(entries)("%s is a positive number", (_name, value) => {
    expect(typeof value).toBe("number")
    expect(value).toBeGreaterThan(0)
  })
})
