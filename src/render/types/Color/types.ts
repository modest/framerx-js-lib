// Used for inspection
export enum ColorFormat {
    RGB = "rgb",
    HSL = "hsl",
    HSV = "hsv",
    HEX = "hex",
    NAME = "name",
}

export interface ColorRGB {
    r: number
    g: number
    b: number
}

export type ColorRGBA = ColorRGB & {
    a: number
}

export type ColorTypeRGBA = ColorRGBA & {
    format: ColorFormat
}

export interface ColorHSL {
    h: number
    s: number
    l: number
}

export type ColorHSLA = ColorHSL & {
    a: number
}

export type ColorTypeHSLA = ColorHSLA & {
    format: ColorFormat
}

export interface ColorHSV {
    h: number
    s: number
    v: number
}

export type ColorHSVA = ColorHSV & {
    a: number
}

export type ColorTypeHSVA = ColorHSVA & {
    format: ColorFormat
}

export interface CompleteColor {
    format: ColorFormat
    r: number
    g: number
    b: number
    h: number
    s: number
    l: number
    a: number
}

export type IncomingColor = ColorRGB | ColorHSL | ColorRGBA | ColorHSLA | string

export enum ColorMixModelType {
    RGB = "rgb",
    RGBA = "rgba",
    HSL = "hsl",
    HSLA = "hsla",
    HUSL = "husl",
}
