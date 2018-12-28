export interface BlendingProperties {
    blendingMode: BlendingMode
}

export type BlendingMode =
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"

export function collectBlendingFromProps(node: Partial<BlendingProperties>, style: React.CSSProperties) {
    if (!node.blendingMode || node.blendingMode === "normal") return
    style.mixBlendMode = node.blendingMode
}
