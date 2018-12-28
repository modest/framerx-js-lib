export type Overflow = "visible" | "hidden" | "scroll" | "auto"

export interface OverflowProperties {
    overflow: Overflow
}

export function collectOverflowFromProps(props: Partial<OverflowProperties>, style: React.CSSProperties) {
    if (props.overflow) {
        style.overflow = props.overflow
    }
}
