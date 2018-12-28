import { modulate, isNumeric, numberFromString } from "./Utils"
import {
    rgbToRgb,
    rgbToHsl as rgbToHslConverter,
    hslToRgb,
    rgbToHex,
    rgbToHsluv,
    rgbToHsv,
    rgbaFromHusl,
    stringToObject,
    hsvToRgb,
} from "./converters"
import {
    IncomingColor,
    CompleteColor,
    ColorRGB,
    ColorHSL,
    ColorHSLA,
    ColorRGBA,
    ColorHSVA,
    ColorFormat,
    ColorMixModelType,
} from "./types"
import { cssNames } from "./CSSNames"
export { Color }

/**
 * @public
 */
interface Color {
    r: number
    g: number
    b: number
    h: number
    s: number
    l: number
    a: number
    roundA: number
    format: ColorFormat
    initialValue?: string
    isValid?: boolean
}

const cache = new Map<string, Color>()

/**
 * @public
 */
function Color(color: IncomingColor | Color | number, r?: number, g?: number, b?: number): Color {
    if (typeof color === "string") {
        let c = cache.get(color)
        if (c) return c

        c = createColor(color)
        if (c === undefined) return { ...Color("black"), isValid: false }
        cache.set(color, c) // TODO: should be frozen?
        return c
    }
    const created = createColor(color, r, g, b)
    return created !== undefined ? created : { ...Color("black"), isValid: false }
}

function createColor(color: IncomingColor | Color | number, r?: number, g?: number, b?: number): Color | undefined {
    if (color === "") return undefined
    const colorData = getCompleteColorStrategy(color, r, g, b)
    if (colorData) {
        return {
            r: colorData.r,
            g: colorData.g,
            b: colorData.b,
            a: colorData.a,
            h: colorData.h,
            s: colorData.s,
            l: colorData.l,
            initialValue: typeof color === "string" && colorData.format !== ColorFormat.HSV ? color : undefined,
            roundA: Math.round(100 * colorData.a) / 100,
            format: colorData.format,
        }
    } else {
        return undefined
    }
}

/**
 * @public
 */
namespace Color {
    export const inspect = function(color: Color, initialValue?: string): string {
        if (color.format === ColorFormat.HSL) {
            return `<${color.constructor.name} h:${color.h} s:${color.s} l:${color.l} a:${color.a}>`
        } else if (color.format === ColorFormat.HEX || color.format === ColorFormat.NAME) {
            return `<${color.constructor.name} "${initialValue}">`
        } else {
            return `<${color.constructor.name} r:${color.r} g:${color.g} b:${color.b} a:${color.a}>`
        }
    }

    export const isColorObject = function(color: any): color is object & Color {
        return (
            color &&
            typeof color !== "string" &&
            typeof color.r === "number" &&
            typeof color.g === "number" &&
            typeof color.b === "number" &&
            typeof color.h === "number" &&
            typeof color.s === "number" &&
            typeof color.l === "number" &&
            typeof color.a === "number" &&
            typeof color.roundA === "number" &&
            typeof color.format === "string"
        )
    }
    export const toString = function(color: Color): string {
        return Color.toRgbString(color)
    }

    export const toHex = function(color: Color, allow3Char: boolean = false): string {
        return rgbToHex(color.r, color.g, color.b, allow3Char)
    }

    export const toHexString = function(color: Color, allow3Char: boolean = false): string {
        return `#${Color.toHex(color, allow3Char)}`
    }

    export const toRgbString = function(color: Color): string {
        return color.a === 1
            ? "rgb(" + Math.round(color.r) + ", " + Math.round(color.g) + ", " + Math.round(color.b) + ")"
            : "rgba(" +
                  Math.round(color.r) +
                  ", " +
                  Math.round(color.g) +
                  ", " +
                  Math.round(color.b) +
                  ", " +
                  color.roundA +
                  ")"
    }

    export const toHusl = function(color: Color): ColorHSLA {
        return {
            ...rgbToHsluv(color.r, color.g, color.b),
            a: color.roundA,
        }
    }

    export const toHslString = function(color: Color): string {
        const hsl = Color.toHsl(color)
        const h = Math.round(hsl.h)
        const s = Math.round(hsl.s * 100)
        const l = Math.round(hsl.l * 100)
        return color.a === 1
            ? "hsl(" + h + ", " + s + "%, " + l + "%)"
            : "hsla(" + h + ", " + s + "%, " + l + "%, " + color.roundA + ")"
    }

    export const toHsv = function(color: Color): ColorHSVA {
        const hsv = rgbToHsv(color.r, color.g, color.b)
        return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: color.a }
    }
    export const toHsvString = function(color: Color): string {
        const hsv = rgbToHsv(color.r, color.g, color.b)
        const h = Math.round(hsv.h * 360)
        const s = Math.round(hsv.s * 100)
        const v = Math.round(hsv.v * 100)

        return color.a === 1
            ? "hsv(" + h + ", " + s + "%, " + v + "%)"
            : "hsva(" + h + ", " + s + "%, " + v + "%, " + color.roundA + ")"
    }

    export const toName = function(color: Color): string | false {
        if (color.a === 0) {
            return "transparent"
        }
        if (color.a < 1) {
            return false
        }
        const hex = rgbToHex(color.r, color.g, color.b, true)

        for (const key of Object.keys(cssNames)) {
            const value = cssNames[key]
            if (value === hex) {
                return key
            }
        }

        return false
    }

    export const toHsl = function(color: Color): ColorHSLA {
        return {
            h: Math.round(color.h),
            s: color.s,
            l: color.l,
            a: color.a,
        }
    }

    export const toRgb = function(color: Color): ColorRGBA {
        return {
            r: Math.round(color.r),
            g: Math.round(color.g),
            b: Math.round(color.b),
            a: color.a,
        }
    }

    export const brighten = function(color: Color, amount: number = 10): Color {
        const rgb = Color.toRgb(color)
        rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))))
        rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))))
        rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))))
        return Color(rgb)
    }
    export const lighten = function(color: Color, amount: number = 10): Color {
        const hsl = Color.toHsl(color)
        hsl.l += amount / 100
        hsl.l = Math.min(1, Math.max(0, hsl.l))
        return Color(hsl)
    }
    export const darken = function(color: Color, amount: number = 10): Color {
        const hsl = Color.toHsl(color)
        hsl.l -= amount / 100
        hsl.l = Math.min(1, Math.max(0, hsl.l))
        return Color(hsl)
    }
    export const desaturate = function(color: Color, amount: number = 10): Color {
        const hsl = Color.toHsl(color)
        hsl.s -= amount / 100
        hsl.s = Math.min(1, Math.max(0, hsl.s))
        return Color(hsl)
    }
    export const grayscale = function(color: Color): Color {
        return Color.desaturate(color, 100)
    }
    export const saturate = function(color: Color, amount: number = 10): Color {
        const hsl = Color.toHsl(color)
        hsl.s += amount / 100
        hsl.s = Math.min(1, Math.max(0, hsl.s))
        return Color(hsl)
    }

    export const hueRotate = function(color: Color, angle: number): Color {
        const hsl = Color.toHsl(color)
        hsl.h += angle
        hsl.h = hsl.h > 360 ? hsl.h - 360 : hsl.h
        return Color(hsl)
    }

    export const alpha = function(color: Color, a: number = 1): Color {
        return Color({
            r: color.r,
            g: color.g,
            b: color.b,
            a: a,
        })
    }

    export const transparent = function(color: Color): Color {
        return Color.alpha(color, 0)
    }

    export const multiplyAlpha = function(color: Color, a: number = 1): Color {
        return Color({
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a * a,
        })
    }

    export const interpolate = function(
        colorA: Color,
        colorB: Color,
        model: ColorMixModelType = ColorMixModelType.RGB
    ): ((progress: number) => Color) {
        if (!Color.isColorObject(colorA) || !Color.isColorObject(colorB)) {
            throw new TypeError("Both arguments for Color.interpolate must be Color objects")
        }
        return (progress: number): Color => {
            const color = Color.mix(colorA, colorB, progress, false, model) as Color
            return color
        }
    }

    export const isColorString = function(colorString: string | object): boolean {
        if (typeof colorString === "string") {
            return stringToObject(colorString) !== false
        }
        return false
    }

    export const mix = function(
        colorA: Color,
        colorB: Color,
        fraction = 0.5,
        limit = false,
        model: ColorMixModelType = ColorMixModelType.RGB
    ): Color | null {
        let result = null

        if (ColorMixModel.isRGB(model)) {
            // rgb model
            result = Color({
                r: modulate(fraction, [0, 1], [colorA.r, colorB.r], limit),
                g: modulate(fraction, [0, 1], [colorA.g, colorB.g], limit),
                b: modulate(fraction, [0, 1], [colorA.b, colorB.b], limit),
                a: modulate(fraction, [0, 1], [colorA.a, colorB.a], limit),
            })
        } else {
            let hslA, hslB
            if (ColorMixModel.isHSL(model)) {
                // hsl model
                hslA = Color.toHsl(colorA)
                hslB = Color.toHsl(colorB)
            } else {
                // husl model
                hslA = Color.toHusl(colorA)
                hslB = Color.toHusl(colorB)
            }

            if (hslA.s === 0) {
                hslA.h = hslB.h
            } else if (hslB.s === 0) {
                hslB.h = hslA.h
            }

            const fromH = hslA.h
            const toH = hslB.h
            let deltaH = toH - fromH

            if (deltaH > 180) {
                deltaH = toH - 360 - fromH
            } else if (deltaH < -180) {
                deltaH = toH + 360 - fromH
            }

            const tween = {
                h: modulate(fraction, [0, 1], [fromH, fromH + deltaH], limit),
                s: modulate(fraction, [0, 1], [hslA.s, hslB.s], limit),
                l: modulate(fraction, [0, 1], [hslA.l, hslB.l], limit),
                a: modulate(fraction, [0, 1], [colorA.a, colorB.a], limit),
            }

            if (ColorMixModel.isHSL(model)) {
                // hsl model
                result = Color(tween)
            } else {
                // husl model
                result = Color(rgbaFromHusl(tween.h, tween.s, tween.l, tween.a))
            }
        }

        return result
    }
    export const random = function(a = 1): Color {
        function gen() {
            return Math.floor(Math.random() * 255)
        }
        return Color("rgba(" + gen() + ", " + gen() + ", " + gen() + ", " + a + ")")
    }
    export const grey = function(g: number = 0.5, a: number = 1) {
        g = Math.floor(g * 255)
        return Color("rgba(" + g + ", " + g + ", " + g + ", " + a + ")")
    }
    export const gray = Color.grey

    export const isColor = function(color: string | Color) {
        if (typeof color === "string") {
            return Color.isColorString(color)
        } else {
            return Color.isColorObject(color)
        }
    }

    export const rgbToHsl = function(r: number, g: number, b: number): ColorHSL {
        return rgbToHslConverter(r, g, b)
    }

    export const isValidColorProperty = function(name: string, value: string): boolean {
        const isColorKey = name.toLowerCase().slice(-5) === "color" || (name === "fill" || name === "stroke")
        if (isColorKey && typeof value === "string" && Color.isColorString(value)) {
            return true
        }
        return false
    }

    // Calculates the color difference using Euclidean distance fitting human perception
    // https://en.wikipedia.org/wiki/Color_difference#Euclidean
    // Returns a value between 0 and 765
    export const difference = function(colorA: Color, colorB: Color): number {
        const _r = (colorA.r + colorB.r) / 2
        const deltaR = colorA.r - colorB.r
        const deltaG = colorA.g - colorB.g
        const deltaB = colorA.b - colorB.b
        const deltaR_2 = Math.pow(deltaR, 2)
        const deltaG_2 = Math.pow(deltaG, 2)
        const deltaB_2 = Math.pow(deltaB, 2)
        return Math.sqrt(2 * deltaR_2 + 4 * deltaG_2 + 3 * deltaB_2 + (_r * (deltaR_2 - deltaB_2)) / 256)
    }

    export const equal = function(colorA: Color, colorB: Color, tolerance = 0.1): boolean {
        if (Math.abs(colorA.r - colorB.r) >= tolerance) {
            return false
        }
        if (Math.abs(colorA.g - colorB.g) >= tolerance) {
            return false
        }
        if (Math.abs(colorA.b - colorB.b) >= tolerance) {
            return false
        }
        if (Math.abs(colorA.a - colorB.a) >= tolerance) {
            return false
        }
        return true
    }
}

const ColorMixModel = {
    isRGB(colorModel: ColorMixModelType) {
        return colorModel === ColorMixModelType.RGB || colorModel === ColorMixModelType.RGBA
    },
    isHSL(colorModel: ColorMixModelType) {
        return colorModel === ColorMixModelType.HSL || colorModel === ColorMixModelType.HSLA
    },
}

// helpers

function getCompleteColorStrategy(
    colorOrR: IncomingColor | number,
    g?: number,
    b?: number,
    a: number = 1
): CompleteColor | undefined {
    let completeColor: CompleteColor | undefined
    // RGB arguments have higher priority
    if (
        typeof colorOrR === "number" &&
        !Number.isNaN(colorOrR) &&
        typeof g === "number" &&
        !Number.isNaN(g) &&
        typeof b === "number" &&
        !Number.isNaN(b)
    ) {
        // color used as red - Color(255, 255, 255)
        const _r = colorOrR
        const _g = g!
        const _b = b!
        const _a = a
        completeColor = getCompleteColorFromRGB({ r: _r, g: _g, b: _b, a: _a })
    } else if (typeof colorOrR === "string") {
        // valid CSS color (including functions)
        completeColor = getCompleteColorFromString(colorOrR)
    } else if (typeof colorOrR === "object") {
        if (colorOrR.hasOwnProperty("r") && colorOrR.hasOwnProperty("g") && colorOrR.hasOwnProperty("b")) {
            completeColor = getCompleteColorFromRGB(colorOrR as ColorRGB)
        } else {
            completeColor = getCompleteColorFromHSL(colorOrR as ColorHSL)
        }
    }

    return completeColor
}

function getCompleteColorFromString(color: string): CompleteColor | undefined {
    const result = stringToObject(color)
    if (result) {
        if (result.format === ColorFormat.HSL) {
            return getCompleteColorFromHSL(result as ColorHSLA)
        } else if (result.format === ColorFormat.HSV) {
            return getCompleteColorFromHSV(result as ColorHSVA)
        } else {
            return getCompleteColorFromRGB(result as ColorRGBA)
        }
    }
}

function getCompleteColorFromHSV(color: { h: number; s: number; v: number; a?: number }): CompleteColor | undefined {
    const rgb: ColorRGB = hsvToRgb(color.h, color.s, color.v)
    const hsl: ColorHSL = rgbToHslConverter(rgb.r, rgb.g, rgb.b)
    return {
        ...hsl,
        ...rgb,
        format: ColorFormat.RGB,
        a: color.a !== undefined ? correctAlpha(color.a) : 1,
    }
}

function getCompleteColorFromRGB(color: { r: number; g: number; b: number; a?: number }): CompleteColor | undefined {
    const rgb: ColorRGB = rgbToRgb(color.r, color.g, color.b)
    const hsl: ColorHSL = rgbToHslConverter(rgb.r, rgb.g, rgb.b)
    return {
        ...hsl,
        ...rgb,
        format: ColorFormat.RGB,
        a: color.a !== undefined ? correctAlpha(color.a) : 1,
    }
}

function getCompleteColorFromHSL(color: { h: number; s: number; l: number; a?: number }): CompleteColor {
    let h: number
    let s: number
    let l: number
    let rgb: ColorRGB = { r: 0, g: 0, b: 0 }
    let hsl: ColorHSL = { h: 0, s: 0, l: 0 }
    h = isNumeric(color.h as number) ? color.h : 0
    h = (h + 360) % 360
    s = isNumeric(color.s as number) ? (color.s as number) : 1
    if (typeof color.s === "string") {
        s = numberFromString(color.s as string)!
    }
    l = isNumeric(color.l as number) ? (color.l as number) : 0.5
    if (typeof color.l === "string") {
        l = numberFromString(color.l as string)!
    }
    rgb = hslToRgb(h, s, l)
    hsl = {
        h: h,
        s: s,
        l: l,
    }

    return {
        ...rgb,
        ...hsl,
        a: color.a === undefined ? 1 : color.a,
        format: ColorFormat.HSL,
    }
}
function correctAlpha(a: string | number) {
    a = parseFloat(a as string)
    if (a < 0) {
        a = 0
    }
    if (isNaN(a) || a > 1) {
        a = 1
    }
    return a
}
