import * as React from "react"
import * as ReactDOM from "react-dom"
import { isEqual } from "../utils/isEqual"
import { RenderEnvironment, RenderTarget } from "../types/RenderEnvironment"

/** @public */
export interface IdentityProps extends React.Props<any> {
    id?: string
}

/** @public */
export interface LayerProps extends IdentityProps {
    willChangeTransform?: boolean
    /** @internal */
    _forwardedOverrides?: { [key: string]: any }
}

/**
 * @public
 */
export class Layer<P extends Partial<LayerProps>, S> extends React.Component<P, S> {
    static readonly defaultProps: LayerProps = {}

    static applyWillChange<P extends Partial<LayerProps>>(layer: React.Component<P>, style: React.CSSProperties) {
        // The RenderTarget may change at runtime, so the willChangeTransform default
        // cannot be specified statically. Instead, we set it with a fallback at runtime.
        const { willChangeTransform = !RenderTarget.hasRestrictions() } = layer.props
        if (willChangeTransform) {
            style.willChange = "transform"
        }
    }

    /** @internal */
    shouldComponentUpdate(nextProps: P, nextState: S) {
        return this.state !== nextState || !isEqual(this.props, nextProps, false)
    }

    /** @internal */
    get properties(): P {
        // React takes care of this, as long as defaultProps are defined: https://reactjs.org/docs/react-component.html#defaultprops
        // Each subclass should have a defaultProps with type P
        return this.props as P
    }

    private previousZoom = RenderEnvironment.zoom

    /** @internal */
    componentDidUpdate(prevProps: P) {
        const { zoom } = RenderEnvironment
        // Workarounds for WebKit bugs

        // Some styles have to be toggled to take effect in certain situations.
        // Not using type safety, uses lots of internal knowledge for efficiency

        if (zoom !== this.previousZoom && this.props["blendingMode"] && this.props["blendingMode"] !== "normal") {
            this.resetSetStyle("mixBlendMode", this.props["blendingMode"])
        }

        if (this.props["clip"] && this.props["radius"] === 0 && prevProps["radius"] !== 0) {
            this.resetSetStyle("overflow", "hidden", false)
        }
        this.previousZoom = zoom
    }

    /** @internal */
    protected resetSetStyle(key: string, toValue: any | null, microtask: boolean = true) {
        const element = ReactDOM.findDOMNode(this) as HTMLElement
        if (!element) {
            return
        }
        const value = toValue ? toValue : element.style[key]
        const reset = () => {
            element.style[key] = value
        }
        element.style[key] = null
        if (microtask) {
            Promise.resolve().then(reset)
        } else {
            setTimeout(reset, 0)
        }
    }
}
