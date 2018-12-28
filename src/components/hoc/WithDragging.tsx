import * as React from "react"
import { Point, Rect, ConstraintPercentage, isFiniteNumber } from "../../render"
import { FramerEvent, EventHandler } from "../../events/FramerEvent"
import { clamp } from "../../utils/math"
import { WithPanHandlers, WithMouseWheelHandler } from "./WithEvents"
import { InertialScrollAnimator } from "../../animation/Animators/InertialScrollAnimator"
import { Animatable, isAnimatable } from "../../animation/Animatable"
import { MainLoopAnimationDriver } from "../../animation/Drivers/MainLoopDriver"
import { TransactionId, Change } from "../../animation/Animatable/Animatable"
import { AnimationInterface } from "../../animation/Drivers/AnimationDriver"

export const DraggingContext = React.createContext({ dragging: false })

const hoistNonReactStatic = require("hoist-non-react-statics")

/**
 * @beta
 */
export type Axis = "x" | "y"

export type Handler = () => void
export type DragHandler<Draggable> = (draggable: Draggable) => void
export type DragEventHandler<Draggable> = (event: FramerEvent, draggable: Draggable) => void
/**
 * @internal
 */
export type ScrollAnimation = MainLoopAnimationDriver<InertialScrollAnimator, number, any>
export interface DragEvents<Draggable> {
    onMove: (point: Point, draggable: Draggable) => void
    /**
     * @beta
     */
    onDragDirectionLockStart: (axis: Axis, draggable: Draggable) => void
    onDragAnimationStart: (animation: { x: AnimationInterface; y: AnimationInterface }, draggable: Draggable) => void
    onDragAnimationEnd: (animation: { x: AnimationInterface; y: AnimationInterface }, draggable: Draggable) => void

    onDragSessionStart: DragEventHandler<Draggable>
    onDragSessionMove: DragEventHandler<Draggable>
    onDragSessionEnd: DragEventHandler<Draggable>

    onDragStart: DragEventHandler<Draggable>
    onDragWillMove: DragEventHandler<Draggable>
    onDragDidMove: DragEventHandler<Draggable>
    onDragEnd: DragEventHandler<Draggable>
}

export interface DraggableSpecificProps<Draggable> extends Partial<DragEvents<Draggable>> {
    momentum: boolean
    momentumOptions: {
        friction: number
        tolerance: number
    }
    momentumVelocityMultiplier: number
    speedX: number
    speedY: number
    bounce: boolean
    bounceOptions: {
        friction: number
        tension: number
        tolerance: number
    }
    directionLock: boolean
    directionLockThreshold: {
        x: number
        y: number
    }
    overdrag: boolean
    overdragScale: number
    pixelAlign: boolean
    velocityTimeout: number
    velocityScale: number
    horizontal: boolean
    vertical: boolean
    constraints: Partial<Rect>
    mouseWheel: boolean
}

export interface DraggableProps<Draggable> extends DraggableSpecificProps<Draggable> {
    enabled: boolean
}

export interface WithDraggingComponentTypeConstraints extends WithPanHandlers, WithMouseWheelHandler {
    left: number | Animatable<number> | null
    top: number | Animatable<number> | null
    width: number | ConstraintPercentage | Animatable<number>
    height: number | ConstraintPercentage | Animatable<number>
}

interface DraggingState {
    isDragging: boolean
}

export function WithDragging<TOriginalProps extends Partial<WithDraggingComponentTypeConstraints>>(
    Component: React.ComponentType<TOriginalProps>
): React.ComponentClass<TOriginalProps & Partial<DraggableProps<any>>> {
    type ResultProps<T> = TOriginalProps & Partial<DraggableProps<T>>
    const withDragging: React.ComponentClass<ResultProps<any>> = class WithDraggingHOC extends React.Component<
        ResultProps<WithDraggingHOC>,
        DraggingState
    > {
        static draggingDefaultProps = {
            momentum: true,
            momentumOptions: { friction: 2.1, tolerance: 1 },
            momentumVelocityMultiplier: 800,
            speedX: 1,
            speedY: 1,
            bounce: true,
            bounceOptions: { friction: 40, tension: 200, tolerance: 1 },
            directionLock: false,
            directionLockThreshold: { x: 10, y: 10 },
            overdrag: true,
            overdragScale: 0.5,
            pixelAlign: true,
            velocityTimeout: 100,
            velocityScale: 890,
            horizontal: true,
            vertical: true,
            enabled: true,
            constraints: {},
            mouseWheel: false,
        }

        static defaultProps: TOriginalProps & DraggableProps<WithDraggingHOC> = Object.assign(
            Component.defaultProps as TOriginalProps,
            WithDraggingHOC.draggingDefaultProps
        )

        state: DraggingState = {
            isDragging: false,
        }

        x = Animatable(0)
        y = Animatable(0)

        get properties(): TOriginalProps & DraggableProps<WithDraggingHOC> {
            return this.props as TOriginalProps & DraggableProps<WithDraggingHOC>
        }

        constructor(props: ResultProps<WithDraggingHOC>, defaultProps: DraggableProps<WithDraggingHOC>) {
            super(props, defaultProps)
            const x: number | Animatable<number> | null | undefined = this.properties.left
            const y: number | Animatable<number> | null | undefined = this.properties.top
            if (!x) {
                // TODO: 0 should come from Component.defaultProps
                this.x = Animatable(0)
            } else if (isAnimatable(x)) {
                this.x = x
            } else {
                this.x = Animatable(x)
            }
            if (!y) {
                // TODO: 0 should come from Component.defaultProps
                this.y = Animatable(0)
            } else if (isAnimatable(y)) {
                this.y = y
            } else {
                this.y = Animatable(y)
            }
            this.x.onUpdate(this.onChangePosition)
            this.y.onUpdate(this.onChangePosition)
            const constraints: Partial<Rect> | undefined = this.props.constraints
            if (constraints) {
                this.constraints = constraints
            }
        }

        componentWillReceiveProps(props: ResultProps<WithDraggingHOC>) {
            if (this.props.left !== props.left && isFiniteNumber(props.left)) {
                this.x.set(props.left)
            }
            if (this.props.top !== props.top && isFiniteNumber(props.top)) {
                this.y.set(props.top)
            }
            const constraints: Partial<Rect> | undefined = props.constraints
            if (constraints) {
                this.constraints = constraints
            }
        }

        onChangePosition = (change: Change<number>, transaction: TransactionId) => {
            if (change.value === change.oldValue) {
                return
            }
            if (this.props.onMove) {
                this.props.onMove(this.point, this)
            }
        }

        private get point(): Point {
            return { x: this.x.get(), y: this.y.get() }
        }

        private setPoint(point: Point, axis: Axis | null = null) {
            switch (axis) {
                case "x":
                    this.x.set(point.x)
                    break
                case "y":
                    this.y.set(point.y)
                    break
                case null:
                    this.x.set(point.x)
                    this.y.set(point.y)
                    break
            }
        }
        private getValue(axis: Axis): number {
            switch (axis) {
                case "x":
                    return this.x.get()
                case "y":
                    return this.y.get()
            }
        }
        private get width(): number {
            const width: number | ConstraintPercentage | Animatable<number> | undefined = this.props.width
            if (!width) {
                // TODO this should come from the Dragged props' defaults
                return 100
            }
            if (isAnimatable(width)) {
                return width.get()
            }
            if (typeof width === "string") {
                return parseFloat(width)
            }
            return width
        }

        private get height(): number {
            const height: number | ConstraintPercentage | Animatable<number> | undefined = this.props.height
            if (!height) {
                // TODO this should come from the Dragged props' defaults
                return 100
            }
            if (isAnimatable(height)) {
                return height.get()
            }
            if (typeof height === "string") {
                return parseFloat(height)
            }
            return height
        }
        isMoving = false
        private isAnimating = false
        private directionLockAxis: Axis | null = null
        private layerStartPoint: Point
        private correctedLayerStartPoint: Point
        private previousPoint: Point
        private _constraints: Rect | null = null
        private animation: { x: ScrollAnimation; y: ScrollAnimation } | null
        private get constraints(): Partial<Rect> | null {
            return this._constraints
        }
        private set constraints(value: Partial<Rect> | null) {
            if (value !== null && typeof value === "object") {
                this._constraints = {
                    x: value.x || 0,
                    y: value.y || 0,
                    width: value.width || 0,
                    height: value.height || 0,
                }
            } else {
                this._constraints = null
            }
            if (this._constraints) {
                this.updateAnimationConstraints(this._constraints)
            }
        }

        get constraintsOffset(): Point {
            if (!this.constraints) {
                return { x: 0, y: 0 }
            }
            const { minX, minY, maxX, maxY } = this.calculateConstraints(this._constraints)
            const point = this.point
            const constrainedPoint = { x: clamp(point.x, minX, maxX), y: clamp(point.y, minY, maxY) }
            const offset = { x: point.x - constrainedPoint.x, y: point.y - constrainedPoint.y }
            return offset
        }

        get isBeyondConstraints() {
            let constraintsOffset
            constraintsOffset = this.constraintsOffset
            if (constraintsOffset.x !== 0) {
                return true
            }
            if (constraintsOffset.y !== 0) {
                return true
            }
            return false
        }

        panStart = (event: FramerEvent) => {
            if (!this.properties.enabled) {
                return
            }

            // LayerDraggable._globalDidDrag = false

            // Only reset isMoving if this was not animating when we were clicking
            // so we can use it to detect a click versus a drag.
            this.isMoving = this.isAnimating

            // Stop any animations influencing the position, but no others.
            // this.layer.animations().forEach(animation => {
            //     properties = animation.properties
            //     if (properties.hasOwnProperty("x") || properties.hasOwnProperty("y")) {
            //         return animation.stop()
            //     }
            // })

            this.stopAnimation()
            this.resetdirectionLock()

            // Store original layer position
            this.layerStartPoint = this.point
            this.correctedLayerStartPoint = this.point

            // // If we are beyond bounds, we need to correct for the scaled clamping from the last drag,
            // // hence the 1 / overdragScale
            if (this._constraints && this.props.bounce) {
                this.correctedLayerStartPoint = this.constrainPosition(
                    this.correctedLayerStartPoint,
                    this._constraints,
                    1 / this.properties.overdragScale
                )
            }
            this.previousPoint = this.correctedLayerStartPoint

            if (!this.state.isDragging) {
                this.setState({ isDragging: true })
            }
            if (this.props.onDragSessionStart) {
                this.props.onDragSessionStart(event, this)
            }
        }

        pan = (event: FramerEvent) => {
            const {
                enabled,
                speedX,
                speedY,
                directionLock,
                overdragScale,
                vertical,
                horizontal,
                pixelAlign,
                onDragStart,
                onDragWillMove,
                onDragDidMove,
                onDragSessionMove,
            } = this.properties

            if (!enabled) {
                return
            }
            let point = { ...this.previousPoint }
            point.x += event.delta.x * speedX
            point.y += event.delta.y * speedY
            // Save the point for the next update so we have the unrounded, unconstrained value
            this.previousPoint = { ...point }

            // // Constraints and overdrag
            if (this._constraints) {
                point = this.constrainPosition(point, this._constraints, overdragScale)
            }

            // // Direction lock
            if (directionLock) {
                if (this.directionLockAxis === null) {
                    const offset = event.offset
                    offset.x = offset.x * speedX
                    offset.y = offset.y * speedY
                    this.updatedirectionLock(offset)
                    return
                } else {
                    if (this.directionLockAxis === "y") {
                        point.x = this.layerStartPoint.x
                    }
                    if (this.directionLockAxis === "x") {
                        point.y = this.layerStartPoint.y
                    }
                }
            }

            // Update the dragging status
            if (!this.state.isDragging) {
                this.setState({ isDragging: true })
                this.isMoving = true
                if (onDragStart) {
                    onDragStart(event, this)
                }
            }

            if (onDragWillMove) {
                onDragWillMove(event, this)
            }

            // // Align every drag to pixels
            if (pixelAlign) {
                point.x = Math.round(point.x)
                point.y = Math.round(point.y)
            }
            if (!horizontal && !vertical) {
                // Don't move over any axis
                return
            }

            let axis: Axis | null = null
            if (horizontal && !vertical) {
                axis = "x"
            } else if (vertical && !horizontal) {
                axis = "y"
            }
            this.setPoint(point, axis)

            if (onDragDidMove) {
                onDragDidMove(event, this)
            }

            if (onDragSessionMove) {
                onDragSessionMove(event, this)
            }
        }

        panEnd = (event: FramerEvent) => {
            if (!this.properties.enabled) {
                return
            }

            // LayerDraggable._globalDidDrag = false

            // Start the simulation prior to emitting the DragEnd event.
            // This way, if the user calls layer.animate on DragEnd, the simulation will
            // be canceled by the user's animation (if the user animates x and/or y).
            this.startAnimation(event)

            const { onDragSessionEnd, onDragEnd } = this.props
            if (this.state.isDragging) {
                if (onDragEnd) {
                    onDragEnd(event, this)
                }
            }
            if (onDragSessionEnd) {
                onDragSessionEnd(event, this)
            }

            // Set isDragging after DragEnd is fired, so that calls to calculateVelocity()
            // still returns dragging velocity - both in case the user calls calculateVelocity(),
            // (which would return a stale value before the simulation had finished one tick)
            // and because @_start currently calls calculateVelocity().
            if (this.state.isDragging) {
                this.setState({ isDragging: false })
            }

            // reset isMoving if not animating, otherwise animation start/stop will reset it
            this.isMoving = this.isAnimating
        }

        // Mouse Wheel

        mouseWheelStart = (event: FramerEvent) => {
            this.correctedLayerStartPoint = this.point
            this.previousPoint = this.correctedLayerStartPoint
            this.stopAnimation()
        }

        mouseWheel = (event: FramerEvent) => {
            const {
                enabled,
                speedX,
                speedY,
                vertical,
                horizontal,
                pixelAlign,
                onDragWillMove,
                onDragDidMove,
                mouseWheel,
            } = this.properties

            if (!mouseWheel || !enabled) {
                return
            }

            let point = { ...this.point }

            point.x -= event.delta.x * speedX
            point.y -= event.delta.y * speedY

            // // Constraints and overdrag
            if (this._constraints) {
                point = this.constrainPosition(point, this._constraints, 0, false)
            }

            if (onDragWillMove) {
                onDragWillMove(event, this)
            }

            // // Align every drag to pixels
            if (pixelAlign) {
                point.x = Math.round(point.x)
                point.y = Math.round(point.y)
            }
            if (!horizontal && !vertical) {
                // Don't move over any axis
                return
            }

            let axis: Axis | null = null
            if (horizontal && !vertical) {
                axis = "x"
            } else if (vertical && !horizontal) {
                axis = "y"
            }

            this.setPoint(point, axis)

            if (onDragDidMove) {
                onDragDidMove(event, this)
            }
        }

        mouseWheelEnd = (event: FramerEvent) => {}

        private clampAndScale(value: number, min: number, max: number, scale: number, scaleAllowed: boolean) {
            if (!scaleAllowed) {
                return clamp(value, min, max)
            }

            if (value < min) {
                value = min + (value - min) * scale
            }
            if (value > max) {
                value = max + (value - max) * scale
            }
            return value
        }

        private calculateConstraints(bounds: Rect | null) {
            if (!bounds) {
                return { minX: Infinity, maxX: Infinity, minY: Infinity, maxY: Infinity }
            }

            // Correct the constraints if the layer size exceeds the constraints
            if (bounds.width < this.width) {
                bounds.width = this.width
            }
            if (bounds.height < this.height) {
                bounds.height = this.height
            }

            const constraints = {
                minX: Rect.minX(bounds),
                maxX: Rect.maxX(bounds),
                minY: Rect.minY(bounds),
                maxY: Rect.maxY(bounds),
            }

            // It makes sense to take the dimensions of the object into account
            constraints.maxX -= this.width
            constraints.maxY -= this.height

            return constraints
        }

        private constrainPosition(
            proposedPoint: Point,
            bounds: Rect,
            scale: number,
            overdrag = this.properties.overdrag
        ) {
            const { maxX, maxY, minX, minY } = this.calculateConstraints(this._constraints)

            const point = {
                x: this.clampAndScale(proposedPoint.x, minX, maxX, scale, overdrag),
                y: this.clampAndScale(proposedPoint.y, minY, maxY, scale, overdrag),
            }

            if (this.props.speedX === 0 || this.props.horizontal === false) {
                point.x = proposedPoint.x
            }
            if (this.props.speedY === 0 || this.props.vertical === false) {
                point.y = proposedPoint.y
            }

            return point
        }

        /*private*/ updatedirectionLock(correctedDelta: Point) {
            if (Math.abs(correctedDelta.y) > this.properties.directionLockThreshold.y) {
                this.directionLockAxis = "y"
            } else if (Math.abs(correctedDelta.x) > this.properties.directionLockThreshold.x) {
                this.directionLockAxis = "x"
            }

            if (this.directionLockAxis !== null) {
                if (this.props.onDragDirectionLockStart) {
                    this.props.onDragDirectionLockStart(this.directionLockAxis, this)
                }
            }
        }

        private resetdirectionLock() {
            this.directionLockAxis = null
        }

        // Inertial scroll animation

        private setupAnimation() {
            if (this.animation) {
                return
            }

            this.animation = { x: this.setupAnimationForAxis("x"), y: this.setupAnimationForAxis("y") }

            this.updateAnimationConstraints(this._constraints)
        }

        private setupAnimationForAxis(axis: Axis) {
            let properties, animation
            properties = {}
            properties[axis] = true

            const animator = new InertialScrollAnimator({
                momentum: this.props.momentumOptions,
                bounce: this.props.bounceOptions,
            })
            const updateCallback = (value: number) => {
                this.onAnimationStep(axis, value)
            }
            const doneCallback = () => {
                this.onAnimationStop(axis)
            }
            animation = new MainLoopAnimationDriver(animator, updateCallback, doneCallback)
            return animation
        }

        private updateAnimationConstraints(constraints: Rect | null) {
            // This is where we let the animators know about our constraints
            if (!this.animation) {
                return
            }
            if (constraints) {
                const { minX, minY, maxX, maxY } = this.calculateConstraints(constraints)
                this.animation.x.animator.setLimits(minX, maxX)
                this.animation.y.animator.setLimits(minY, maxY)
            } else {
                this.animation.x.animator.setLimits(-Infinity, +Infinity)
                this.animation.y.animator.setLimits(-Infinity, +Infinity)
            }
        }

        private onAnimationStep = (axis: Axis, value: number) => {
            if (axis === "x" && this.props.horizontal === false) {
                return
            }
            if (axis === "y" && this.props.vertical === false) {
                return
            }

            let delta = 0
            if (this.constraints) {
                if (this.props.bounce) {
                    delta = value - this.getValue(axis)
                } else {
                    const { minX, minY, maxX, maxY } = this.calculateConstraints(this._constraints)
                    if (axis === "x") {
                        delta = clamp(value, minX, maxX) - this.getValue(axis)
                    }
                    if (axis === "y") {
                        delta = clamp(value, minY, maxY) - this.getValue(axis)
                    }
                }
            } else {
                delta = value - this.getValue(axis)
            }

            const updatePoint = this.point
            if (axis === "x") {
                updatePoint[axis] = updatePoint[axis] + delta
            }
            if (axis === "y") {
                updatePoint[axis] = updatePoint[axis] + delta
            }
            this.setPoint(updatePoint, axis)
        }

        private onAnimationStop = (axis: Axis) => {
            if (axis === "x" && this.props.horizontal === false) {
                return
            }
            if (axis === "y" && this.props.vertical === false) {
                return
            }
            if (!this.animation) {
                return
            }

            // Round the end position to whole pixels
            if (this.props.pixelAlign) {
                const point = this.point
                point.x = Math.round(point.x)
                point.y = Math.round(point.y)
                this.setPoint(point, axis)
            }

            // See if both animators are stopped
            if (this.animation.x.isFinished() && this.animation.y.isFinished()) {
                return this.stopAnimation()
            }
        }

        private startAnimation(event: FramerEvent) {
            // The types of animation that we can have are:
            // 1) Momentum inside constraints
            // 2) Momentum inside constraints to outside constraints bounce
            // 3) Release outside constraints bounce
            // 4) Momentum without constraints

            const {
                momentum,
                bounce,
                momentumVelocityMultiplier,
                speedX,
                speedY,
                overdrag,
                onDragAnimationStart,
            } = this.properties
            if (!(momentum || bounce)) {
                return
            }
            if (this.isBeyondConstraints === false && momentum === false) {
                return
            }
            if (this.isBeyondConstraints === false && this.state.isDragging === false) {
                return
            }

            // If overdrag is disabled, we need to not have a bounce animation
            // when the cursor is outside of the dragging bounds for an axis.
            const { minX, minY, maxX, maxY } = this.calculateConstraints(this._constraints)

            const startAnimationX = overdrag === true || (this.point.x > minX && this.point.x < maxX)
            const startAnimationY = overdrag === true || (this.point.y > minY && this.point.y < maxY)

            if (startAnimationX === startAnimationY && startAnimationY === false) {
                return
            }

            const velocity = event.velocity(0.1)
            let velocityX = velocity.x * momentumVelocityMultiplier * speedX
            let velocityY = velocity.y * momentumVelocityMultiplier * speedY
            if (this.directionLockAxis === "x") {
                velocityY = 0
            }
            if (this.directionLockAxis === "y") {
                velocityX = 0
            }

            this.setupAnimation()
            this.isAnimating = true
            this.isMoving = true

            if (!this.animation) {
                return
            }
            this.animation.x.animator.setState({ x: this.point.x, v: velocityX })
            if (startAnimationX) {
                this.animation.x.play()
            }

            this.animation.y.animator.setState({ x: this.point.y, v: velocityY })
            if (startAnimationY) {
                this.animation.y.play()
            }

            if (onDragAnimationStart) {
                onDragAnimationStart(this.animation, this)
            }
        }

        stopAnimation = () => {
            this.isAnimating = false
            this.isMoving = false

            if (!this.animation) {
                return
            }

            this.animation.x.cancel()
            this.animation.y.cancel()

            if (this.props.onDragAnimationEnd) {
                this.props.onDragAnimationEnd(this.animation, this)
            }
            this.animation = null
        }

        private wrapHandler(ownHandler: EventHandler, originalHandler: EventHandler | undefined) {
            if (!originalHandler) {
                return ownHandler
            }
            return (event: FramerEvent) => {
                ownHandler(event)
                originalHandler(event)
            }
        }

        render() {
            const {
                onPanStart,
                onPan,
                onPanEnd,
                onMouseWheelStart,
                onMouseWheel,
                onMouseWheelEnd,
                ...attributes
            } = this.props as any
            const originalProps: TOriginalProps = { ...attributes }
            Object.keys(WithDraggingHOC.draggingDefaultProps).forEach(key => {
                delete originalProps[key]
            })

            originalProps.onPanStart = this.wrapHandler(this.panStart, onPanStart)
            originalProps.onPan = this.wrapHandler(this.pan, onPan)
            originalProps.onPanEnd = this.wrapHandler(this.panEnd, onPanEnd)
            originalProps.onMouseWheelStart = this.wrapHandler(this.mouseWheelStart, onMouseWheelStart)
            originalProps.onMouseWheel = this.wrapHandler(this.mouseWheel, onMouseWheel)
            originalProps.onMouseWheelEnd = this.wrapHandler(this.mouseWheelEnd, onMouseWheelEnd)
            originalProps.left = this.x
            originalProps.top = this.y

            return (
                <DraggingContext.Provider value={{ dragging: this.state.isDragging }}>
                    <Component {...originalProps} />
                </DraggingContext.Provider>
            )
        }
    }

    hoistNonReactStatic(withDragging, Component)
    return withDragging
}
