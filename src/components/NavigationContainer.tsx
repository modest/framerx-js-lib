import * as React from "react"
import { AnimatableObject, Animatable } from "../animation/Animatable"
import { animate } from "../animation/animate"
import { Frame, FrameProps } from "../components/Frame"
import { ObservableObject } from "../data/ObservableObject"
import { SpringOptions } from "../animation/Animators"
import { FramerAnimation } from "../animation/FramerAnimation"
import { Size, isEqual } from "../render"

export interface Props {
    // tslint:disable:react-unused-props-and-state
    contextSize: Size
    contentSize: Size
    initialProps: Partial<FrameProps>
    transitionProps: Partial<FrameProps>
    animationDuration: number
    visible: boolean
    hideAfterTransition: boolean

    onTapBackdrop: (() => void) | undefined
    backdropColor: string | undefined
}

export type AnimatingProperties = Partial<FrameProps> & { dimOpacity: number }
export interface State {
    previousProps: Props | null
    observedFrameProps: AnimatableObject<AnimatingProperties> | undefined
    latestAnimation: FramerAnimation<AnimatingProperties, SpringOptions> | undefined
    visible: boolean
    containerPerspective: 1200 | 0
}

const springAnimationOptions = { tension: 500, friction: 50, tolerance: 1 }

export class NavigationContainer extends React.Component<Props, State> {
    state: State = {
        previousProps: null,
        observedFrameProps: undefined,
        latestAnimation: undefined,
        visible: true,
        containerPerspective: 0,
    }

    componentDidMount() {
        this.componentDidUpdate()
    }

    componentWillUnmount() {
        const { latestAnimation } = this.state
        if (latestAnimation && !latestAnimation.isFinished) {
            latestAnimation.cancel()
        }
    }

    onTransitionEnd = () => {
        const visible = this.props.hideAfterTransition ? false : true
        const containerPerspective = needsPerspective(this.state.observedFrameProps) ? 1200 : 0
        if (visible === this.state.visible && containerPerspective === this.state.containerPerspective) return
        this.setState({
            visible,
            containerPerspective,
        })
    }

    componentDidUpdate() {
        if (this.state.latestAnimation && !this.state.latestAnimation.isFinished()) {
            this.state.latestAnimation.onfinish = this.onTransitionEnd
        }
    }

    static getDerivedStateFromProps(props: Props, previousState: State): State | null {
        if (isEqual(previousState.previousProps, props)) return previousState

        if (previousState.latestAnimation && !previousState.latestAnimation.isFinished) {
            previousState.latestAnimation.cancel()
        }

        const observedFrameProps =
            previousState.observedFrameProps ||
            ObservableObject({ ...allAnimatableProperties, ...props.initialProps }, true)

        const framePropsEndState = {
            ...allAnimatableProperties,
            ...props.transitionProps,
            dimOpacity: props.hideAfterTransition ? 0 : 1,
        }

        let latestAnimation: FramerAnimation<AnimatingProperties, SpringOptions> | undefined
        let visible = props.visible

        if (props.animationDuration <= 0) {
            Object.assign(observedFrameProps, framePropsEndState)
            visible = visible && !props.hideAfterTransition
        } else {
            latestAnimation = animate.spring<AnimatingProperties>(
                observedFrameProps,
                framePropsEndState,
                springAnimationOptions
            )
        }

        return {
            previousProps: props,
            observedFrameProps,
            latestAnimation,
            visible,
            containerPerspective: needsPerspective(observedFrameProps) ? 1200 : 0,
        }
    }

    render() {
        const { contextSize, contentSize, backdropColor, onTapBackdrop } = this.props
        const { visible, containerPerspective, observedFrameProps } = this.state

        return (
            <Frame
                key={containerPerspective}
                width={contextSize.width}
                height={contextSize.height}
                visible={visible}
                background={"transparent"}
                overflow={"hidden"}
                preserve3d={false}
                perspective={containerPerspective}
            >
                <Frame
                    width={contextSize.width}
                    height={contextSize.height}
                    opacity={observedFrameProps ? observedFrameProps.dimOpacity : 0}
                    background={backdropColor ? backdropColor : "transparent"}
                    onTap={onTapBackdrop}
                />
                <Frame
                    {...observedFrameProps as FrameProps}
                    width={contentSize.width}
                    height={contentSize.height}
                    background={"transparent"}
                >
                    {this.props.children}
                </Frame>
            </Frame>
        )
    }
}

function needsPerspective(containerProps: AnimatableObject<AnimatingProperties> | undefined) {
    if (!containerProps) return false
    const rotationX = Animatable.getNumber(containerProps.rotationX as number, 0)
    const rotationY = Animatable.getNumber(containerProps.rotationY as number, 0)
    const z = Animatable.getNumber(containerProps.z as number, 0)
    return rotationX !== 0 || rotationY !== 0 || z !== 0
}

const allAnimatableProperties: Partial<FrameProps> & { dimOpacity: number } = {
    top: 0,
    left: 0,
    z: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    skew: 0,
    skewX: 0,
    skewY: 0,
    originX: 0.5,
    originY: 0.5,
    originZ: 0,
    opacity: 1,
    dimOpacity: 0,
}
