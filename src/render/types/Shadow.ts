export interface Shadow {
    color: string
    x: number
    y: number
    blur: number
}

const shadowKeys: (keyof Shadow)[] = ["color", "x", "y", "blur"]

export namespace Shadow {
    export function is(shadow: any): shadow is Shadow {
        return shadow && shadowKeys.every(key => key in shadow)
    }
}

export interface BoxShadow {
    inset: boolean
    color: string
    x: number
    y: number
    blur: number
    spread: number
}

const boxShadowKeys: (keyof BoxShadow)[] = ["inset", "color", "x", "y", "blur", "spread"]

export namespace BoxShadow {
    export function is(shadow: any): shadow is BoxShadow {
        return shadow && boxShadowKeys.every(key => key in shadow)
    }

    export function toCSS(shadow: BoxShadow) {
        const inset = shadow.inset ? "inset " : ""
        return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
    }
}
