import { Color } from "../types/Color"

export interface TextColorProperties {
    color: Color | string
}

export function collectTextColorFromProps(props: Partial<TextColorProperties>, style: React.CSSProperties) {
    const { color } = props
    if (typeof color === "string") {
        style.color = color
    } else if (Color.isColorObject(color)) {
        style.color = color.initialValue || Color.toRgbString(color)
    }
}
