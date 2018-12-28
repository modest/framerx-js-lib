import { getURLs } from "./getURLs"
import { isArray } from "util"

function joinPaths(paths: string[]): string {
    let res = ""
    for (const p of paths) {
        if (!p) continue
        if (res.length > 0 && !res.endsWith("/")) {
            res += "/"
        }
        if (isArray(p)) {
            res += joinPaths(p as any)
        } else {
            res += encodeURIComponent(p).replace(/%2F/g, "/")
        }
    }
    return res
}

function calculateServerUrl(): string {
    const href = window.location.href

    // find project URL in preview/vekter url
    const http = href.lastIndexOf("http:")
    if (http > 0) {
        try {
            return new URL(href.slice(http)).origin
        } catch (e) {}
    }

    // try getURLs
    try {
        return new URL(getURLs().projectURL).origin
    } catch (e) {}

    // try the page origin
    if (href.startsWith("http://") || href.startsWith("https://")) {
        return new URL(href).origin
    }

    const fallback = "http://localhost:4567"
    // tslint:disable-next-line:no-console
    console.warn("Unable to figure out server base address, using fallback:", fallback)
    return fallback
}

let __cachedWebBase: string | null = null
function cachedServerUrl(): string {
    if (!__cachedWebBase) {
        __cachedWebBase = calculateServerUrl()
    }
    return __cachedWebBase
}

/**
 * @internal
 */
export function serverURL(...paths: string[]) {
    const path = joinPaths(paths)
    const server = cachedServerUrl()

    if (path.startsWith("/")) {
        return server + path
    }
    return server + "/" + path
}
