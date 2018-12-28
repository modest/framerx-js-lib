import * as React from "react"

export interface WithCSSExport {
    _cssExport: (props: any) => React.CSSProperties
}

const key: keyof WithCSSExport = "_cssExport"

export function withCSSExport(target: any): target is WithCSSExport {
    return key in target
}
