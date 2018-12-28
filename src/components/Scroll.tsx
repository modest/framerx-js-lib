import { Draggable } from "./Draggable"
import { FramerEvent } from "../events/FramerEvent"
import * as React from "react"
import { DragEventHandler, DraggableProps, DragEvents } from "./hoc/WithDragging"
import { Rect, PropertyControls, ControlType, LayerProps } from "../render"
import { Frame } from "./Frame"
import { isRectProviding } from "./utils/RectProvider"
import { getObservableNumber } from "../utils/observable"
import { Frame as CoreFrame } from "../render"
import { Animatable } from "../animation/Animatable/Animatable"
import { EmptyState } from "./EmptyState"
import { FrameProperties } from "../render/presentation/Frame"

type DraggableType = typeof Frame

export type ScrollDirection = "horizontal" | "vertical" | "both"

/** @public */
type DraggableFrameProps = Partial<FrameProperties> & Partial<DraggableProps<DraggableType>>
export type ScrollEventHandler = (event: FramerEvent, scrollComponent: Scroll) => void

/**
 * @public
 */
export interface ScrollEvents {
    /** On start of scroll. */
    onScrollStart: ScrollEventHandler
    /** On scroll. */
    onScroll: ScrollEventHandler
    /** On end of scroll. */
    onScrollEnd: ScrollEventHandler
    /** @beta */
    onScrollSessionStart: ScrollEventHandler
    /** @beta */
    onScrollSessionEnd: ScrollEventHandler
}

/**
 * The properties for the {@link Scroll} component, which are also available within other components, like {@link Page}.
 * @public
 */
export interface ScrollProperties {
    draggingEnabled: boolean
    /** Scrolling direction. */
    direction: ScrollDirection
    /** Lock the current scrolling direction. */
    directionLock: boolean
    /**
     * @internalremarks
     * Ignored and deprecated; see https://github.com/framer/company/issues/10018 for future direction
     * @deprecated mouseWheel is always enabled
     */
    mouseWheel: boolean
    /** Horizontal offset of the scrollable content. */
    contentOffsetX: number | Animatable<number> | null
    /** Vertical offset of the scrollable content. */
    contentOffsetY: number | Animatable<number> | null
}

/** @public */
export interface ScrollProps
    extends ScrollProperties,
        FrameProperties,
        LayerProps,
        Partial<ScrollEvents>,
        Partial<DragEvents<DraggableType>> {}

/**
 * The Scroll component in Framer allows you create scrollable areas.
 * It can be imported from the Framer Library and used in code components.
 * Add children that exceed the height or width of the component to create
 * horizontally or vertically scrollable areas.
 * See {@link ScrollProperties} for its properties
 * @public
 */
export class Scroll extends React.Component<Partial<ScrollProps>> {
    /** @internal */
    static _isStylable = true
    /** @internal */
    static supportsConstraints = true

    /** @internal */
    static scrollProps: ScrollProperties = {
        draggingEnabled: true,
        direction: "vertical",
        directionLock: true,
        mouseWheel: true,
        contentOffsetX: null,
        contentOffsetY: null,
    }

    /** @internal */
    static defaultProps: ScrollProps = Object.assign({}, CoreFrame.defaultProps, Scroll.scrollProps, {
        overflow: "visible",
        background: "none",
        width: "100%",
        height: "100%",
    })

    /** @internal */
    static propertyControls: PropertyControls<ScrollProps> = {
        direction: {
            type: ControlType.SegmentedEnum,
            title: "Direction",
            options: ["vertical", "horizontal", "both"],
        },
        directionLock: {
            type: ControlType.Boolean,
            title: "Lock",
            enabledTitle: "1 Axis",
            disabledTitle: "Off",
            hidden(props) {
                return props.direction !== "both"
            },
        },
    }

    /** @internal */
    get properties(): ScrollProps {
        // React takes care of this, as long as defaultProps are defined: https://reactjs.org/docs/react-component.html#defaultprops
        return this.props as ScrollProps
    }

    private wrapHandlers(
        dragHandler?: DragEventHandler<DraggableType> | undefined,
        scrollHandler?: ScrollEventHandler
    ): DragEventHandler<DraggableType> | undefined {
        if (!scrollHandler) {
            return dragHandler
        }
        return (event: FramerEvent, draggable: typeof Frame) => {
            if (dragHandler) {
                dragHandler(event, draggable)
            }
            scrollHandler(event, this)
        }
    }

    /** @internal */
    render() {
        const frameProps: Partial<FrameProperties> = Object.assign({}, this.props)
        Object.keys(Scroll.scrollProps).map(key => {
            delete frameProps[key]
        })

        // If there are no children we render a single child at the size of the component so we have visual feedback.
        if (!this.props.children) {
            return (
                <Frame {...frameProps}>
                    <Draggable width={frameProps.width} height={frameProps.height} />
                </Frame>
            )
        }

        // TODO: Move this to Frame.contentFrame
        const contentSize = { top: 0, left: 0, bottom: 0, right: 0 }
        const { width, height } = CoreFrame.rect(frameProps)
        const children = React.Children.map(this.props.children, (child: React.ReactChild, index: number) => {
            if (child === null || typeof child !== "object" || typeof child.type === "string") {
                return child
            }
            const type = child.type
            if (isRectProviding(type)) {
                const frame = type.rect(child.props)
                // TODO: move this to utils/frame as merge(frame: Frame)?
                contentSize.top = Math.min(Rect.minY(frame), contentSize.top)
                contentSize.left = Math.min(Rect.minX(frame), contentSize.left)
                contentSize.bottom = Math.max(Rect.maxY(frame), contentSize.bottom)
                contentSize.right = Math.max(Rect.maxX(frame), contentSize.right)
            }
            const update: Partial<{ width: number; height: number }> = {}
            if (this.properties.direction === "vertical") {
                update.width = width
            } else if (this.properties.direction === "horizontal") {
                update.height = height
            }
            return React.cloneElement(child, update)
        })
        const { onScrollStart, onScroll, onScrollEnd, onScrollSessionStart, onScrollSessionEnd } = this.props
        const w = getObservableNumber(width)
        const h = getObservableNumber(height)
        const contentW = Math.max(contentSize.right, w)
        const contentH = Math.max(contentSize.bottom, h)
        const x = Math.min(0, w - contentW)
        const y = Math.min(0, h - contentH)
        const constraints = {
            x: x,
            y: y,
            width: contentW + contentW - w,
            height: contentH + contentH - h,
        }
        const draggableProps: Partial<DraggableFrameProps> = {}
        draggableProps.enabled = this.props.draggingEnabled
        draggableProps.background = "none"
        draggableProps.width = contentW
        draggableProps.height = contentH
        draggableProps.constraints = constraints
        draggableProps.onMove = this.props.onMove
        draggableProps.onDragSessionStart = this.wrapHandlers(this.props.onDragSessionStart, onScrollSessionStart)
        draggableProps.onDragSessionMove = this.props.onDragSessionMove
        draggableProps.onDragSessionEnd = this.wrapHandlers(this.props.onDragSessionEnd, onScrollSessionEnd)
        draggableProps.onDragAnimationStart = this.props.onDragAnimationStart
        draggableProps.onDragAnimationEnd = this.props.onDragAnimationEnd
        draggableProps.onDragDidMove = this.wrapHandlers(this.props.onDragDidMove, onScroll)
        draggableProps.onDragDirectionLockStart = this.props.onDragDirectionLockStart
        draggableProps.onDragStart = this.wrapHandlers(this.props.onDragStart, onScrollStart)
        draggableProps.onDragEnd = this.wrapHandlers(this.props.onDragEnd, onScrollEnd)
        draggableProps.onDragWillMove = this.props.onDragWillMove
        draggableProps.horizontal = this.properties.direction !== "vertical"
        draggableProps.vertical = this.properties.direction !== "horizontal"
        draggableProps.directionLock = this.properties.directionLock
        draggableProps.mouseWheel = true // TODO: see https://github.com/framer/company/issues/10018 for future direction
        draggableProps.left = this.properties.contentOffsetX
        draggableProps.top = this.properties.contentOffsetY
        draggableProps.preserve3d = this.properties.preserve3d

        return (
            <Frame {...frameProps}>
                <Draggable {...draggableProps}>{children}</Draggable>
                <EmptyState
                    children={this.props.children!}
                    size={{ width: w, height: h }}
                    title={"Connect to scrollable content"}
                    styleOverrides={{ color: "#09F", background: "rgba(0, 153, 255, 0.3)" }}
                />
            </Frame>
        )
    }
}
