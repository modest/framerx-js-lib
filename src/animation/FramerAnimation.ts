import { Animator as AnimatorInterface, AnimatorClass } from "./Animators/Animator"
import { Interpolation, InterpolationOptions, ValueInterpolation } from "../interpolation"
import { Animatable, AnimatableObject, isAnimatable } from "./Animatable"
import { DriverClass, AnimationDriver } from "./Drivers/AnimationDriver"
import { MainLoopAnimationDriver } from "./Drivers/MainLoopDriver"
import { PrecalculatedAnimator } from "./Animators/PrecalculatedAnimator"
import { BezierAnimator } from "./Animators/BezierAnimator"
import { ColorMixModelType } from "../render/types/Color/types"

type TargetObject<T> = { [K in keyof T]: T[K] | Animatable<T[K]> }

export type FramerAnimationState = "idle" | "running" | "finished"

export interface AnimationOptions<Value> extends InterpolationOptions {
    /**
     * @beta
     */
    customInterpolation?: Interpolation<Value>
    /**
     * @beta
     */
    precalculate: boolean
}

const DefaultAnimationOptions: AnimationOptions<any> = {
    precalculate: false,
    colorModel: ColorMixModelType.HUSL,
}

/**
 * This could be called just Animation, but it's type would clash with
 * javascript's native Animation: https://developer.mozilla.org/en-US/docs/Web/API/Animation
 * So if you forget the import, you would get weird errors.
 *
 * Also, this class follows the native Animation as much as possible.
 * @public
 */
export class FramerAnimation<Value, AnimatorOptions> {
    /**
     * @internal
     */
    private driver: AnimationDriver<AnimatorInterface<Value, AnimatorOptions>, Value, AnimatorOptions>
    /**
     * @internal
     */
    constructor(
        target: Animatable<Value> | AnimatableObject<Value>,
        from: Value,
        to: Value,
        animatorClass?: AnimatorClass<Value, AnimatorOptions>,
        options?: Partial<AnimatorOptions & AnimationOptions<Value>>,
        driverClass: DriverClass<
            AnimatorInterface<Value, AnimatorOptions>,
            Value,
            AnimatorOptions
        > = MainLoopAnimationDriver
    ) {
        this.resetFinishedPromise()
        const animationOptions: AnimationOptions<Value> = { ...DefaultAnimationOptions }
        const animatorOptions: Partial<AnimatorOptions> = {}
        if (options) {
            Object.assign(animationOptions, options)
            Object.assign(animatorOptions, options)
        }
        let interpolation: Interpolation<Value>
        if (animationOptions.customInterpolation) {
            interpolation = animationOptions.customInterpolation
        } else {
            interpolation = new ValueInterpolation(options)
        }
        let animator: AnimatorInterface<Value, AnimatorOptions>
        if (!animatorClass) {
            animator = new BezierAnimator({}, interpolation)
        } else {
            animator = new animatorClass(animatorOptions, interpolation)
        }
        if (animationOptions.precalculate) {
            animator = new PrecalculatedAnimator({ animator })
        }
        animator.setFrom(from)
        animator.setTo(to)
        const updateCallback = (value: Value) => {
            FramerAnimation.driverCallbackHandler(target, value)
        }

        const finishedCallback = (isFinished: boolean) => {
            if (isFinished) {
                FramerAnimation.driverCallbackHandler(target, to)
                if (this.playStateSource === "running") {
                    this.playStateValue = "finished"
                }
            }
        }
        this.driver = new driverClass(animator, updateCallback, finishedCallback)
    }

    /**
     * @internal
     */
    private static driverCallbackHandler<Value>(target: Animatable<Value> | AnimatableObject<Value>, value: Value) {
        if (isAnimatable(target)) {
            target.set(value)
        } else {
            const targetObject = target as TargetObject<Value>
            Animatable.transaction(update => {
                for (const key in targetObject) {
                    const targetValue = targetObject[key]
                    if (isAnimatable(targetValue)) {
                        update(targetValue, value[key])
                    } else {
                        targetObject[key] = value[key]
                    }
                }
            })
        }
    }

    /**
     * @internal
     */
    private playStateSource: FramerAnimationState = "idle"

    /**
     * @internal
     */
    private get playStateValue(): FramerAnimationState {
        return this.playStateSource
    }

    /**
     * @internal
     */
    private set playStateValue(value: FramerAnimationState) {
        if (value !== this.playStateSource) {
            const oldValue = value
            this.playStateSource = value
            switch (value) {
                case "idle":
                    if (oldValue === "running") {
                        this.oncancel && this.oncancel()
                    }
                    this.readyResolve && this.readyResolve()
                    this.resetReadyPromise()
                    break
                case "finished":
                    if (oldValue === "idle") {
                        // tslint:disable-next-line:no-console
                        console.warn("Bad state transition")
                        break
                    }
                    this.onfinish && this.onfinish()
                    this.finishedResolve && this.finishedResolve()
                    break
                case "running":
                    this.resetReadyPromise()
                    break
            }

            if (oldValue === "finished") {
                this.resetFinishedPromise()
            }

            if (value === "finished") {
                // Jump to idle state:
                this.playStateValue = "idle"
            }
        }
    }

    /**
     * @alpha
     */
    get playState(): FramerAnimationState {
        return this.playStateValue
    }

    /**
     * @alpha
     */
    onfinish: undefined | (() => void)
    /**
     * @alpha
     */
    oncancel: undefined | (() => void)

    /**
     * @internal
     */
    private readyPromise: Promise<void> = Promise.resolve()

    /**
     * @internal
     */
    private readyResolve: null | (() => void)

    /**
     * @internal
     */
    private resetReadyPromise() {
        this.readyResolve = null
        this.readyPromise = new Promise((resolve, reject) => {
            this.readyResolve = resolve
        })
    }

    /**
     * @public
     */
    get ready(): Promise<void> {
        return this.readyPromise
    }

    /**
     * @internal
     */
    private finishedPromise: Promise<void>
    /**
     * @internal
     */
    private finishedResolve: null | (() => void)
    /**
     * @internal
     */
    private finishedReject: null | ((reason: any) => void)
    /**
     * @internal
     */
    private resetFinishedPromise() {
        this.finishedResolve = null
        this.finishedReject = null
        this.finishedPromise = new Promise((resolve, reject) => {
            this.finishedResolve = resolve
            this.finishedReject = reject
        })
        this.finishedPromise.catch(reason => {
            // Eat the exception that will occur when no 'reject' handler
            // is set.
        })
    }

    /**
     * @public
     */
    get finished(): Promise<void> {
        return this.finishedPromise
    }

    /**
     * @alpha
     */
    play() {
        this.playStateValue = "running"
        this.driver.play()
    }

    /**
     * @public
     */
    cancel() {
        if (this.playStateValue !== "running") {
            return
        }

        this.driver.cancel()
        if (this.playState !== "idle") {
            const reason = "AbortError"
            this.finishedReject && this.finishedReject(reason)
        }
        this.playStateValue = "idle"
    }

    /**
     * @alpha
     */
    finish() {
        if (this.playStateSource === "running") {
            this.playStateValue = "finished"
            this.driver.finish()
        }
    }

    /**
     * @alpha
     */
    isFinished() {
        return this.playStateValue === "finished"
    }
}
