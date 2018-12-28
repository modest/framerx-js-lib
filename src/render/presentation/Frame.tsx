import * as React from "react"
import { Layer, LayerProps } from "./Layer"
import {
    ConstraintProperties,
    ConstraintValues,
    isConstraintSupportingChild,
    constraintDefaults,
} from "../types/Constraints"
import { BorderStyle, borderForProps } from "../style/border"
import { Color } from "../types/Color"
import { Rect } from "../types/Rect"
import { Size } from "../types/Size"
import { QualityOptions, imageUrlForFill } from "../utils/imageForFill"
import { RenderTarget, RenderEnvironment } from "../types/RenderEnvironment"
import { Animatable, AnimatableObject, isAnimatable, Change, Cancel } from "../../animation/Animatable"
import { ObservableObject } from "../../data/ObservableObject"
import { WithFractionOfFreeSpace } from "../traits/FreeSpace"
import { BackgroundImage } from "../types/BackgroundImage"
import { collectVisualStyleFromProps, VisualProperties } from "../style/collectVisualStyleFromProps"
import { TransformProperties, collectTransformFromProps, transformDefaults } from "../traits/Transform"
import { collectBackgroundImageFromProps } from "../style/collectBackgroundImageFromProps"

/** @public */
export interface FrameProperties extends ConstraintProperties, TransformProperties, VisualProperties {
    visible: boolean
    name?: string
    backfaceVisible?: boolean | Animatable<boolean>
    perspective?: number | Animatable<number>
    preserve3d?: boolean | Animatable<boolean>
    borderWidth: number | Partial<{ top: number; bottom: number; left: number; right: number }>
    borderColor: string
    borderStyle: BorderStyle
    style?: React.CSSProperties
    className?: string
    /** @internal */
    _overrideForwardingDescription?: { [key: string]: string }
}

export interface FrameState {
    size: AnimatableObject<Size> | Size | null
    shouldCheckImageAvailability: boolean
    currentBackgroundImageSrc: string | null
}

export interface CoreFrameProps extends FrameProperties, LayerProps {}

/**
 * @public
 */
export class Frame extends Layer<CoreFrameProps, FrameState> {
    static supportsConstraints = true
    static defaultFrameSpecificProps: FrameProperties = {
        ...constraintDefaults,
        ...transformDefaults,
        opacity: 1,
        background: Color("rgba(0, 170, 255, 0.3)"),
        visible: true,
        borderWidth: 0,
        borderColor: "#222",
        borderStyle: "solid",
    }

    static readonly defaultProps: CoreFrameProps = {
        ...Layer.defaultProps,
        ...Frame.defaultFrameSpecificProps,
    }

    static rect(props: Partial<ConstraintProperties>): Rect {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toRect(constraintValues, props.parentSize || null, null, true)
    }

    get rect() {
        return Frame.rect(this.props)
    }

    static minSize(
        props: Partial<ConstraintProperties>,
        parentSize: Size | AnimatableObject<Size> | null | undefined
    ): Size {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toMinSize(constraintValues, parentSize || null)
    }

    static size(
        props: Partial<ConstraintProperties>,
        parentSize: Size | AnimatableObject<Size> | null | undefined,
        freeSpace: WithFractionOfFreeSpace
    ): Size {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toSize(constraintValues, parentSize || null, null, freeSpace)
    }

    element: HTMLDivElement | null = null
    imageDidChange: boolean = false

    state: FrameState = {
        size: null,
        shouldCheckImageAvailability: true,
        currentBackgroundImageSrc: null,
    }

    static getDerivedStateFromProps(nextProps: Partial<CoreFrameProps>, prevState: FrameState): FrameState | null {
        const size = Frame.updatedSize(nextProps, prevState)
        const { target } = RenderEnvironment
        const nextBackgroundImageSrc =
            nextProps.background && BackgroundImage.isImageObject(nextProps.background)
                ? nextProps.background.src
                : null
        if (nextBackgroundImageSrc) {
            const shouldCheckImageAvailability = prevState.currentBackgroundImageSrc !== nextBackgroundImageSrc
            if (shouldCheckImageAvailability !== prevState.shouldCheckImageAvailability) {
                return {
                    size: size,
                    currentBackgroundImageSrc: nextBackgroundImageSrc,
                    shouldCheckImageAvailability: shouldCheckImageAvailability,
                }
            }
        }
        if (prevState.size) {
            if (target === RenderTarget.preview) {
                return null
            }
            if (prevState.size.width === size.width && prevState.size.height === size.height) {
                return null
            }
        }
        return {
            size: size,
            currentBackgroundImageSrc: nextBackgroundImageSrc,
            shouldCheckImageAvailability: prevState.shouldCheckImageAvailability,
        }
    }

    static updatedSize(props: Partial<CoreFrameProps>, state: FrameState): AnimatableObject<Size> | Size {
        const rect = Frame.rect(props)
        let size = state.size
        const newSize = { width: rect.width, height: rect.height }
        const { target } = RenderEnvironment
        if (!size) {
            if (target === RenderTarget.preview) {
                size = ObservableObject(newSize, true)
            } else {
                size = newSize
            }
        } else {
            if (isAnimatable(size.width) && isAnimatable(size.height)) {
                size.width.set(newSize.width)
                size.height.set(newSize.height)
            } else {
                size = newSize
            }
        }
        return size
    }

    getStyle(): React.CSSProperties {
        const rect = this.rect
        const style: React.CSSProperties = {
            display: "block",
            position: "absolute",
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            pointerEvents: undefined, // TODO: this should be "none" for non-event consuming instances, for performance.
            userSelect: "none",
        }

        const perspective = Animatable.get(this.properties.perspective, undefined)
        style.perspective = perspective
        style.WebkitPerspective = perspective

        let backfaceVisibility: "visible" | "hidden" | undefined = undefined
        const backfaceVisible = Animatable.get(this.properties.backfaceVisible, undefined)

        if (backfaceVisible === true) {
            backfaceVisibility = "visible"
        } else if (backfaceVisible === false) {
            backfaceVisibility = "hidden"
        }
        style.backfaceVisibility = backfaceVisibility
        style.WebkitBackfaceVisibility = backfaceVisibility

        const preserve3d = Animatable.get(this.properties.preserve3d, undefined)
        if (preserve3d === true) {
            style.transformStyle = "preserve-3d"
        } else if (preserve3d === false) {
            style.transformStyle = "flat"
        }

        const { zoom } = RenderEnvironment
        collectTransformFromProps(this.properties, rect, style)
        collectVisualStyleFromProps(this.properties, style, zoom)
        collectBackgroundImageFromProps(
            this.properties,
            rect,
            style,
            this.state.shouldCheckImageAvailability,
            this.checkImageAvailability
        )

        Layer.applyWillChange(this, style)

        // TODO disable style overrides in strict mode
        if (this.props.style) {
            Object.assign(style, this.props.style)
        }

        return style
    }

    private updateStyle = () => {
        if (!this.element) {
            return
        }
        Object.assign(this.element.style, this.getStyle())
    }

    setElement = (element: HTMLDivElement | null) => {
        this.element = element
    }

    // XXX internal state
    propsObserver: AnimatableObject<CoreFrameProps>
    propsObserverCancel?: Cancel

    sizeObserver: AnimatableObject<Size>
    sizeObserverCancel?: Cancel

    componentDidMount() {
        const { target } = RenderEnvironment
        if (target === RenderTarget.preview) {
            this.propsObserver = ObservableObject(this.properties, true)
            this.propsObserverCancel = ObservableObject.addObserver(this.propsObserver, this.onPropsChange)
            if (
                this.properties.parentSize &&
                isAnimatable(this.properties.parentSize.width) &&
                isAnimatable(this.properties.parentSize.height)
            ) {
                this.sizeObserver = ObservableObject(this.properties.parentSize, true)
                this.sizeObserverCancel = ObservableObject.addObserver(this.sizeObserver, this.onSizeChange)
            }
        }
    }

    componentDidUpdate() {
        const { target } = RenderEnvironment
        this.propsObserverCancel && this.propsObserverCancel()
        this.sizeObserverCancel && this.sizeObserverCancel()
        if (target === RenderTarget.preview) {
            this.propsObserver = ObservableObject(this.properties, true)
            this.propsObserverCancel = ObservableObject.addObserver(this.propsObserver, this.onPropsChange)
            if (
                this.properties.parentSize &&
                isAnimatable(this.properties.parentSize.width) &&
                isAnimatable(this.properties.parentSize.height)
            ) {
                this.sizeObserver = ObservableObject(this.properties.parentSize, true)
                this.sizeObserverCancel = ObservableObject.addObserver(this.sizeObserver, this.onSizeChange)
            }
        }
    }

    protected onPropsChange = (props: Change<AnimatableObject<CoreFrameProps>>) => {
        const rect = Frame.rect(Animatable.objectToValues(props.value))
        if (this.state.size && isAnimatable(this.state.size.width) && isAnimatable(props.value.width)) {
            this.state.size.width.set(rect.width)
        }
        if (this.state.size && isAnimatable(this.state.size.height) && isAnimatable(props.value.height)) {
            this.state.size.height.set(rect.height)
        }
        this.updateStyle()
    }

    protected onSizeChange = () => {
        this.updateStyle()
    }

    componentWillUnmount() {
        this.propsObserverCancel && this.propsObserverCancel()
        this.propsObserverCancel = undefined
        this.sizeObserverCancel && this.sizeObserverCancel()
        this.sizeObserverCancel = undefined
    }

    checkImageAvailability = (qualityOptions: QualityOptions) => {
        const { background } = this.properties
        if (!background || !BackgroundImage.isImageObject(background)) return

        const image = new Image()
        image.src = imageUrlForFill(background, qualityOptions)
        image.onerror = () => {
            if (!this.element) return
            this.element.style.backgroundImage = imageUrlForFill(background)
        }
    }

    render() {
        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()

        const { visible, id, className } = this.properties
        if (!visible) {
            return null
        }

        const style = this.getStyle()

        return (
            <div id={id} style={style} ref={this.setElement} className={className}>
                {this.layoutChildren()}
                {borderForProps(this.properties, this.rect, style.borderRadius)}
            </div>
        )
    }

    layoutChildren() {
        let _forwardedOverrides: { [key: string]: any } | undefined = this.props._forwardedOverrides
        const extractions = this.props._overrideForwardingDescription
        if (extractions) {
            let added = false
            _forwardedOverrides = {}
            for (const key in extractions) {
                added = true
                _forwardedOverrides[key] = this.props[extractions[key]]
            }
            if (!added) {
                _forwardedOverrides = undefined
            }
        }

        let children = React.Children.map(this.props.children, child => {
            if (isConstraintSupportingChild(child)) {
                return React.cloneElement(child, {
                    parentSize: this.state.size,
                    _forwardedOverrides,
                } as any)
            } else if (_forwardedOverrides) {
                return React.cloneElement(child as any, { _forwardedOverrides })
            } else {
                return child
            }
        })

        // We wrap raw strings in a default style to display
        if (children && children.length === 1 && typeof children[0] === "string") {
            children = [<Center key="0">{children}</Center>]
        }
        return children
    }
}

export const Center: React.SFC<{ style?: React.CSSProperties }> = props => {
    const style = Object.assign(
        {},
        {
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Helvetica",
        },
        props.style || {}
    )

    return <div style={style}>{props.children}</div>
}
