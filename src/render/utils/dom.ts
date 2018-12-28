import { Rect } from "../types/Rect"
import { Point } from "../types/Point"

export const ready = (callback: Function) => {
    switch (document.readyState) {
        case "loading":
            document.addEventListener("DOMContentLoaded", () => {
                window.setTimeout(callback)
            })
            break
        case "interactive":
        case "complete":
            callback()
            break
    }
}

export const frameFromElement = (element: Element): Rect => {
    const frame = Rect.fromRect(element.getBoundingClientRect())
    frame.x = frame.x + window.scrollX
    frame.y = frame.y + window.scrollY
    return frame
}

export const frameFromElements = (elements: Element[]): Rect => {
    return Rect.merge(...elements.map(frameFromElement))
}

/** Returns a page frame for the given element */
export const convertToPageFrame = (frame: Rect, element: Element): Rect => {
    const point = convertToPagePoint(frame, element)
    return {
        x: point.x,
        y: point.y,
        width: frame.width,
        height: frame.height,
    }
}

/** Returns a parent frame for the given element */
export const convertFromPageFrame = (frame: Rect, element: Element): Rect => {
    const point = convertFromPagePoint(frame, element)
    return {
        x: point.x,
        y: point.y,
        width: frame.width,
        height: frame.height,
    }
}

export const getPageFrame = (element: Element): Rect => {
    const rect = element.getBoundingClientRect()
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
    }
}

export const fromEventForPage = (event: MouseEvent): Point => {
    return {
        x: event.pageX,
        y: event.pageY,
    }
}

export const fromEventForClient = (event: MouseEvent): Point => {
    return {
        x: event.clientX,
        y: event.clientY,
    }
}

export const convertToPagePoint = (point: Point, element: Element): Point => {
    const frame = getPageFrame(element)
    return {
        x: point.x + frame.x,
        y: point.y + frame.y,
    }
}

export const convertFromPagePoint = (point: Point, element: Element): Point => {
    const frame = getPageFrame(element)
    return {
        x: point.x - frame.x,
        y: point.y - frame.y,
    }
}

export const dispatchKeyDownEvent = (
    keyCode: number,
    options: Partial<KeyboardEventInit & { keyIdentifier: string }> = {}
) => {
    const keyboardEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        keyCode: keyCode,
        ...options,
    } as KeyboardEventInit)
    const activeElement = document.activeElement
    if (activeElement) {
        activeElement.dispatchEvent(keyboardEvent)
    }
}

export const DOM = {
    frameFromElement,
    frameFromElements,
    convertToPageFrame,
    convertFromPageFrame,
    getPageFrame,
    fromEventForPage,
    fromEventForClient,
    convertToPagePoint,
    convertFromPagePoint,
}
