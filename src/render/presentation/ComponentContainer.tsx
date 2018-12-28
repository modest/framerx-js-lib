import * as React from "react"
import { Layer, LayerProps } from "./Layer"
import { Frame } from "../../components/Frame"
import { ConstraintProperties, ConstraintValues, UserConstraintValues } from "../types/Constraints"
import { Rect } from "../types/Rect"
import { componentLoader } from "../componentLoader"
import { Animatable, AnimatableObject } from "../../animation/Animatable"
import { RenderEnvironment, RenderTarget } from "../types/RenderEnvironment"
import { Size } from "../types/Size"
import { WithFractionOfFreeSpace } from "../traits/FreeSpace"
import { FrameProperties } from "./Frame"

// tracking time limits for code components
const TIME_LIMIT = 9 // max millis a component may run for, due to GC etc, we cannot realistically do just 1 or 2 millis
const TIME_LIMIT_PREVIEW = 5000 // in preview, we still want to break endless loops, etc.
const COUNTER_START_VALUE = 200

let budgetCounter = COUNTER_START_VALUE // quick check counter
let budgetDeadLine = 0 // deadline
let isRunningInNextFrame = true

// Called before the component container renders it's children
// children are basically `React.createElement(component.className)`, so will trigger the component's
// lifecycle when the component container's render() method returns.
// But due to react, async, or event handlers, it is hard to exactly maintain a per component budget.
// Basically any async will share it's budget with all other components.
function resetComponentTimeBudget() {
    budgetCounter = COUNTER_START_VALUE

    const limit = RenderEnvironment.target === RenderTarget.preview ? TIME_LIMIT_PREVIEW : TIME_LIMIT
    budgetDeadLine = Date.now() + limit

    // for all async/callbacks/animations we have one global budget per frame
    if (isRunningInNextFrame) {
        isRunningInNextFrame = false
        setTimeout(() => {
            isRunningInNextFrame = true
        }, 1)
    }

    // make sure our version of checkbudget is installed
    if (window["__checkBudget__"] !== checkBudget) {
        window["__checkBudget__"] = checkBudget
    }
}

// all component code (but not their libraries) will call this per function or loop entry
// will first do a quick check, then a slower check if we are out of time
function checkBudget() {
    if (--budgetCounter < 0) checkBudgetFull()
}

function checkBudgetFull() {
    if (isRunningInNextFrame) {
        resetComponentTimeBudget()
    } else if (Date.now() > budgetDeadLine) {
        throw Error("Component exceeded time limit.")
    }
    budgetCounter = COUNTER_START_VALUE
}

window["__checkBudget__"] = checkBudget

/**
 * @internal
 */
export interface ComponentContainerProps extends ConstraintProperties {
    rotation: Animatable<number> | number
    opacity: number
    visible: boolean
    componentIdentifier: string
}

/**
 * @internal
 */
export interface ComponentContainerState {
    lastError?: {
        // Used to re-probe component for errors (see render method).
        children: React.ReactNode
        name: string
        message: string
        componentStack: string[]
    }
}

/**
 * @internal
 */
export interface ComponentContainerProperties extends ComponentContainerProps, LayerProps {}

/**
 * @internal
 */
export class ComponentContainer extends Layer<ComponentContainerProperties, ComponentContainerState> {
    static supportsConstraints = true
    state: ComponentContainerState = {}

    static defaultComponentContainerProps: ComponentContainerProps = {
        left: null,
        right: null,
        top: null,
        bottom: null,
        centerX: "50%",
        centerY: "50%",
        aspectRatio: null,
        parentSize: null,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        visible: true,
        componentIdentifier: "",
    }

    static readonly defaultProps: ComponentContainerProperties = {
        ...Layer.defaultProps,
        ...ComponentContainer.defaultComponentContainerProps,
    }

    static rect(props: Partial<ConstraintProperties>): Rect {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toRect(constraintValues, props.parentSize || null)
    }

    get rect() {
        return ConstraintValues.toRect(this.constraintValues(), this.props.parentSize || null)
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

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        let stack = info.componentStack.split("\n").filter(line => line.length !== 0)
        let currentIndex = 0
        for (const line of stack) {
            if (line.startsWith(`    in ${this.constructor.name}`)) {
                break
            }
            currentIndex++
        }
        stack = stack.slice(0, currentIndex)
        this.setState({
            lastError: {
                children: this.props.children,
                name: error.name,
                message: error.message,
                componentStack: stack,
            },
        })
    }

    constraintValues(): UserConstraintValues {
        // TODO add proper caching and cache invalidation
        return ConstraintValues.fromProperties(this.props)
    }

    render() {
        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()
        let { children } = this.props
        const { lastError: error } = this.state

        // If an error occurred, componentDidCatch will set error. Additionally, we keep track of the child(ren)
        // reference of this container and only render the error when nothing changed. This means we will
        // re-render the component when something does change, which will either take us out of the error state
        // or update the children reference and keep showing the error. Effectively, this re-probes the component
        // for errors, without throwing an error twice in a row which would make React skip this error boundary
        // and go up the stack.
        if (error && error.children === children) {
            const { componentIdentifier } = this.properties
            const component = componentLoader.componentForIdentifier(componentIdentifier)
            const file = !!component ? component.file : "???"
            const shouldCompute = RenderEnvironment.zoom > 1
            const isEnoughSpace =
                this.props.width &&
                this.props.height &&
                this.rect.width > 200 / (shouldCompute ? RenderEnvironment.zoom : 1) &&
                this.rect.height > 50 / (shouldCompute ? RenderEnvironment.zoom : 1)

            const computedErrorHeaderStyle = {
                ...errorHeaderStyle,
                paddingBottom: isEnoughSpace ? 12 * (shouldCompute ? 1 / RenderEnvironment.zoom : 1) : 0,
                maxWidth: isEnoughSpace ? 200 * (shouldCompute ? 1 / RenderEnvironment.zoom : 1) : "unset",
            }

            const computedErrorListStyle = {
                ...errorListStyle,
                paddingLeft: 13 * (shouldCompute ? 1 / RenderEnvironment.zoom : 1),
                maxWidth: isEnoughSpace ? 200 * (shouldCompute ? 1 / RenderEnvironment.zoom : 1) : "unset",
            }

            const computedErrorStyle = {
                ...errorStyle,
                fontSize: 11 * (shouldCompute ? 1 / RenderEnvironment.zoom : 1),
                lineHeight: "1.2em",
            }

            return (
                <Frame {...this.properties} background={null} style={computedErrorStyle}>
                    <div style={computedErrorHeaderStyle}>
                        {error.name} in {file}: {error.message}
                    </div>
                    {isEnoughSpace && (
                        <ul style={errorListFirstItemStyle}>
                            <li key={"main"}>{error.componentStack[0]}</li>
                            <ul style={computedErrorListStyle}>
                                {error.componentStack.slice(1).map((line, index) => (
                                    <li key={index}>{line}</li>
                                ))}
                            </ul>
                        </ul>
                    )}
                </Frame>
            )
        }

        resetComponentTimeBudget()
        let frameProps: Partial<FrameProperties> = this.properties
        if (RenderTarget.current() !== RenderTarget.canvas) {
            // For Code Overrides, we want the styling properties to be applied to the Frame,
            // and the rest to the actual component
            const {
                left,
                right,
                top,
                bottom,
                centerX,
                centerY,
                aspectRatio,
                parentSize,
                width,
                height,
                rotation,
                opacity,
                visible,
                // Remove the children and the componentIdentifier from the props passed into the component
                // tslint:disable-next-line:no-unused-variable
                componentIdentifier,
                children: originalChildren,
                ...childProps
            } = this.properties
            children = React.Children.map(originalChildren, child => {
                if (typeof child === "string" || typeof child === "number") {
                    return child
                }
                return React.cloneElement(child, childProps)
            })
            frameProps = {
                left,
                right,
                top,
                bottom,
                centerX,
                centerY,
                aspectRatio,
                parentSize,
                width,
                height,
                rotation,
                opacity,
                visible,
            }
        }
        return (
            <Frame {...frameProps} background={null}>
                {children}
            </Frame>
        )
    }
}

const errorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 85, .1)",
    lineHeight: "1.2em",
}

const errorHeaderStyle: React.CSSProperties = {
    padding: 0,
    color: "rgb(255, 0, 85)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontWeight: "bold",
    textAlign: "left",
}

const errorListFirstItemStyle: React.CSSProperties = {
    listStyle: "disc inside",
    margin: 0,
    padding: 0,
    paddingLeft: 0,
    color: "rgba(255, 0, 85, .5)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    textAlign: "left",
}

const errorListStyle: React.CSSProperties = {
    ...errorListFirstItemStyle,
    listStyle: "circle inside",
}
