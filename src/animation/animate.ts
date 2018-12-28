import { FramerAnimation, AnimationOptions } from "./FramerAnimation"
import { SpringAnimator, SpringOptions, BezierAnimator, BezierOptions, Bezier } from "./Animators"
import { Animatable, AnimatableObject } from "./Animatable"
import { AnimatorClass } from "./Animators/Animator"
import { isAnimatable } from "./Animatable"

/**
 * Animate a value or object.
 *
 * @remarks
 * Recommended use is to use convenience functions from the `animate` namespace
 * instead of passing an animator. Only use this for low-level animation tweaking.
 *
 * @param from - The animatable value or object to start from
 * @param to - The value to animate to
 * @param animator - Animator to use.
 * @param options - Animation options
 * @public
 */
export function animate<Value, Options>(
    from: Animatable<Value> | AnimatableObject<Value>,
    to: Value,
    animator?: AnimatorClass<Value, Options>,
    options?: Partial<Options & AnimationOptions<Value>>
): FramerAnimation<Value, Options> {
    const target = from
    let fromValue: Value
    if (isAnimatable(from)) {
        fromValue = from.get()
    } else {
        fromValue = Animatable.objectToValues(from)
    }
    const animation = new FramerAnimation(target, fromValue, to, animator, options)
    animation.play()
    return animation
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type EaseOptions = Omit<BezierOptions, "curve">

/**
 * @public
 */
export namespace animate {
    export function spring<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<SpringOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, SpringOptions> {
        return animate<Value, SpringOptions>(from, to, SpringAnimator, options)
    }

    export function bezier<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<BezierOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, BezierOptions> {
        return animate<Value, BezierOptions>(from, to, BezierAnimator, options)
    }

    export function linear<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<EaseOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, BezierOptions> {
        return animate.bezier(from, to, { ...options, curve: Bezier.Linear })
    }

    export function ease<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<EaseOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, BezierOptions> {
        return animate.bezier(from, to, { ...options, curve: Bezier.Ease })
    }

    export function easeIn<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<EaseOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, BezierOptions> {
        return animate.bezier(from, to, { ...options, curve: Bezier.EaseIn })
    }

    export function easeOut<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<EaseOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, BezierOptions> {
        return animate.bezier(from, to, { ...options, curve: Bezier.EaseOut })
    }

    export function easeInOut<Value>(
        from: Animatable<Value> | AnimatableObject<Value>,
        to: Value,
        options?: Partial<EaseOptions & AnimationOptions<Value>>
    ): FramerAnimation<Value, BezierOptions> {
        return animate.bezier(from, to, { ...options, curve: Bezier.EaseInOut })
    }
}
