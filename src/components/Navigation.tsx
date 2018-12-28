import * as React from "react"
import { Frame } from "./Frame"
import { Size } from "../render/types/Size"
import { NavigationTransitionOptions, Transition } from "./NavigationTransitions"
import { Rect } from "../render/types/Rect"
import { NavigationContainer } from "./NavigationContainer"
import { FrameProperties, isFiniteNumber } from "../render"
import { rectFromReactNode } from "../components/utils/RectProvider"

/**
 * @internal
 */
export interface Navigator {
    goBack: () => void
    instant: (Component: React.ReactNode) => void
    fade: (component: React.ReactNode) => void
    push: (Component: React.ReactNode) => void
    pushLeft: (Component: React.ReactNode) => void
    pushRight: (Component: React.ReactNode) => void
    pushDown: (Component: React.ReactNode) => void
    pushUp: (Component: React.ReactNode) => void
    modal: (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => void
    overlayTop: (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => void
    overlayBottom: (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => void
    overlayLeft: (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => void
    overlayRight: (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => void
    flipUp: (Component: React.ReactNode) => void
    flipDown: (Component: React.ReactNode) => void
    flipLeft: (Component: React.ReactNode) => void
    flipRight: (Component: React.ReactNode) => void
}

export const NavigatorContext = React.createContext<Navigator | null>(null)

/**
 * @internal
 */
export type NavigationProps = Partial<Rect>

/**
 * @internal
 */
export type NavigationItem = {
    key: string
    component: React.ReactNode
    transition: NavigationTransitionOptions
}

/**
 * @internal
 */
export interface NavigationState {
    current: number
    previous: number
    currentOverlay: number
    previousOverlay: number
}

/**
 * @internal
 */
export interface StackState {
    current: number
    previous: number
    stack: NavigationItem[]
}

/**
 * @internal
 */
export class Navigation extends React.Component<NavigationProps, NavigationState> implements Navigator {
    stack: NavigationItem[] = []
    overlayStack: NavigationItem[] = []
    activeTransition: NavigationTransitionOptions
    stackItemID = 0

    state = {
        current: -1,
        previous: -1,
        currentOverlay: -1,
        previousOverlay: -1,
    }

    componentDidMount() {
        if (this.stack.length === 0) {
            this.push(this.props.children, Transition.Instant)
        }
    }

    componentWillReceiveProps(props: NavigationProps) {
        this.stack[0].component = props["children"]
    }

    getStackState(overCurrentContext: boolean): StackState {
        const { current, previous, currentOverlay, previousOverlay } = this.state
        if (overCurrentContext) {
            return {
                current: currentOverlay,
                previous: previousOverlay,
                stack: this.overlayStack,
            }
        } else {
            return { current, previous, stack: this.stack }
        }
    }

    newStackItem(Component: React.ReactNode, transition: NavigationTransitionOptions) {
        this.stackItemID++
        return {
            key: `stack-${this.stackItemID}`,
            component: Component,
            transition: transition,
        }
    }

    push = (
        Component: React.ReactNode,
        transition: NavigationTransitionOptions = Transition.PushLeft,
        transitionOverrides?: NavigationTransitionOptions
    ) => {
        if (transitionOverrides) {
            transition = { ...transition, ...transitionOverrides }
        }

        const overCurrentContext = !!transition.overCurrentContext
        const stackState = this.getStackState(overCurrentContext)

        // Don't push to the same Frame twice
        const currentNavigationItem = stackState.stack[stackState.current]
        if (currentNavigationItem && currentNavigationItem.component === Component) {
            return
        }

        const stackItem = this.newStackItem(Component, transition)

        if (overCurrentContext) {
            this.overlayStack = [stackItem]
            this.setState({
                currentOverlay: Math.max(0, Math.min(this.state.currentOverlay + 1, this.overlayStack.length - 1)),
                previousOverlay: this.state.currentOverlay,
            })
        } else {
            this.stack.slice(0, stackState.current + 1)
            this.stack.push(stackItem)
            this.setState({
                current: Math.min(this.state.current + 1, this.stack.length - 1),
                previous: this.state.current,
                currentOverlay: -1,
                previousOverlay: this.state.currentOverlay,
            })
        }
    }

    goBack = () => {
        if (this.state.currentOverlay !== -1) {
            this.setState({ currentOverlay: -1, previousOverlay: this.state.currentOverlay })
            return
        }

        if (this.state.current === 0 || !this.state) return
        this.setState({ current: this.state.current - 1, previous: this.state.current })
    }

    instant = (Component: React.ReactNode) => {
        this.push(Component, Transition.Instant)
    }

    fade = (Component: React.ReactNode) => {
        this.push(Component, Transition.Fade)
    }

    pushLeft = (Component: React.ReactNode) => {
        this.push(Component, Transition.PushLeft)
    }

    pushRight = (Component: React.ReactNode) => {
        this.push(Component, Transition.PushRight)
    }

    pushDown = (Component: React.ReactNode) => {
        this.push(Component, Transition.PushDown)
    }

    pushUp = (Component: React.ReactNode) => {
        this.push(Component, Transition.PushUp)
    }

    modal = (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => {
        this.push(Component, Transition.Modal, overrides)
    }

    overlayTop = (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => {
        this.push(Component, Transition.OverlayTop, overrides)
    }

    overlayBottom = (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => {
        this.push(Component, Transition.OverlayBottom, overrides)
    }

    overlayLeft = (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => {
        this.push(Component, Transition.OverlayLeft, overrides)
    }

    overlayRight = (Component: React.ReactNode, overrides?: NavigationTransitionOptions) => {
        this.push(Component, Transition.OverlayRight, overrides)
    }

    flipUp = (Component: React.ReactNode) => {
        this.push(Component, Transition.FlipUp)
    }

    flipDown = (Component: React.ReactNode) => {
        this.push(Component, Transition.FlipDown)
    }

    flipLeft = (Component: React.ReactNode) => {
        this.push(Component, Transition.FlipLeft)
    }

    flipRight = (Component: React.ReactNode) => {
        this.push(Component, Transition.FlipRight)
    }

    contextSize(): Size {
        const width = this.props.width || 100
        const height = this.props.height || 100
        return { width, height }
    }

    contentSize(containerIndex: number, contextSize: Size, stackState: StackState): Size {
        const navigationItem = stackState.stack[containerIndex]
        if (navigationItem && navigationItem.component) {
            const { component } = navigationItem
            const rect = rectFromReactNode(component)
            if (rect) {
                if (navigationItem.transition.fitWidth !== false) rect.width = contextSize.width
                if (navigationItem.transition.fitHeight !== false) rect.height = contextSize.height
                return rect
            }
        }

        return contextSize
    }

    render() {
        const contextSize = this.contextSize()
        const navigationStackLength = this.stack.length
        const totalStack = [...this.stack, ...this.overlayStack]
        return (
            <Frame {...this.props} background={null} overflow={"hidden"}>
                <NavigatorContext.Provider value={this}>
                    {totalStack.map((item, containerIndex) => {
                        const overCurrentContext = !!item.transition.overCurrentContext
                        const stackIndex = overCurrentContext ? containerIndex - navigationStackLength : containerIndex
                        const stackState = this.getStackState(overCurrentContext)
                        const contentSize = this.contentSize(stackIndex, contextSize, stackState)
                        const hideAfterTransition = containerShouldHideAfterTransition(stackIndex, stackState)
                        return (
                            <NavigationContainer
                                key={item.key}
                                contextSize={contextSize}
                                contentSize={contentSize}
                                initialProps={initialPropsForContainer(
                                    stackIndex,
                                    contextSize,
                                    contentSize,
                                    stackState
                                )}
                                transitionProps={transitionPropsForContainer(
                                    stackIndex,
                                    contextSize,
                                    contentSize,
                                    stackState
                                )}
                                animationDuration={transitionDurationForContainer(stackIndex, stackState)}
                                visible={containerIsVisible(stackIndex, stackState)}
                                hideAfterTransition={hideAfterTransition}
                                backdropColor={item.transition.backdropColor}
                                onTapBackdrop={backdropTapAction(item.transition, hideAfterTransition, this.goBack)}
                            >
                                {containerContent(item, contextSize)}
                            </NavigationContainer>
                        )
                    })}
                </NavigatorContext.Provider>
            </Frame>
        )
    }
}

function initialPropsForContainer(
    containerIndex: number,
    contextSize: Size,
    contentSize: Size,
    stackState: StackState
): Partial<FrameProperties> {
    const navigationItem = stackState.stack[containerIndex]

    if (navigationItem && navigationItem.transition && navigationItem.transition.inStart) {
        return navigationItem.transition.inStart(contextSize, contentSize)
    }
    return { left: 0 }
}

function transitionPropsForContainer(
    containerIndex: number,
    contextSize: Size,
    contentSize: Size,
    stackState: StackState
): Partial<FrameProperties> {
    const { current, stack } = stackState

    if (containerIndex === current) {
        // current
        const navigationItem = stack[containerIndex]
        if (navigationItem && navigationItem.transition) {
            if (navigationItem.transition.inEnd) {
                return navigationItem.transition.inEnd(contextSize, contentSize)
            }
        }
        return { left: 0, top: 0 } // default current
    } else if (containerIndex < current) {
        // old
        const navigationItem = stack[containerIndex + 1]
        if (navigationItem && navigationItem.transition) {
            if (navigationItem.transition.outEnd) {
                return navigationItem.transition.outEnd(contextSize, contentSize)
            }
        }
        return { left: 0, top: 0 } // default old
    } else {
        // future
        const navigationItem = stack[containerIndex]
        if (navigationItem && navigationItem.transition) {
            if (navigationItem.transition.inStart) {
                return navigationItem.transition.inStart(contextSize, contentSize)
            }
        }
        return { left: 0, top: 0 } // default future
    }
}

function transitionDurationForContainer(containerIndex: number, stackState: StackState) {
    const { current, previous, stack } = stackState
    if (containerIndex !== previous && containerIndex !== current) return 0
    if (current === previous) return 0

    let navigationItem: NavigationItem | undefined

    if (current > previous) {
        navigationItem = stack[current]
    } else {
        navigationItem = stack[previous]
    }

    if (navigationItem && navigationItem.transition && isFiniteNumber(navigationItem.transition.transitionDuration)) {
        return navigationItem.transition.transitionDuration
    }

    return 0.5 // default
}

function containerIsVisible(containerIndex: number, stackState: StackState) {
    const { current, previous, stack } = stackState
    if (containerIndex > current && containerIndex > previous) return false
    if (containerIndex === current || containerIndex === previous) return true
    // containerIndex is smaller then previous or current
    const nextNavigationItem = stack[containerIndex]
    return nextNavigationItem && nextNavigationItem.transition.overCurrentContext === true
}

function containerShouldHideAfterTransition(containerIndex: number, stackState: StackState) {
    const { current, previous, stack } = stackState
    if (containerIndex !== previous) return false
    if (containerIndex > current) {
        return true
    } else {
        const navigationItem = stack[current]
        return !navigationItem || navigationItem.transition.overCurrentContext !== true
    }
}

function containerContent(item: NavigationItem, contextSize: Size) {
    return React.Children.map(item.component, child => {
        if (typeof child === "string" || typeof child === "number" || child === null) {
            return child
        }
        const update: Partial<{ top: number; left: number; width: number; height: number }> = { top: 0, left: 0 }
        const fitWidth = item.transition.fitWidth !== false
        const fitHeight = item.transition.fitHeight !== false
        if (fitWidth) update.width = contextSize.width
        if (fitHeight) update.height = contextSize.height
        return React.cloneElement(child, update)
    })
}

function backdropTapAction(
    transition: NavigationTransitionOptions,
    hideAfterTransition: boolean,
    goBackAction: () => void
) {
    if (!hideAfterTransition && transition.goBackOnTapOutside) {
        return goBackAction
    }
}
