import { afterEach, describe, expect, it } from "vitest"
import { createMesurer } from "./mesurer"
import type { MesurerInstance } from "./mesurer"

describe("createMesurer", () => {
  let instance: MesurerInstance | null = null

  afterEach(() => {
    instance?.destroy()
    instance = null
  })

  it("returns an object with destroy, enable, disable, toggle", () => {
    instance = createMesurer()
    expect(typeof instance.destroy).toBe("function")
    expect(typeof instance.enable).toBe("function")
    expect(typeof instance.disable).toBe("function")
    expect(typeof instance.toggle).toBe("function")
  })

  it("appends a root element to document.body", () => {
    const before = document.body.children.length
    instance = createMesurer()
    expect(document.body.children.length).toBeGreaterThan(before)
  })

  it("destroy() removes the root element", () => {
    const before = document.body.children.length
    instance = createMesurer()
    instance.destroy()
    instance = null
    expect(document.body.children.length).toBe(before)
  })
})
