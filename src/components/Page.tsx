import * as React from "react"
import { Scroll, ScrollEvents, ScrollProps } from "./Scroll"
import { PageContainer } from "./PageContainer"
import { InertialScroll, SpringOptions } from "../animation/Animators"
import { MainLoopAnimationDriver } from "../animation/Drivers/MainLoopDriver"
import { Rect, LayerProps, PropertyControls, ControlType, Size, isFiniteNumber } from "../render"
import { animate } from "../animation/animate"
import { FramerAnimation } from "../animation/FramerAnimation"
import { FrameProperties } from "../render/presentation/Frame"
import { Frame as CoreFrame } from "../render"
import { EmptyState } from "./EmptyState"
import { Animatable, isAnimatable, Change } from "../animation/Animatable"
import { PrecalculatedAnimator } from "../animation/Animators/PrecalculatedAnimator"
import { ObservableObject } from "../data/ObservableObject"
import { FramerEvent } from "../events"
import { DragEvents } from "./hoc/WithDragging"
import { Frame } from "./Frame"
import { RenderTarget, RenderEnvironment } from "../render/types/RenderEnvironment"
import { TransactionId, Cancel } from "../animation/Animatable/Animatable"

export type PageDirection = "horizontal" | "vertical"

namespace ContentDimension {
    export const Auto: PageContentDimension = "auto"
    export const Stretch: PageContentDimension = "stretch"
}
export type PageContentDimension = "auto" | "stretch"
const pageContentDimensionOptions: PageContentDimension[] = [ContentDimension.Auto, ContentDimension.Stretch]
const pageContentDimensionTitles = pageContentDimensionOptions.map(option => {
    switch (option) {
        case ContentDimension.Auto:
            return "Auto"
        case ContentDimension.Stretch:
            return "Stretch"
    }
}) as string[]

export enum PageAlignment {
    Start = "start",
    Center = "center",
    End = "end",
}
const pageAlignmentOptions: PageAlignment[] = [PageAlignment.Start, PageAlignment.Center, PageAlignment.End]
const genericAlignmentTitles = pageAlignmentOptions.map(option => {
    switch (option) {
        case PageAlignment.Start:
            return "Start"
        case PageAlignment.Center:
            return "Center"
        case PageAlignment.End:
            return "End"
    }
})
const horizontalAlignmentTitles = pageAlignmentOptions.map(option => {
    switch (option) {
        case PageAlignment.Start:
            return "Left"
        case PageAlignment.Center:
            return "Center"
        case PageAlignment.End:
            return "Right"
    }
})
const verticalAlignmentTitles = pageAlignmentOptions.map(option => {
    switch (option) {
        case PageAlignment.Start:
            return "Top"
        case PageAlignment.Center:
            return "Center"
        case PageAlignment.End:
            return "Bottom"
    }
})

/**
 * @public
 */
export enum PageEffect {
    None = "none",
    Cube = "cube",
    CoverFlow = "coverflow",
    Wheel = "wheel",
    Pile = "pile",
}
const pageEffectOptions: PageEffect[] = [
    PageEffect.None,
    PageEffect.CoverFlow,
    PageEffect.Cube,
    PageEffect.Wheel,
    PageEffect.Pile,
]
const pageEffectTitles = pageEffectOptions.map(option => {
    switch (option) {
        case PageEffect.None:
            return "None"
        case PageEffect.Cube:
            return "Cube"
        case PageEffect.CoverFlow:
            return "Cover Flow"
        case PageEffect.Wheel:
            return "Wheel"
        case PageEffect.Pile:
            return "Pile"
    }
})

type ScrollAnimation = MainLoopAnimationDriver<InertialScroll, number, any>

interface PageEffectInfo {
    offset: number
    normalizedOffset: number
    size: Size
    index: number
    direction: PageDirection
    gap: number
    pageCount: number // Infinity when looped
}
export type CustomPageEffect = (info: PageEffectInfo) => Partial<FrameProperties>

export type PageEventHandler = (event: FramerEvent, pageComponent: Page) => void

/** @public */
export interface PageEvents {
    onChangePage: (currentIndex: number, previousIndex: number, pageComponent: Page) => void
}

/**
 * All properties that can be used with the {@link Page} component it also extends all {@link ScrollProperties} properties.
 * @public
 */
export interface PageProperties {
    /**
     * Current swipe direction. Either "horizontal" or "vertical".
     */
    direction: PageDirection
    /**
     * Width of the pages within the component. Either "auto" or "stretch" or a numeric value.
     */
    contentWidth: PageContentDimension | number
    /**
     * Height of the pages within the component. Either "auto" or "stretch" or a numeric value.
     */
    contentHeight: PageContentDimension | number
    /** Alignment of the pages within the component. Either "start", "center", or "end" */
    alignment: PageAlignment
    /** Index of the current page. */
    currentPage: number
    /**
     * @beta
     */
    animateCurrentPageUpdate: boolean
    /** Gap between the page. */
    gap: number
    /** Padding within the page component. */
    padding: number
    /** Set padding on all sides, or one specific one. */
    paddingPerSide: boolean
    /** Top padding within the page component. */
    paddingTop: number
    /** Right padding within the page component. */
    paddingRight: number
    /** Bottom padding within the page component. */
    paddingBottom: number
    /** Left padding within the page component. */
    paddingLeft: number
    /** Enable or disabling momentum, which defines if the page should auto-snap to the next page or not. */
    momentum: boolean
    /** Enable dragging of the scroll inside the page component. */
    draggingEnabled: boolean

    /** Pick an effect from one of the defaults. */
    defaultEffect: PageEffect
    /** @beta */
    effect?: CustomPageEffect
}

/** @public */
export interface PageProps
    extends PageProperties,
        FrameProperties,
        LayerProps,
        Partial<PageEvents>,
        Partial<DragEvents<typeof Frame>>,
        Partial<ScrollEvents> {}

/**
 * The Page component allows you to create horizontally or vertically swipeable areas. It can be imported from the Framer Library and used in code components. Add children to create pages to swipe between. These children will be stretched to the size of the page component by default, but can also be set to auto to maintain their original size.
 * See {@link PageProperties} for it's properties
 * @public
 */
export class Page extends React.Component<Partial<PageProps>> {
    /** @internal */
    static _isStylable = true

    private pages: { rect: Rect; effectValues: Partial<FrameProperties> | undefined }[] = []
    private animation: FramerAnimation<number, SpringOptions> | null

    private propsBoundedCurrentPage = 0 // Bounded version of props.currentPage (see componentWillUpdate)
    private shouldReflectPropsBoundedCurrentPage = false // Whether to reflect propsBoundedCurrentPage (see componentDidUpdate)
    private contentOffset: {
        x: Animatable<number>
        y: Animatable<number>
    }
    private currentContentPage = 0
    private cancelUpdating: Cancel | undefined

    private static pageProps: PageProperties & Partial<ScrollProps> = {
        direction: "horizontal",
        contentWidth: ContentDimension.Stretch,
        contentHeight: ContentDimension.Stretch,
        alignment: PageAlignment.Start,

        currentPage: 0,
        animateCurrentPageUpdate: true,

        gap: 10,

        padding: 0,
        paddingPerSide: false,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,

        momentum: false,
        draggingEnabled: true,

        defaultEffect: PageEffect.None,

        background: "transparent",
    }

    /** @internal */
    static defaultProps: PageProps = Object.assign({}, CoreFrame.defaultProps, Scroll.scrollProps, Page.pageProps)

    /** @internal */
    static propertyControls: PropertyControls<PageProps> = {
        direction: { type: ControlType.SegmentedEnum, options: ["horizontal", "vertical"], title: "Direction" },
        contentWidth: {
            type: ControlType.SegmentedEnum,
            options: pageContentDimensionOptions,
            optionTitles: pageContentDimensionTitles,
            title: "Width",
        },
        contentHeight: {
            type: ControlType.SegmentedEnum,
            options: pageContentDimensionOptions,
            optionTitles: pageContentDimensionTitles,
            title: "Height",
        },
        alignment: {
            type: ControlType.SegmentedEnum,
            options: pageAlignmentOptions,
            optionTitles(props) {
                if (!props) return genericAlignmentTitles
                const crossDirectionIsHorizontal = props.direction !== "horizontal"
                return crossDirectionIsHorizontal ? horizontalAlignmentTitles : verticalAlignmentTitles
            },
            title: "Align",
            hidden(props) {
                const { direction, contentWidth, contentHeight } = props
                const isHorizontalDirection = direction === "horizontal"
                const crossDimension = isHorizontalDirection ? contentHeight : contentWidth
                return crossDimension === ContentDimension.Stretch
            },
        },
        gap: {
            type: ControlType.Number,
            min: 0,
            title: "Gap",
        },
        padding: {
            type: ControlType.FusedNumber,
            toggleKey: "paddingPerSide",
            toggleTitles: ["Padding", "Padding per side"],
            valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
            valueLabels: ["T", "R", "B", "L"],
            min: 0,
            title: "Padding",
        },
        currentPage: {
            type: ControlType.Number,
            min: 0,
            title: "Current",
            displayStepper: true,
        },
        momentum: {
            type: ControlType.Boolean,
            enabledTitle: "On",
            disabledTitle: "Off",
            title: "Momentum",
        },
        draggingEnabled: {
            type: ControlType.Boolean,
            enabledTitle: "On",
            disabledTitle: "Off",
            title: "Dragging",
        },
        defaultEffect: {
            type: ControlType.Enum,
            options: pageEffectOptions,
            optionTitles: pageEffectTitles,
            title: "Effect",
        },
        children: {
            type: ControlType.Array,
            title: "Content",
            propertyControl: { type: ControlType.ComponentInstance, title: "Page" },
        },
    }

    private get properties(): PageProps {
        // React takes care of this, as long as defaultProps are defined: https://reactjs.org/docs/react-component.html#defaultprops
        return this.props as PageProps
    }

    private get isHorizontalDirection(): boolean {
        return this.properties.direction === "horizontal"
    }

    private get currentContentOffset(): Animatable<number> {
        return this.isHorizontalDirection ? this.contentOffset.x : this.contentOffset.y
    }

    private boundedCurrentPage(props: PageProps): number {
        // The current page property is capped to the number of children when positive, and cycles from last when negative
        const childCount = React.Children.count(props.children)
        const currentPage = props.currentPage || 0
        return currentPage >= 0
            ? Math.min(currentPage, childCount - 1)
            : ((currentPage % childCount) + childCount) % childCount
    }

    /**
     * @internal
     */
    componentWillUpdate(nextProps: PageProps) {
        const boundedCurrentPage = this.boundedCurrentPage(nextProps || this.props)
        if (this.propsBoundedCurrentPage !== boundedCurrentPage) {
            this.propsBoundedCurrentPage = boundedCurrentPage
            this.shouldReflectPropsBoundedCurrentPage = true
        }
    }

    /**
     * @internal
     */
    componentDidUpdate() {
        if (this.shouldReflectPropsBoundedCurrentPage) {
            this.shouldReflectPropsBoundedCurrentPage = false
            if (this.currentContentPage !== this.propsBoundedCurrentPage) {
                const offset = this.offsetForPage(this.propsBoundedCurrentPage)
                if (this.props.onChangePage) {
                    this.props.onChangePage(this.propsBoundedCurrentPage, this.currentContentPage, this)
                }
                this.currentContentPage = this.propsBoundedCurrentPage

                this.cancelAnimation()
                if (this.properties.animateCurrentPageUpdate) {
                    this.animation = animate.spring(this.currentContentOffset, offset, { tension: 500, friction: 50 })
                } else {
                    this.currentContentOffset.set(offset)
                }
            }
        }
        if (this.cancelUpdating) {
            this.cancelUpdating()
            this.applyEffects()
        }
        this.cancelUpdating = this.currentContentOffset.onUpdate(this.contentOffsetUpdated)
    }

    private nearestPageIndex = (
        startPosition: number,
        endPosition: number,
        isHorizontalDirection: boolean,
        allowSkippingPages: boolean
    ): number => {
        const distanceToStart = function(rect: Rect): number {
            const rectPosition = isHorizontalDirection ? rect.x : rect.y
            return Math.abs(rectPosition + startPosition)
        }

        const distanceToEnd = function(rect: Rect): number {
            const rectPosition = isHorizontalDirection ? rect.x : rect.y
            return Math.abs(rectPosition + endPosition)
        }

        if (allowSkippingPages) {
            const closestPages = [...this.pages].sort((a, b) => distanceToEnd(a.rect) - distanceToEnd(b.rect))
            return this.pages.indexOf(closestPages[0])
        } else {
            const closestToStart = [...this.pages].sort((a, b) => distanceToStart(a.rect) - distanceToStart(b.rect))
            if (closestToStart.length === 1) return this.pages.indexOf(closestToStart[0])
            const pageA = closestToStart[0]
            const pageB = closestToStart[1]
            const closestPages = [pageA, pageB].sort((a, b) => distanceToEnd(a.rect) - distanceToEnd(b.rect))
            return this.pages.indexOf(closestPages[0])
        }
    }

    private onDragAnimationStart = (animation: { x: ScrollAnimation; y: ScrollAnimation }) => {
        animation.x.cancel()
        animation.y.cancel()

        const { momentum, onChangePage } = this.properties

        const isHorizontalDirection = this.isHorizontalDirection
        const animator = new PrecalculatedAnimator({
            animator: isHorizontalDirection ? animation.x.animator : animation.y.animator,
        })

        const startPosition = this.currentContentOffset.get()
        const endPosition = animator.endValue

        const index = this.nearestPageIndex(startPosition, endPosition, isHorizontalDirection, momentum)
        const offset = this.offsetForPage(index)

        if (onChangePage) {
            onChangePage(index, this.currentContentPage, this)
        }
        this.currentContentPage = index
        this.animation = animate.spring(this.currentContentOffset, offset, { tension: 500, friction: 50 })
    }

    private onDragSessionStart = () => {
        this.cancelAnimation()
    }

    private applyEffects() {
        this.pages.forEach((page, index) => {
            const pageRect = page.rect
            const values = this.effectValues(index, pageRect)
            if (page.effectValues && values) {
                for (const key in values) {
                    if (isAnimatable(page.effectValues[key])) {
                        // Because these are the actual Animatable values passed to the Frame
                        // Updating their value will modify the Frame
                        page.effectValues[key].set(values[key])
                    }
                }
            }
        })
    }

    private contentOffsetUpdated = (change: Change<number>, transaction?: TransactionId) => {
        this.applyEffects()
    }

    private cancelAnimation = () => {
        if (this.animation) {
            this.animation.cancel()
            this.animation = null
        }
    }

    private effectValues(index: number, pageRect: Rect): Partial<FrameProperties> | null {
        const { direction, defaultEffect, effect } = this.properties
        const effectFunction = effect || defaultEffects(defaultEffect)
        if (!effectFunction) {
            return null
        }
        let offset: number
        let normalizedOffset: number
        if (direction === "horizontal") {
            offset = pageRect.x + (this.contentOffset ? this.contentOffset.x.get() : 0)
            normalizedOffset = offset / pageRect.width
        } else {
            offset = pageRect.y + (this.contentOffset ? this.contentOffset.y.get() : 0)
            normalizedOffset = offset / pageRect.height
        }

        const size = { width: pageRect.width, height: pageRect.height }

        return effectFunction({
            offset,
            normalizedOffset,
            size,
            index,
            direction,
            pageCount: this.pages.length,
            gap: this.properties.gap,
        })
    }

    private wrapHandler<F extends (...args: any[]) => void>(ownHandler: F, originalHandler: F | undefined): F {
        if (!originalHandler) {
            return ownHandler
        }
        const wrappedFunction: any = (...args: any[]): void => {
            ownHandler(...args)
            originalHandler(...args)
        }
        return wrappedFunction
    }

    private offsetForPage(index: number): number {
        const pageCount = this.pages.length
        const currentPage = this.pages[Math.max(0, Math.min(pageCount - 1, index))]
        if (!currentPage) {
            return 0
        }
        if (this.isHorizontalDirection) {
            return -currentPage.rect.x
        } else {
            return -currentPage.rect.y
        }
    }

    /**
     * @internal
     */
    render() {
        const { direction, contentWidth, contentHeight, children, gap } = this.properties

        const rect = CoreFrame.rect(this.properties)
        const padding = paddingFromProps(this.properties)

        const scrollContainerSize = {
            width: Math.max(0, rect.width - padding.left - padding.right),
            height: Math.max(0, rect.height - padding.top - padding.bottom),
        }

        const isHorizontalDirection = this.isHorizontalDirection

        const pageCount = React.Children.count(children)

        this.pages = []

        let maxX = 0
        let maxY = 0

        const mainDimension = isHorizontalDirection ? contentWidth : contentHeight
        const crossDimension = isHorizontalDirection ? contentHeight : contentWidth
        const alignment =
            crossDimension === ContentDimension.Stretch ? ContentDimension.Stretch : this.properties.alignment

        const childComponents = React.Children.map(children, (child, index) => {
            if (child === null || typeof child !== "object") return child

            const childRect = { ...CoreFrame.rect(child.props), x: maxX, y: maxY }

            if (mainDimension === ContentDimension.Stretch) {
                if (isHorizontalDirection) {
                    childRect.width = scrollContainerSize.width
                } else {
                    childRect.height = scrollContainerSize.height
                }
            }

            if (isFiniteNumber(contentWidth)) {
                childRect.width = contentWidth
            }
            if (isFiniteNumber(contentHeight)) {
                childRect.height = contentHeight
            }

            switch (alignment) {
                case PageAlignment.Center:
                    if (isHorizontalDirection) {
                        childRect.y = scrollContainerSize.height / 2 - childRect.height / 2
                    } else {
                        childRect.x = scrollContainerSize.width / 2 - childRect.width / 2
                    }
                    break
                case PageAlignment.End:
                    if (isHorizontalDirection) {
                        childRect.y = scrollContainerSize.height - childRect.height
                    } else {
                        childRect.x = scrollContainerSize.width - childRect.width
                    }
                    break
                case ContentDimension.Stretch:
                    if (isHorizontalDirection) {
                        childRect.height = scrollContainerSize.height
                    } else {
                        childRect.width = scrollContainerSize.width
                    }
            }

            const isLastPage = index === pageCount - 1
            const gapOffset = isLastPage ? 0 : gap

            if (isHorizontalDirection) {
                maxX += childRect.width + gapOffset
            } else {
                maxY += childRect.height + gapOffset
            }
            const update = {
                width: childRect.width,
                height: childRect.height,
                right: null,
                bottom: null,
                top: 0,
                left: 0,
                aspectRatio: null,
            }

            let effect: Partial<FrameProperties> | undefined
            const values = this.effectValues(index, childRect)
            if (values) {
                // We use an ObservableObject here to make all values Animatable
                // So we can set them in the onMove function
                effect = ObservableObject(values, true, false) as Partial<FrameProperties>
            }
            this.pages.push({
                rect: childRect,
                effectValues: effect,
            })
            return (
                <PageContainer key={index} effect={effect} {...childRect}>
                    {React.cloneElement(child, update)}
                </PageContainer>
            )
        })

        const maxScrollOffset = Math.max(
            0,
            isHorizontalDirection ? maxX - scrollContainerSize.width : maxY - scrollContainerSize.height
        )
        this.pages.forEach(page => {
            if (isHorizontalDirection) {
                if (page.rect.x > maxScrollOffset) {
                    page.rect.x = maxScrollOffset
                }
            } else {
                if (page.rect.y > maxScrollOffset) {
                    page.rect.y = maxScrollOffset
                }
            }
        })

        if (!this.contentOffset || RenderEnvironment.target === RenderTarget.canvas) {
            if (!this.contentOffset) {
                this.contentOffset = {
                    x: Animatable(0),
                    y: Animatable(0),
                }
            }
            this.cancelUpdating = this.currentContentOffset.onUpdate(this.contentOffsetUpdated)
            if (this.props.currentPage !== undefined) {
                const boundedCurrentPage = this.boundedCurrentPage(this.properties)
                const offset = this.offsetForPage(boundedCurrentPage)
                this.currentContentOffset.set(offset)
                this.currentContentPage = boundedCurrentPage
            }
        }
        // Reset the content offset orthogonal to the scroll direction
        const crossScrollDirection = isHorizontalDirection ? this.contentOffset.y : this.contentOffset.x
        crossScrollDirection.set(0)

        return (
            <Frame preserve3d={false} perspective={1200} {...this.properties}>
                <Scroll
                    background={"transparent"}
                    direction={direction}
                    directionLock={true}
                    draggingEnabled={this.properties.draggingEnabled}
                    onScrollStart={this.properties.onScrollStart}
                    onScroll={this.properties.onScroll}
                    onScrollEnd={this.properties.onScrollEnd}
                    onScrollSessionStart={this.properties.onScrollSessionStart}
                    onScrollSessionEnd={this.properties.onScrollSessionEnd}
                    onMove={this.properties.onMove}
                    onDragDirectionLockStart={this.properties.onDragDirectionLockStart}
                    onDragAnimationStart={this.wrapHandler(
                        this.onDragAnimationStart,
                        this.properties.onDragAnimationStart
                    )}
                    onDragAnimationEnd={this.properties.onDragAnimationEnd}
                    onDragSessionStart={this.wrapHandler(this.onDragSessionStart, this.properties.onDragSessionStart)}
                    onDragSessionMove={this.properties.onDragSessionMove}
                    onDragSessionEnd={this.properties.onDragSessionEnd}
                    onDragStart={this.properties.onDragStart}
                    onDragWillMove={this.properties.onDragWillMove}
                    onDragDidMove={this.properties.onDragDidMove}
                    onDragEnd={this.properties.onDragEnd}
                    left={padding.left}
                    top={padding.top}
                    width={scrollContainerSize.width}
                    height={scrollContainerSize.height}
                    contentOffsetX={this.contentOffset.x}
                    contentOffsetY={this.contentOffset.y}
                    preserve3d={true}
                >
                    {pageCount > 0 && (
                        <Frame
                            background={null}
                            top={0}
                            left={0}
                            width={isHorizontalDirection ? maxX : scrollContainerSize.width}
                            height={isHorizontalDirection ? scrollContainerSize.height : maxY}
                            preserve3d={true}
                        >
                            {childComponents}
                        </Frame>
                    )}
                    <EmptyState
                        children={this.props.children!}
                        size={{ width: rect.width, height: rect.height }}
                        styleOverrides={{ color: "#09F", background: "rgba(0, 153, 255, 0.3)" }}
                    />
                </Scroll>
            </Frame>
        )
    }
}

function paddingFromProps(props: PageProps) {
    const { paddingPerSide, padding } = props
    if (paddingPerSide) {
        const { paddingTop, paddingBottom, paddingLeft, paddingRight } = props
        return {
            top: paddingTop,
            bottom: paddingBottom,
            left: paddingLeft,
            right: paddingRight,
        }
    }
    return {
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
    }
}

// Effects

function cubeEffect(info: PageEffectInfo) {
    const { normalizedOffset, direction } = info
    const isHorizontal = direction === "horizontal"
    return {
        originX: normalizedOffset < 0 ? 1 : 0,
        originY: normalizedOffset < 0 ? 1 : 0,
        rotationY: isHorizontal ? Math.min(Math.max(-90, normalizedOffset * 90), 90) : 0,
        rotationX: isHorizontal ? 0 : Math.min(Math.max(-90, normalizedOffset * -90), 90),
        backfaceVisible: false,
    }
}

function coverflowEffect(info: PageEffectInfo) {
    const { normalizedOffset, direction, size } = info
    const isHorizontal = direction === "horizontal"
    return {
        rotationY: isHorizontal ? Math.min(45, Math.max(-45, normalizedOffset * -45)) : 0,
        rotationX: isHorizontal ? 0 : Math.min(45, Math.max(-45, normalizedOffset * 45)),
        originX: isHorizontal ? (normalizedOffset < 0 ? 0 : 1) : 0.5,
        originY: isHorizontal ? 0.5 : normalizedOffset < 0 ? 0 : 1,
        left: isHorizontal ? (normalizedOffset * -size.width) / 4 : 0,
        top: isHorizontal ? 0 : (normalizedOffset * -size.height) / 4,
        style: { zIndex: 1000 - Math.abs(normalizedOffset) },
        scale: 1 - Math.abs(normalizedOffset / 10),
    }
}

function pileEffect(info: PageEffectInfo) {
    const { normalizedOffset, direction, size } = info
    const isHorizontal = direction === "horizontal"
    return {
        left: normalizedOffset < 0 && isHorizontal ? Math.abs(normalizedOffset) * (size.width - 8) : 0,
        top: normalizedOffset < 0 && !isHorizontal ? Math.abs(normalizedOffset) * (size.height - 8) : 0,
        scale: normalizedOffset < 0 ? 1 - Math.abs(normalizedOffset) / 50 : 1,
    }
}

function wheelEffect(info: PageEffectInfo) {
    const { normalizedOffset, direction, size } = info
    const isHorizontal = direction === "horizontal"
    return {
        originZ: -((isHorizontal ? size.width : size.height) * 18) / (2 * Math.PI),
        rotationX: isHorizontal ? 0 : normalizedOffset * -20,
        rotationY: isHorizontal ? normalizedOffset * 20 : 0,
        top: isHorizontal ? 0 : normalizedOffset * -size.height,
        left: isHorizontal ? normalizedOffset * -size.width : 0,
        opacity: 1 - Math.abs(normalizedOffset) / 4,
    }
}

function defaultEffects(type: PageEffect): CustomPageEffect | null {
    switch (type) {
        case PageEffect.Cube:
            return cubeEffect
        case PageEffect.CoverFlow:
            return coverflowEffect
        case PageEffect.Pile:
            return pileEffect
        case PageEffect.Wheel:
            return wheelEffect
        default:
            return null
    }
}
