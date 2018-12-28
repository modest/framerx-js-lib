import * as React from "react"
import { OrderedSet } from "immutable"
import { isFiniteNumber } from "../utils/isFiniteNumber"
import { defaultFontDescriptor, fontSelectors, typefaceAliases, typefaces } from "../config/fonts"
import { ConvertColor } from "../types/Color"

// Style queries and changes

export const draftStyles = {
    font: {
        prefix: "FONT:",
        default: defaultFontDescriptor.selector,
        setCSS: getStyleForTypefaceOrSelector,
        fromCSS: getFontStyleStringFromCSS,
    },
    color: {
        prefix: "COLOR:",
        default: "rgb(0, 0, 0)",
        setCSS: (value: string, css: React.CSSProperties) => (css.WebkitTextFillColor = value),
        fromCSS: (css: CSSStyleDeclaration) => {
            let color
            if (css.webkitTextFillColor !== null) {
                color = css.webkitTextFillColor
            }
            if (css.color !== null) {
                color = css.color
            }
            if (color) {
                return ConvertColor.toRgbString(color)
            }
        },
    },
    size: {
        prefix: "SIZE:",
        default: 16,
        setCSS: (value: string | number, css: React.CSSProperties) => (css.fontSize = `${value}px`),
        fromCSS: (css: CSSStyleDeclaration) => getCSSFloatString(css, "fontSize"),
    },
    letterSpacing: {
        prefix: "LETTERSPACING:",
        default: 0,
        setCSS: (value: string | number, css: React.CSSProperties) => (css.letterSpacing = `${value}px`),
        fromCSS: (css: CSSStyleDeclaration) => getCSSFloatString(css, "letterSpacing", 1),
    },
    lineHeight: {
        prefix: "LINEHEIGHT:",
        default: 1.2,
        setCSS: (value: string | number, css: React.CSSProperties) => (css.lineHeight = `${value}`),
        fromCSS: (css: CSSStyleDeclaration) => getCSSFloatString(css, "lineHeight", 1),
    },
    align: {
        prefix: "ALIGN:",
        // Not handled by the style function
    },
}

const getCSSFloatString = (
    css: CSSStyleDeclaration,
    key: keyof CSSStyleDeclaration,
    fractionDigits?: number
): string | undefined => {
    if (css[key] === null) {
        return
    }
    const result = parseFloat(css[key])
    if (isNaN(result)) {
        return
    }
    return fractionDigits === undefined ? `${result}` : result.toFixed(fractionDigits)
}

interface Style<T> {
    prefix: string
    default: T
    setCSS: (value: T, css: React.CSSProperties) => void
}

function isStyle<T>(object: any): object is Style<T> {
    return object.setCSS !== undefined
}

export const draftStyleFunction = (autoSize: boolean) => {
    return (styles: OrderedSet<string>, styleSelection: boolean = true) => {
        const CSS: React.CSSProperties = {
            tabSize: 4,
        }

        if (autoSize) {
            CSS.whiteSpace = "pre"
        }

        for (const styleType in draftStyles) {
            const styleHandler = draftStyles[styleType]
            if (isStyle(styleHandler)) {
                styleHandler.setCSS(styleHandler.default, CSS)
            }
        }

        styles.forEach((style: string) => {
            if (style === "BOLD") {
                if (isFiniteNumber(CSS.fontWeight)) {
                    CSS.fontWeight = Math.max(
                        (CSS.fontWeight as number) + 300,
                        900
                    ) as any /* Assume we have a correct number */
                } else {
                    CSS.fontWeight = "bold"
                }
            } else if (style === "ITALIC") {
                CSS.fontStyle = "italic"
            } else if (style === "UNDERLINE") {
                CSS.textDecoration = "underline"
            } else if (style === "SELECTION" && styleSelection) {
                CSS.backgroundColor = "rgba(128,128,128,0.33)"
            } else {
                for (const styleType in draftStyles) {
                    const styleHandler = draftStyles[styleType]
                    if (!isStyle(styleHandler)) {
                        continue
                    }
                    if (style.startsWith(styleHandler.prefix)) {
                        styleHandler.setCSS(style.slice(styleHandler.prefix.length), CSS)
                        break
                    }
                }
            }
        })

        return CSS
    }
}

export function getStyleForTypefaceOrSelector(value: string, css: React.CSSProperties = {}): React.CSSProperties {
    let selectors: string[] = []
    let selector: string = ""

    // Styled text will have the alias set as "value". See if this is the case:
    if (value && value.match(/^__.*__$/)) {
        // The value is an alias. Resolve it to the full selector:
        value = typefaceAliases[value]
    }

    const members = typefaces.get(value)
    if (members && members.count()) {
        selector = members.toArray()[0].selector
        if (selector) {
            // An alias comes in at this level for the font selector. See if this is the case:
            if (selector.match(/^__.*__$/)) {
                // The value is an alias. Resolve it to the full selector:
                selector = typefaceAliases[selector]
            }

            selectors = selector.split("|")
        }
    }

    if (!selector) {
        selectors = value.split("|")
        const fontInfo = fontSelectors.get(value)
        if (fontInfo) {
            const [family, _, weight] = fontInfo
            if (selectors.indexOf(family) === -1 && weight !== undefined) {
                selectors.push(family)
                css.fontWeight = weight as any /* Assume we have a correct number */
            }
        }
    }

    if (value.startsWith(".SF")) {
        delete css.fontWeight
    }

    css.fontFamily = `"${selectors.join(`", "`)}"`

    // add monospace, sans-serif, or serif, based on some lists of known fonts
    if (value.match(/mono|consolas|console|courier|menlo|monaco/i)) {
        css.fontFamily += ", monospace"
    } else if (value.match(/serif|roboto.slab/i)) {
        css.fontFamily += ", serif"
    } else if (value.match(/sans|arial|roboto|sfui|futura|helvetica|grande|tahoma|verdana/i)) {
        css.fontFamily += ", sans-serif"
    } else {
        css.fontFamily += ", serif"
    }

    return css
}

export function getFontStyleStringFromCSS(css: CSSStyleDeclaration): string | undefined {
    if (css.fontFamily === null) {
        return
    }

    const familyMembers = css.fontFamily.split(/['"]?, ['"]?/)
    if (familyMembers.length === 0) {
        return
    }
    if (familyMembers.length > 1) {
        familyMembers.pop() // Remove fallback
    }
    familyMembers[0] = familyMembers[0].replace(/^['"]/, "")

    let selector = familyMembers.join("|")
    // Note: this is an assumption, because copying from another document with a missing font
    // might also end up here, that’s why we’ll keep it intact if we can’t find it.
    if (!fontSelectors.has(selector)) {
        familyMembers.pop()
        const possibleSelector = familyMembers.join("|")
        if (fontSelectors.has(possibleSelector)) {
            selector = possibleSelector
        }
    }

    // Resolve aliases
    const aliasSelector = Object.keys(typefaceAliases).find(alias => typefaceAliases[alias] === selector)
    if (aliasSelector) {
        selector = aliasSelector
    }

    // Clear font weight, if we have a selector this is already set and matches the weight
    // NOTE: This is a hack! It modifies the parameter passed in because it “knows” that font weight will
    // be processed after getting the font.
    const font = fontSelectors.get(selector)
    if (font !== undefined) {
        const weight = font[2]
        if (weight && `${weight}` === css.fontWeight) {
            css.fontWeight = "normal"
        }
    }

    return selector
}
