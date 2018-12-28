// import * as _ from "lodash"

// import { GestureEvents } from "../Events"

// export const isGestureEvent = (event: string) => {
// 	return _.includes(_.values(GestureEvents), event)
// }

// export const interactiveEvents = (events: string[]) => {
// 	return events.filter(event => {

// 		if (Utils.dom.validEvent("div", event)) { return true }
// 		if (isGestureEvent(event)) { return true }

// 		return false
// 	})
// }

export interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
}

export function pointForEvent(event: EventLike, customTarget: EventTarget | null = null): { x: number; y: number } {
    let target: HTMLElement | undefined

    if (customTarget instanceof HTMLElement) {
        target = customTarget
    }

    if (!target && event.target instanceof HTMLElement) {
        target = event.target
    }

    if (!target) {
        return { x: event.pageX, y: event.pageY }
    }

    // Safari
    if (window.webkitConvertPointFromPageToNode) {
        let webkitPoint = new WebKitPoint(event.pageX, event.pageY)
        webkitPoint = window.webkitConvertPointFromPageToNode(target, webkitPoint)
        return { x: webkitPoint.x, y: webkitPoint.y }
    }

    // const t1 = performance.now()

    // All other browsers
    // TODO: This does not work with rotate yet
    // TODO: This doens't work with Chrome if the target is the Body tag.
    const rect = target.getBoundingClientRect()

    const scale = {
        x: parseFloat(target.style.width || "0") / rect.width,
        y: parseFloat(target.style.height || "0") / rect.height,
    }

    const point = {
        x: scale.x * (event.pageX - rect.left - target.clientLeft + target.scrollLeft),
        y: scale.y * (event.pageY - rect.top - target.clientTop + target.scrollTop),
    }

    return point
}
