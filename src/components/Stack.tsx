import * as React from "react"
import { Layer, LayerProps } from "../render/presentation/Layer"
import { EmptyState } from "./EmptyState"
import { FrameProperties, Frame } from "../render/presentation/Frame"
import { AnimatableObject, isAnimatable } from "../animation/Animatable"
import {
    ConstraintProperties,
    ConstraintValues,
    valueToDimensionType,
    DimensionType,
} from "../render/types/Constraints"
import { Rect } from "../render/types/Rect"
import { Size } from "../render/types/Size"
import { WithFractionOfFreeSpace } from "../render/traits/FreeSpace"
import { RenderEnvironment, RenderTarget } from "../render/types/RenderEnvironment"
import { Point, PropertyControls, ControlType, isFiniteNumber, Line } from "../render"
import { BackgroundImage } from "../render/types/BackgroundImage"
import { ObservableObject } from "../data/ObservableObject"

/**
 * @public
 */
export type StackDirection = "horizontal" | "vertical"
/**
 * @public
 */
export type StackDistribution = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly"
/**
 * @public
 */
export type StackAlignment = "start" | "center" | "end"

/**
 * @beta
 */
const stackAlignmentOptions: StackAlignment[] = ["start", "center", "end"]
/**
 * @beta
 */
const genericAlignmentTitles = stackAlignmentOptions.map(option => {
    switch (option) {
        case "start":
            return "Start"
        case "center":
            return "Center"
        case "end":
            return "End"
    }
})
/**
 * @beta
 */
const horizontalAlignmentTitles = stackAlignmentOptions.map(option => {
    switch (option) {
        case "start":
            return "Left"
        case "center":
            return "Center"
        case "end":
            return "Right"
    }
})
/**
 * @beta
 */
const verticalAlignmentTitles = stackAlignmentOptions.map(option => {
    switch (option) {
        case "start":
            return "Top"
        case "center":
            return "Center"
        case "end":
            return "Bottom"
    }
})

/**
 * @beta
 */
export interface StackPlaceHolders {
    index: number
    sizes: Size[]
}

/**
 * @public
 */
export interface StackSpecificProps {
    direction: StackDirection
    distribution: StackDistribution
    alignment: StackAlignment
    gap: number

    padding: number
    paddingPerSide: boolean
    paddingTop: number
    paddingRight: number
    paddingLeft: number
    paddingBottom: number
    /** @internal */
    placeholders?: StackPlaceHolders
}

/**
 * @public
 */
export interface StackProperties extends StackSpecificProps, FrameProperties, LayerProps {}

/**
 * @public
 */
export interface StackState {
    size: AnimatableObject<Size> | Size | null
    shouldCheckImageAvailability: boolean
    currentBackgroundImageSrc: string | null
}

/**
 * @public
 */
export class Stack extends Layer<StackProperties, StackState> {
    /** @internal */
    static _isStylable = true

    /** @internal */
    static defaultStackSpecificProps: StackSpecificProps = {
        direction: "vertical",
        distribution: "space-around",
        alignment: "center",
        gap: 10,
        padding: 0,
        paddingPerSide: false,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
    }

    /** @internal */
    static readonly defaultProps: StackProperties = {
        ...Layer.defaultProps,
        ...Frame.defaultFrameSpecificProps,
        ...Stack.defaultStackSpecificProps,
    }

    /** @internal */
    static propertyControls: PropertyControls<StackProperties> = {
        direction: { type: ControlType.SegmentedEnum, options: ["horizontal", "vertical"], title: "Direction" },
        distribution: {
            type: ControlType.Enum,
            options: ["start", "center", "end", "space-between", "space-around", "space-evenly"],
            optionTitles: ["Start", "Center", "End", "Space Between", "Space Around", "Space Evenly"],
            title: "Distribute",
        },
        alignment: {
            type: ControlType.SegmentedEnum,
            options: ["start", "center", "end"],
            optionTitles(props) {
                if (!props) return genericAlignmentTitles
                const crossDirectionIsHorizontal = props.direction !== "horizontal"
                return crossDirectionIsHorizontal ? horizontalAlignmentTitles : verticalAlignmentTitles
            },
            title: "Align",
        },
        gap: {
            type: ControlType.Number,
            min: 0,
            title: "Gap",
            hidden: props => {
                return (
                    props.distribution !== undefined &&
                    ["space-between", "space-around", "space-evenly"].indexOf(props.distribution) !== -1
                )
            },
        },
        padding: {
            type: ControlType.FusedNumber,
            toggleKey: "paddingPerSide",
            toggleTitles: ["Padding", "Padding per side"],
            valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
            valueLabels: ["t", "r", "b", "l"],
            min: 0,
            title: "Padding",
        },
    }

    /** @internal */
    static rect(props: Partial<ConstraintProperties>, autoSize: Size | null): Rect {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toRect(constraintValues, props.parentSize || null, autoSize, true)
    }

    /** @internal */
    get rect() {
        return Stack.rect(this.props, null)
    }

    /** @internal */
    state: StackState = {
        size: null,
        shouldCheckImageAvailability: true,
        currentBackgroundImageSrc: null,
    }

    /** @internal */
    static getDerivedStateFromProps(nextProps: Partial<StackProperties>, prevState: StackState): StackState | null {
        const size = Stack.updatedSize(nextProps, prevState)
        const target = RenderTarget.current()
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

    /** @internal */
    static updatedSize(props: Partial<StackProperties>, state: StackState): AnimatableObject<Size> | Size {
        const rect = Stack.rect(props, null)
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

    // Layout
    /** @internal */
    static minSize(props: StackProperties, parentSize: Size | AnimatableObject<Size> | null | undefined): Size {
        const constraintValues = ConstraintValues.fromProperties(props)
        const minSize = ConstraintValues.toMinSize(constraintValues, parentSize)

        let autoSize: Size | null = null
        const widthDimensionType = valueToDimensionType(props.width)
        const heightDimensionType = valueToDimensionType(props.height)
        if (widthDimensionType === DimensionType.Auto || heightDimensionType === DimensionType.Auto) {
            const minChildrenSizes = Stack.minChildrenSizes(props.children, minSize)
            const invisibleItems = Stack.invisibleItemIndexes(props.children)
            autoSize = Stack.autoSize(minChildrenSizes, props, invisibleItems)
        }

        return ConstraintValues.toMinSize(constraintValues, parentSize, autoSize)
    }

    /** @internal */
    static size(
        props: StackProperties,
        parentSize: Size | AnimatableObject<Size> | null | undefined,
        freeSpace: WithFractionOfFreeSpace
    ): Size {
        const constraintValues = ConstraintValues.fromProperties(props)
        const minSize = ConstraintValues.toMinSize(constraintValues, parentSize)

        let autoSize: Size | null = null
        const widthDimensionType = valueToDimensionType(props.width)
        const heightDimensionType = valueToDimensionType(props.height)
        if (widthDimensionType === DimensionType.Auto || heightDimensionType === DimensionType.Auto) {
            const minChildrenSizes = Stack.minChildrenSizes(props.children, minSize)
            const invisibleItems = Stack.invisibleItemIndexes(props.children)
            autoSize = Stack.autoSize(minChildrenSizes, props, invisibleItems)
        }

        return ConstraintValues.toSize(constraintValues, props.parentSize, autoSize, freeSpace)
    }

    /** @internal */
    render() {
        const props = this.properties
        const { visible, placeholders, parentSize, _forwardedOverrides } = props
        if (!visible) {
            return null
        }

        let children = this.props.children
        if (_forwardedOverrides && children) {
            children = React.Children.map(this.props.children, child => {
                return React.cloneElement(child as any, { _forwardedOverrides })
            })
        }

        // Layout

        const invisibleItems = Stack.invisibleItemIndexes(children, placeholders)

        const padding = Stack.paddingSize(props)

        const constraintValues = ConstraintValues.fromProperties(props)
        const minSize = ConstraintValues.toMinSize(constraintValues, parentSize)
        const minContentSize = Size.subtract(minSize, padding)

        const minChildrenSizes = Stack.minChildrenSizes(children, minContentSize, placeholders)
        const autoSize = Stack.autoSize(minChildrenSizes, props, invisibleItems)
        const size = ConstraintValues.toSize(constraintValues, parentSize, autoSize, null)

        const childFractions = Stack.childFractions(children)
        const freeSpaceForChildren = Stack.freeSpace(size, autoSize, childFractions, props)

        const contentSize = Size.subtract(size, padding)
        const childSizes = Stack.childSizes(children, contentSize, freeSpaceForChildren, placeholders)
        const childRects = Stack.childLayoutRects(childSizes, contentSize, props, invisibleItems)

        const frameProps: Partial<FrameProperties> = Object.assign({}, this.props)
        Object.keys(Stack.defaultStackSpecificProps).map(key => {
            delete frameProps[key]
        })

        return (
            <Frame {...frameProps}>
                {this.layoutChildren(childRects, placeholders)}
                {this.layoutPlaceholders(childRects, placeholders)}
                <EmptyState
                    title={"Drop items"}
                    children={this.props.children!}
                    size={size}
                    showArrow={false}
                    hide={!!this.props.placeholders}
                    styleOverrides={placeholderStyling(RenderEnvironment.zoom)}
                />
            </Frame>
        )
    }

    /** @internal */
    static paddingSize(props: StackProperties) {
        if (props.paddingPerSide) {
            const { paddingTop, paddingRight, paddingBottom, paddingLeft } = props
            return {
                width: paddingLeft + paddingRight,
                height: paddingTop + paddingBottom,
            }
        } else {
            const { padding } = props
            return {
                width: padding * 2,
                height: padding * 2,
            }
        }
    }

    /** @internal */
    static minChildrenSizes(children: React.ReactNode, size: Size, placeholders?: StackPlaceHolders): Size[] {
        const sizes = React.Children.map(children, child => {
            if (typeof child === "number" || typeof child === "string") return { width: 0, height: 0 }

            if (typeof child.type === "function" && "minSize" in child.type) {
                return child.type["minSize"](child.props, size)
            }

            return { width: 0, height: 0 }
        })

        if (placeholders) {
            sizes.splice(placeholders.index, 0, ...placeholders.sizes)
        }

        return sizes
    }

    /** @internal */
    static childSizes(
        children: React.ReactNode,
        size: Size,
        freeSpace: WithFractionOfFreeSpace,
        placeholders?: StackPlaceHolders
    ): Size[] {
        const sizes = React.Children.map(children, child => {
            if (typeof child === "number" || typeof child === "string") return { width: 0, height: 0 }

            if (typeof child.type === "function" && "size" in child.type) {
                return child.type["size"](child.props, size, freeSpace)
            }

            return { width: 0, height: 0 }
        })

        if (placeholders) {
            sizes.splice(placeholders.index, 0, ...placeholders.sizes)
        }

        return sizes
    }

    /** @internal */
    static _cssExport(props: StackSpecificProps): React.CSSProperties {
        const style: React.CSSProperties = {
            display: "flex",
            flexDirection: props.direction === "horizontal" ? "row" : "column",
            justifyContent: stackDistributionAndAlignmentToFlexbox(props.distribution),
            alignItems: stackDistributionAndAlignmentToFlexbox(props.alignment),
        }

        if (props.paddingPerSide) {
            if (props.paddingTop || props.paddingRight || props.paddingBottom || props.paddingLeft) {
                style.padding = `${props.paddingTop}px ${props.paddingRight}px ${props.paddingBottom}px ${
                    props.paddingLeft
                }px`
            }
        } else if (isFiniteNumber(props.padding) && props.padding) {
            style.padding = `${props.padding}px`
        }

        return style
    }

    // TODO: move this into layout helper
    /** @internal */
    static childFractions(children: React.ReactNode): Size {
        const freeSpaceUnitDivisor = { width: 0, height: 0 }
        React.Children.forEach(children, (child, index) => {
            if (typeof child === "number" || typeof child === "string") return
            if (child.props.visible === false) return
            const width = child.props["width"]
            const height = child.props["height"]
            if (typeof width === "string" && width.endsWith("fr")) {
                const widthValue = parseFloat(width)
                if (isFiniteNumber(widthValue)) {
                    freeSpaceUnitDivisor.width += widthValue
                }
            }
            if (typeof height === "string" && height.endsWith("fr")) {
                const heightValue = parseFloat(height)
                if (isFiniteNumber(heightValue)) {
                    freeSpaceUnitDivisor.height += heightValue
                }
            }
        })
        return freeSpaceUnitDivisor
    }

    /** @internal */
    static childLayoutRects(childSizes: Size[], size: Size, props: StackProperties, invisibleItems: number[]): Rect[] {
        const childCount = childSizes.length
        if (childCount === 0) return []

        const { direction, alignment } = props
        const isColumn = direction === "vertical"
        const isAutoSizedForAxis = (isColumn ? (props as any).height : (props as any).width) === "auto"
        const distribution = isAutoSizedForAxis ? "start" : (props as any).distribution

        const { width, height } = size

        // Calculate the length children occupy on the main axis, and apply cross-axis alignment
        let axisLengthFittingChildren = 0
        const childRects = childSizes.map((childSize, index) => {
            if (invisibleItems.indexOf(index) === -1) {
                axisLengthFittingChildren += isColumn ? childSize.height : childSize.width
            }

            const rect = { ...childSize, x: 0, y: 0 }
            switch (alignment) {
                case "center":
                    isColumn ? (rect.x = width / 2 - childSize.width / 2) : (rect.y = height / 2 - childSize.height / 2)
                    break
                case "end":
                    isColumn ? (rect.x = width - childSize.width) : (rect.y = height - childSize.height)
                    break
            }
            return rect
        })

        const axisLength = isColumn ? height : width

        const invisibleItemCount = invisibleItems.length

        const gap = gapEnabled(props.distribution) ? props.gap || 0 : 0
        let offset = 0
        switch (distribution) {
            case "center":
                axisLengthFittingChildren += Math.max(childCount - 1 - invisibleItemCount, 0) * gap
                offset = axisLength / 2 - axisLengthFittingChildren / 2
                break
            case "end":
                axisLengthFittingChildren += Math.max(childCount - 1 - invisibleItemCount, 0) * gap
                offset = axisLength - axisLengthFittingChildren
                break
        }
        const emptyAxisLength = Math.max(axisLength, axisLengthFittingChildren) - axisLengthFittingChildren

        const padding = paddingInset(props)

        // Position children
        let iterativeSize = 0
        let skippedItems = 0
        return childRects.map((rect, index) => {
            let pos: number
            let spacing: number

            if (invisibleItems.indexOf(index) !== -1) {
                skippedItems++
                return rect
            }

            index -= skippedItems

            switch (distribution) {
                case "start":
                case "center":
                case "end":
                    pos = offset + iterativeSize + index * gap
                    isColumn ? (rect.y = pos) : (rect.x = pos)
                    break
                case "space-between":
                    pos = iterativeSize + (emptyAxisLength / Math.max(1, childCount - invisibleItemCount - 1)) * index
                    isColumn ? (rect.y = pos) : (rect.x = pos)
                    break
                case "space-around":
                    spacing = emptyAxisLength / ((childCount - invisibleItemCount) * 2)
                    pos = iterativeSize + spacing * index + spacing * (index + 1)
                    isColumn ? (rect.y = pos) : (rect.x = pos)
                    break
                case "space-evenly":
                    spacing = emptyAxisLength / (childCount - invisibleItemCount + 1)
                    pos = iterativeSize + spacing * (index + 1)
                    isColumn ? (rect.y = pos) : (rect.x = pos)
                    break
            }

            iterativeSize += isColumn ? rect.height : rect.width

            rect.x += padding.x
            rect.y += padding.y
            return Rect.pixelAligned(rect)
        })
    }

    /** @internal */
    static autoSize(minChildrenSizes: Size[], props: StackProperties, invisibleItems: number[]) {
        const { direction, gap } = props
        const isHorizontalStack = direction === "horizontal"

        let totalWidth = 0
        let totalHeight = 0

        minChildrenSizes.forEach((childSize, index) => {
            if (invisibleItems.indexOf(index) !== -1) return

            const { width, height } = childSize

            if (isHorizontalStack) {
                totalWidth += width
                if (height > totalHeight) totalHeight = height
            } else {
                totalHeight += height
                if (width > totalWidth) totalWidth = width
            }
        })

        if (gapEnabled(props.distribution)) {
            const gapCount = Math.max(0, minChildrenSizes.length - 1 - invisibleItems.length)

            if (isHorizontalStack) {
                totalWidth += gapCount * gap
            } else {
                totalHeight += gapCount * gap
            }
        }

        const padding = Stack.paddingSize(props)
        return { width: totalWidth + padding.width, height: totalHeight + padding.height }
    }

    /** @internal */
    static freeSpace(
        size: Size,
        autoSize: Size,
        childFractions: Size,
        props: StackProperties
    ): WithFractionOfFreeSpace {
        const isHorizontalStack = props.direction === "horizontal"
        const freeSpaceUnitDivisor = childFractions

        let freeSpaceWidth = Math.max(0, size.width - autoSize.width)
        let freeSpaceHeight = Math.max(0, size.height - autoSize.height)

        const padding = Stack.paddingSize(props)

        // Give all elements full amount of space in cross direction
        if (isHorizontalStack) {
            freeSpaceHeight = childFractions.height * (size.height - padding.height)
        } else {
            freeSpaceWidth = childFractions.width * (size.width - padding.width)
        }

        return {
            freeSpaceInParent: {
                width: freeSpaceWidth,
                height: freeSpaceHeight,
            },
            freeSpaceUnitDivisor,
        }
    }

    /** @internal */
    static invisibleItemIndexes(children: React.ReactNode, placeholders?: StackPlaceHolders) {
        const invisibleItems: number[] = []
        React.Children.forEach(children, (child, index) => {
            if (typeof child === "object") {
                if (child.props.visible === false) {
                    if (placeholders && placeholders.index <= index) {
                        index += placeholders.sizes.length
                    }
                    invisibleItems.push(index)
                }
            }
        })
        return invisibleItems
    }

    private layoutChildren(childRects: Rect[], placeholders?: StackPlaceHolders) {
        return React.Children.map(this.props.children, (child, index) => {
            if (typeof child === "number" || typeof child === "string") return child

            if (placeholders && index >= placeholders.index) {
                index += placeholders.sizes.length
            }

            const rect = childRects[index]
            return React.cloneElement(child, {
                top: rect.y,
                left: rect.x,
                width: rect.width,
                height: rect.height,
                right: null,
                bottom: null,
                style: { ...child.props.style, WebkitTransition: placeholders ? "transform .2s ease-out" : "" },
            })
        })
    }

    private layoutPlaceholders(childRects: Rect[], placeholders?: StackPlaceHolders) {
        if (!placeholders) return null
        const { zoom } = RenderEnvironment
        return placeholders.sizes.map((size, index) => {
            const rect = childRects[placeholders.index + index]
            return (
                <Frame
                    key={`stack-placeholder-${index}`}
                    top={rect.y}
                    left={rect.x}
                    width={rect.width}
                    height={rect.height}
                    {...placeholderStyling(zoom)}
                    style={{ WebkitTransition: "transform 0.2s ease-out" }}
                />
            )
        })
    }

    /**
     * @alpha
     */
    static childInsertion(
        childRects: Rect[],
        containerSize: Size,
        insertion: Point,
        insertionMaxSize: Size,
        properties: StackProperties
    ): { index: number; line: Line } {
        let closestDistance = Infinity
        let closestChildIndex = null

        const isVertical = properties.direction === "vertical"

        childRects.forEach((childRect, i) => {
            const distance = isVertical ? Math.abs(insertion.y - childRect.y) : Math.abs(insertion.x - childRect.x)
            if (distance > closestDistance) return
            closestDistance = distance
            closestChildIndex = i
        })

        let index = 0
        if (closestChildIndex !== null) {
            const closestCenter = Rect.center(childRects[closestChildIndex])
            const after = isVertical ? insertion.y > closestCenter.y : insertion.x > closestCenter.x
            if (after) closestChildIndex++

            index = Math.min(Math.max(0, closestChildIndex), childRects.length)
        }

        const crossPaddingOffset = crossPadding(properties)
        const line = insertionIndicatorLine(
            properties.direction,
            properties.alignment,
            crossPaddingOffset,
            containerSize,
            childRects,
            index,
            insertionMaxSize
        )
        return { index, line }
    }
}

function gapEnabled(distribution: StackDistribution) {
    switch (distribution) {
        case "start":
        case "center":
        case "end":
            return true
        default:
            return false
    }
}

function paddingInset(props: StackProperties) {
    if (props.paddingPerSide) {
        return { x: props.paddingLeft, y: props.paddingTop }
    } else {
        return { x: props.padding, y: props.padding }
    }
}

function crossPadding(props: StackProperties) {
    const { direction, alignment, paddingPerSide, padding } = props

    if (alignment === "center") return 0
    if (!paddingPerSide) return padding

    const alignStart = alignment === "start"
    if (direction === "vertical") {
        return alignStart ? props.paddingLeft : props.paddingRight
    } else {
        return alignStart ? props.paddingTop : props.paddingBottom
    }
}

// Insertion line

function insertionIndicatorLine(
    direction: StackDirection,
    crossAlignment: StackAlignment,
    crossPaddingOffset: number,
    containerSize: Size,
    childrenRects: Rect[],
    index: number,
    insertedLayerSize: Size
): Line {
    const beforeRect: Rect | undefined = childrenRects[index - 1]
    const afterRect: Rect | undefined = childrenRects[index]
    const isVertical = direction === "vertical"

    const c = { x: containerSize.width / 2, y: containerSize.height / 2 }

    if (!beforeRect && !afterRect) {
    } else if (childrenRects.length === 1) {
        const onlyRect = beforeRect || afterRect
        if (index === 0) {
            isVertical ? (c.y = onlyRect.y - 10) : (c.x = onlyRect.x - 10)
        } else {
            isVertical ? (c.y = onlyRect.y + onlyRect.height + 10) : (c.x = onlyRect.x + onlyRect.width + 10)
        }
    } else if (beforeRect && afterRect) {
        const delta = Math.abs(
            isVertical ? beforeRect.y + beforeRect.height - afterRect.y : beforeRect.x + beforeRect.width - afterRect.x
        )
        isVertical ? (c.y = afterRect.y - delta / 2) : (c.x = afterRect.x - delta / 2)
    } else if (beforeRect) {
        const beforeBefore = childrenRects[index - 2]
        const delta = Math.abs(
            isVertical
                ? beforeBefore.y + beforeBefore.height - beforeRect.y
                : beforeBefore.x + beforeBefore.width - beforeRect.x
        )
        isVertical
            ? (c.y = beforeRect.y + beforeRect.height + delta / 2)
            : (c.x = beforeRect.x + beforeRect.width + delta / 2)
    } else if (afterRect) {
        const afterAfter = childrenRects[index + 1]
        const delta = Math.abs(
            isVertical ? afterRect.y + afterRect.height - afterAfter.y : afterRect.x + afterRect.width - afterAfter.x
        )
        isVertical ? (c.y = afterRect.y - delta / 2) : (c.x = afterRect.x - delta / 2)
    }
    c.x = Math.min(Math.max(4, c.x), containerSize.width - 8)
    c.y = Math.min(Math.max(4, c.y), containerSize.height - 8)
    return createLine(direction, crossAlignment, crossPaddingOffset, c, containerSize, insertedLayerSize)
}

function createLine(
    direction: StackDirection,
    crossAlignment: StackAlignment,
    crossPaddingOffset: number,
    centerPoint: Point,
    containerSize: Size,
    insertedLayerSize: Size
): Line {
    const isVertical = direction === "vertical"
    let a: Point
    let b: Point
    const crossOffset = 10 + crossPaddingOffset

    switch (crossAlignment) {
        case "center":
            a = {
                x: isVertical ? centerPoint.x - insertedLayerSize.width / 2 : centerPoint.x,
                y: isVertical ? centerPoint.y : centerPoint.y - insertedLayerSize.height / 2,
            }
            b = {
                x: isVertical ? centerPoint.x + insertedLayerSize.width / 2 : centerPoint.x,
                y: isVertical ? centerPoint.y : centerPoint.y + insertedLayerSize.height / 2,
            }
            break
        case "start":
            a = {
                x: isVertical ? crossOffset : centerPoint.x,
                y: isVertical ? centerPoint.y : crossOffset,
            }
            b = {
                x: isVertical ? insertedLayerSize.width + crossOffset : centerPoint.x,
                y: isVertical ? centerPoint.y : insertedLayerSize.height + crossOffset,
            }
            break
        case "end":
        default:
            a = {
                x: isVertical ? containerSize.width - insertedLayerSize.width - crossOffset : centerPoint.x,
                y: isVertical ? centerPoint.y : containerSize.height - insertedLayerSize.height - crossOffset,
            }
            b = {
                x: isVertical ? containerSize.width - crossOffset : centerPoint.x,
                y: isVertical ? centerPoint.y : containerSize.height - crossOffset,
            }
            break
    }
    return { a, b }
}

function stackDistributionAndAlignmentToFlexbox(alignment: StackDistribution | StackAlignment) {
    switch (alignment) {
        case "start":
            return "flex-start"
        case "end":
            return "flex-end"
        default:
            return alignment
    }
}

function placeholderStyling(zoom: number): Partial<FrameProperties> {
    return {
        borderWidth: 1 / zoom,
        borderStyle: "dashed",
        borderColor: "#09F",
        background: "rgba(0, 153, 255, 0.3)",
        color: "#09F",
    }
}
