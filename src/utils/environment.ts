export const isWebKit = () => window["WebKitCSSMatrix"] !== undefined && !isEdge()

export const webkitVersion = () => {
    let version = -1
    const regexp = /AppleWebKit\/([\d.]+)/
    const result = regexp.exec(navigator.userAgent)
    if (result) {
        version = parseFloat(result[1])
    }
    return version
}

export const isChrome = () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)

export const isSafari = () => /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)

export const isFirefox = () => /^Mozilla.*Firefox\/\d+\.\d+$/.test(navigator.userAgent)

export const isEdge = () => /Edge/.test(navigator.userAgent)

export const isAndroid = () => /(android)/i.test(navigator.userAgent)

export const isIOS = () => /(iPhone|iPod|iPad)/i.test(navigator.platform)

export const isMacOS = () => /Mac/.test(navigator.platform)

export const isWindows = () => /Win/.test(navigator.platform)

export const isTouch = () => window.ontouchstart === null && window.ontouchmove === null && window.ontouchend === null

export const isDesktop = () => deviceType() === "desktop"

export const isPhone = () => deviceType() === "phone"

export const isTablet = () => deviceType() === "tablet"

export const isMobile = () => isPhone() || isTablet()

export const isFileUrl = (url: string) => url.startsWith("file://")

export const isDataUrl = (url: string) => url.startsWith("data:")

export const isRelativeUrl = (url: string) => !/^([a-zA-Z]{1,8}:\/\/).*$/.test(url)

export const isLocalServerUrl = (url: string) =>
    /[a-zA-Z]{1,8}:\/\/127\.0\.0\.1/.test(url) || /[a-zA-Z]{1,8}:\/\/localhost/.test(url)

export const isLocalUrl = (url: string) => {
    if (isFileUrl(url)) return true
    if (isLocalServerUrl(url)) return true
    return false
}

export const isLocalAssetUrl = (url: string, baseUrl: string) => {
    if (baseUrl === null) baseUrl = window.location.href
    if (isDataUrl(url)) return false
    if (isLocalUrl(url)) return true
    if (isRelativeUrl(url) && isLocalUrl(baseUrl)) return true
    return false
}

export const devicePixelRatio = () => window.devicePixelRatio

export const isJP2Supported = function() {
    if (isFirefox()) return false
    return isWebKit() && !isChrome()
}

export const isWebPSupported = () => isChrome()

export const deviceType = () => {
    // https://github.com/jeffmcmahan/device-detective/blob/master/bin/device-detect.js
    if (/(tablet)|(iPad)|(Nexus 9)/i.test(navigator.userAgent)) return "tablet"
    if (/(mobi)/i.test(navigator.userAgent)) return "phone"
    return "desktop"
}

export const deviceFont = (os?: "macos" | "ios" | "android" | "windows") => {
    // https://github.com/jonathantneal/system-font-css

    if (!os) {
        if (isMacOS()) os = "macos"
        if (isIOS()) os = "ios"
        if (isAndroid()) os = "android"
        if (isWindows()) os = "windows"
    }

    const fonts = {
        apple: "-apple-system, BlinkMacSystemFont, SF UI Text, Helvetica Neue",
        google: "Roboto, Helvetica Neue",
        microsoft: "Segoe UI, Helvetica Neue",
    }

    if (os === "macos") return fonts.apple
    if (os === "ios") return fonts.apple
    if (os === "android") return fonts.google
    if (os === "windows") return fonts.microsoft

    return fonts.apple
}
