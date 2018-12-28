import { Animator } from "./Animator"
import { State } from "./Integrator"
import { FrictionAnimator } from "./FrictionAnimator"
import { SpringAnimator } from "./SpringAnimator"
import { NumberInterpolation } from "../../interpolation"

export const Defaults = {
    velocity: 0,
    min: 0,
    max: 0,
    momentum: {
        friction: 2,
        tolerance: 10,
    },
    bounce: {
        tension: 500,
        friction: 10,
        tolerance: 1,
    },
}

export type Options = typeof Defaults

/**
 * @internal
 */
export class InertialScrollAnimator implements Animator<number, Options> {
    private options: Options
    private current: number
    private frictionAnimator: FrictionAnimator
    private springAnimator: SpringAnimator<number>
    private useSpring: boolean
    public constructor(options: Partial<Options>) {
        this.options = Object.assign({ ...Defaults }, options)

        this.frictionAnimator = new FrictionAnimator({
            friction: this.options.momentum.friction,
            tolerance: this.options.momentum.tolerance,
            velocity: this.options.velocity,
        })

        this.springAnimator = new SpringAnimator(
            {
                tension: this.options.bounce.tension,
                friction: this.options.bounce.friction,
                tolerance: this.options.bounce.tolerance,
                velocity: this.options.velocity,
            },
            NumberInterpolation
        )
        this.useSpring = false
    }

    public isReady() {
        return true
    }

    public next(delta: number): number {
        this.current = this.currentAnimator.next(delta)
        if (!this.useSpring) {
            this.tryTransitionToSpring()
        }
        // console.log(this.current, this.useSpring)
        return this.current
    }

    get currentAnimator(): SpringAnimator<number> | FrictionAnimator {
        if (this.useSpring) {
            return this.springAnimator
        }
        return this.frictionAnimator
    }

    public isFinished(): boolean {
        return this.currentAnimator.isFinished()
    }

    get state(): State {
        return this.currentAnimator.getState()
    }

    public setFrom(value: number) {
        this.setState({ x: value, v: this.state.v })
    }

    public setState(state: State) {
        this.frictionAnimator.setFrom(state.x)
        this.frictionAnimator.setVelocity(state.v)

        if (this.isValidState()) {
            return this.tryTransitionToSpring()
        } else {
            let bound: number = 0
            if (this.state.x <= this.options.min) {
                bound = this.options.min
            }
            if (this.state.x >= this.options.max) {
                bound = this.options.max
            }
            return this.transitionToSpring(bound)
        }
    }

    public setTo(destination: number) {
        this.frictionAnimator.setTo(destination)
        this.springAnimator.setTo(destination)
    }

    public setLimits(min: number, max: number) {
        this.options.min = min
        this.options.max = max
    }

    // If the position is outside the min and max bounds, and traveling
    // further away, then transition from friction to spring animation

    private tryTransitionToSpring() {
        const belowMinWithVelocity = this.state.x < this.options.min && this.state.v <= 0
        const aboveMaxWithVelocity = this.state.x > this.options.max && this.state.v >= 0

        if (belowMinWithVelocity || aboveMaxWithVelocity) {
            let bound: number
            if (belowMinWithVelocity) {
                bound = this.options.min
            } else {
                bound = this.options.max
            }
            this.transitionToSpring(bound)
        } else {
            this.useSpring = false
        }
    }

    private transitionToSpring(bound: number) {
        this.springAnimator.setFrom(this.state.x)
        this.springAnimator.setVelocity(this.state.v)
        this.springAnimator.setTo(bound)
        this.useSpring = true
    }

    // If the position is outside the min and max bounds, but traveling
    // back towards the bounds, check if the velocity is sufficient to
    // carry the position back within bounds. If it is, let friction do the
    // work. If not, the state is invalid, so use the spring.

    private isValidState(): boolean {
        // Note that if velocity is 0, the state is still valid (should use spring,
        // not friction), and we don't want to divide by 0 later in the check.
        const belowMinTravelingBack = this.state.x < this.options.min && this.state.v > 0
        const aboveMaxTravelingBack = this.state.x > this.options.max && this.state.v < 0

        if (belowMinTravelingBack || aboveMaxTravelingBack) {
            let bound: number
            if (belowMinTravelingBack) {
                bound = this.options.min
            } else {
                bound = this.options.max
            }

            const friction = this.frictionAnimator.options.friction
            const solution = 1 - (friction * (bound - this.state.x)) / this.state.v

            return solution > 0
        }

        return true
    }

    // The math behind _isValidState:
    //
    // 1. Integrate the friction animator's acceleration to find velocity
    //
    //         a = - k * v
    //     dv/dt = - k * v
    // Int(dv/v) = - k * Int(dt)
    //      ln v = - k * t + C
    //
    // => Solve for C at t = 0
    //
    // ln v(0) = - k * 0 + C
    // ln v(0) = C
    //
    // => Plug C back into v(t)
    //
    //     ln v = - k * t + ln v(0)
    // e^(ln v) = e^(- k * t) + e^(ln v(0))
    //        v = v(0) * e^(- k * t)
    //
    // 2. Integrate velocity to find position
    //
    // Int(v) = v(0) * Int(e^(- k * t))
    //      x = - v(0) * e^(-k * t) / k + C
    //
    // => Solve for C at t = 0
    //
    //            x(0) = - v(0) * e^(-k * 0) / k + C
    //            x(0) = - v(0) / k + C
    // x(0) + v(0) / k = C
    //
    // => Plug C back into x(t)
    //
    // x = - v(0) * e^(-k * t) / k + x(0) + v(0) / k
    //
    // 3. Check if a (real) solution exists for t for position x
    //
    //                                x = - v(0) * e^(-k * t) / k + x(0) + v(0) / k
    //                         x - x(0) = - v(0) * e^(-k * t) / k + v(0) / k
    //                   k * (x - x(0)) = - v(0) * e^(-k * t) + v(0)
    //            k * (x - x(0)) - v(0) = - v(0) * e^(-k * t)
    // (k * (x - x(0)) - v(0)) / - v(0) = e^(-k * t)
    //       1 - (k * (x - x(0)) / v(0) = e^(-k * t)
    //   ln(1 - (k * (x - x(0)) / v(0)) = -k * t
    //
    // Therefore, a real solution exists if 1 - (k * (x - x(0)) / v(0) > 0
}
