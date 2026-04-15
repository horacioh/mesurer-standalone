import { cn } from "./utils"

export function el(
  tag: string,
  attrs?: Record<string, any>,
  ...children: (HTMLElement | string | null | undefined)[]
): HTMLElement {
  const element = document.createElement(tag)
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        element.className = value
      } else if (key === "style" && typeof value === "object") {
        for (const [prop, val] of Object.entries(value)) {
          if (val === undefined || val === null) continue
          ;(element.style as any)[prop] = typeof val === "number" ? `${val}px` : val
        }
      } else if (key.startsWith("on") && typeof value === "function") {
        element.addEventListener(key.slice(2).toLowerCase(), value)
      } else if (value !== undefined && value !== null && value !== false) {
        element.setAttribute(key, String(value))
      }
    }
  }
  for (const child of children) {
    if (child == null) continue
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  }
  return element
}

export function setStyles(element: HTMLElement, styles: Record<string, string | number | undefined>) {
  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined) {
      element.style.removeProperty(key)
    } else {
      ;(element.style as any)[key] = typeof value === "number" ? `${value}px` : value
    }
  }
}

export function createMeasureTag(className: string, style: Record<string, any>, text: string): HTMLElement {
  return el(
    "div",
    {
      className: cn(
        "pointer-events-none absolute rounded px-1 py-0.5 text-[10px] text-ink-50 tabular-nums select-none",
        className,
      ),
      style,
    },
    text,
  )
}

// SVG icon strings
const ICON_VIEWBOX = "0 0 256 256"

function svgIcon(size: number, path: string, className?: string): HTMLElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", String(size))
  svg.setAttribute("height", String(size))
  svg.setAttribute("viewBox", ICON_VIEWBOX)
  svg.setAttribute("fill", "currentColor")
  if (className) svg.setAttribute("class", className)
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path")
  p.setAttribute("d", path)
  svg.appendChild(p)
  // Wrap in a div to return HTMLElement
  const wrapper = document.createElement("span")
  wrapper.style.display = "inline-flex"
  wrapper.appendChild(svg)
  return wrapper
}

const CURSOR_PATH =
  "M166.59,134.1a1.91,1.91,0,0,1-.55-1.79,2,2,0,0,1,1.08-1.42l46.25-17.76.24-.1A14,14,0,0,0,212.38,87L52.29,34.7A13.95,13.95,0,0,0,34.7,52.29L87,212.38a13.82,13.82,0,0,0,12.6,9.6c.23,0,.46,0,.69,0A13.84,13.84,0,0,0,113,213.61a2.44,2.44,0,0,0,.1-.24l17.76-46.25a2,2,0,0,1,3.21-.53l51.31,51.31a14,14,0,0,0,19.8,0l12.69-12.69a14,14,0,0,0,0-19.8Zm42.82,62.63-12.68,12.68a2,2,0,0,1-2.83,0L142.59,158.1a14,14,0,0,0-22.74,4.32,2.44,2.44,0,0,0-.1.24L102,208.91a2,2,0,0,1-3.61-.26L46.11,48.57a1.87,1.87,0,0,1,.47-2A1.92,1.92,0,0,1,47.93,46a2.22,2.22,0,0,1,.64.1L208.65,98.38a2,2,0,0,1,.26,3.61l-46.25,17.76-.24.1a14,14,0,0,0-4.32,22.74h0l51.31,51.31A2,2,0,0,1,209.41,196.73Z"
const RULER_PATH =
  "M233.91,74.79,181.22,22.1a14,14,0,0,0-19.8,0L22.09,161.41a14,14,0,0,0,0,19.8L74.78,233.9a14,14,0,0,0,19.8,0L233.91,94.59A14,14,0,0,0,233.91,74.79ZM225.42,86.1,86.1,225.41h0a2,2,0,0,1-2.83,0L30.58,172.73a2,2,0,0,1,0-2.83L64,136.48l27.76,27.76a6,6,0,1,0,8.48-8.48L72.48,128,96,104.48l27.76,27.76a6,6,0,0,0,8.48-8.48L104.48,96,128,72.49l27.76,27.75a6,6,0,0,0,8.48-8.48L136.49,64,169.9,30.59a2,2,0,0,1,2.83,0l52.69,52.68A2,2,0,0,1,225.42,86.1Z"
const CARET_DOWN_PATH =
  "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
const CHECK_PATH =
  "M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"
const MINUS_PATH = "M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"

export function cursorIcon(size: number) {
  return svgIcon(size, CURSOR_PATH)
}
export function rulerIcon(size: number, className?: string) {
  return svgIcon(size, RULER_PATH, className)
}
export function caretDownIcon(size: number) {
  return svgIcon(size, CARET_DOWN_PATH)
}
export function checkIcon(size: number, className?: string) {
  return svgIcon(size, CHECK_PATH, className)
}
export function minusIcon(size: number, className?: string) {
  return svgIcon(size, MINUS_PATH, className)
}
