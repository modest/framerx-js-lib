import { Color } from "./Color"
import { ColorHSV, ColorHSVA, ColorRGB, ColorRGBA, ColorHSLA } from "./types"
import { hsvToStr, stringToObject } from "./converters"

/**
 * @beta
 */
export namespace ConvertColor {
    export function hueRotate(color: string, angle: number) {
        return Color.toHslString(Color.hueRotate(Color(color), angle))
    }

    export function setAlpha(color: string, alpha: number) {
        return Color.toRgbString(Color.alpha(Color(color), alpha))
    }

    export function getAlpha(color: string) {
        const obj = stringToObject(color)
        return obj ? obj.a : 1
    }

    export function multiplyAlpha(color: string, alpha: number) {
        return Color.toRgbString(Color.multiplyAlpha(Color(color), alpha))
    }

    export function toHex(color: string) {
        return Color.toHexString(Color(color)).toUpperCase()
    }

    export function toRgb(color: string) {
        return Color.toRgb(Color(color))
    }

    export function toRgbString(color: string) {
        return Color.toRgbString(Color(color))
    }

    export function toHSV(color: string) {
        return Color.toHsv(Color(color))
    }

    export function toHSL(color: string): ColorHSLA {
        return Color.toHsl(Color(color))
    }

    export function toHslString(color: string) {
        return Color.toHslString(Color(color))
    }

    export function toHsvString(color: string) {
        return Color.toHsvString(Color(color))
    }

    export function hsvToHSLString(hsv: ColorHSV | ColorHSVA): string {
        return Color.toHslString(Color(hsvToStr(hsv.h, hsv.s, hsv.v, (hsv as ColorHSVA).a)))
    }

    export function hsvToString(hsv: ColorHSV | ColorHSVA): string {
        return hsvToStr(hsv.h, hsv.s, hsv.v)
    }

    export function rgbaToString(color: ColorRGB | ColorRGBA) {
        return Color.toRgbString(Color(color))
    }

    export function toColorPickerSquare(h: number) {
        return Color.toRgbString(Color({ h, s: 1, l: 0.5, a: 1 }))
    }

    export function isValid(color: string): boolean {
        return Color(color).isValid !== false
    }

    export function equals(a: Color | string, b: Color | string): boolean {
        if (typeof a === "string") {
            a = Color(a)
        }
        if (typeof b === "string") {
            b = Color(b)
        }
        return Color.equal(a, b)
    }

    export function toHexOrRgbaString(input: string) {
        const color = Color(input)
        return color.a !== 1 ? Color.toRgbString(color) : Color.toHexString(color)
    }
}
