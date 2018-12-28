import { Integrator, State } from "./Integrator"
import { Animator } from "./Animator"
import { Interpolation, Interpolator } from "../../interpolation/Interpolation"
import { SpringCurveValueConverter } from "./SpringCurveValueConverter"

export const SpringTensionFrictionDefaults: TensionFrictionSpringOptions = {
    tension: 500,
    friction: 10,
    tolerance: 1 / 10000,
    velocity: 0,
}

export const SpringDampingDurationDefaults: DampingDurationSpringOptions = {
    dampingRatio: 1,
    duration: 1,
    velocity: 0,
    mass: 1,
}

export interface TensionFrictionSpringOptions {
    tension: number
    friction: number
    tolerance: number
    velocity: number
}

export interface DampingDurationSpringOptions {
    dampingRatio: number
    duration: number
    velocity: number
    mass: number
}

export type SpringOptions = TensionFrictionSpringOptions | DampingDurationSpringOptions

function isDampingDurationSpringOptions(options: Partial<SpringOptions>): options is DampingDurationSpringOptions {
    if (!options) {
        return false
    }
    return (
        typeof (options as Partial<DampingDurationSpringOptions>).dampingRatio === "number" ||
        typeof (options as Partial<DampingDurationSpringOptions>).duration === "number" ||
        typeof (options as Partial<DampingDurationSpringOptions>).mass === "number"
    )
}

/**
 * Animator class using a spring curve
 * @beta
 */
export class SpringAnimator<Value> implements Animator<Value, SpringOptions> {
    private options: TensionFrictionSpringOptions
    private current: Value
    private destination: Value

    private difference: number
    private state: State
    private integrator: Integrator
    private interpolator: Interpolator<Value>

    public constructor(options: Partial<SpringOptions>, private interpolation: Interpolation<Value>) {
        let _opt: Partial<TensionFrictionSpringOptions>
        if (isDampingDurationSpringOptions(options)) {
            const toPass = { ...SpringDampingDurationDefaults, ...options }
            _opt = SpringCurveValueConverter.computeDerivedCurveOptions(
                toPass.dampingRatio,
                toPass.duration,
                toPass.velocity,
                toPass.mass
            )
        } else {
            _opt = options as Partial<TensionFrictionSpringOptions>
        }
        this.options = { ...SpringTensionFrictionDefaults, ..._opt }

        this.state = {
            x: 0,
            v: this.options.velocity,
        }

        this.integrator = new Integrator(state => -this.options.tension * state.x - this.options.friction * state.v)
    }

    public isReady() {
        return this.interpolator !== undefined && this.difference !== undefined
    }

    public next(delta: number): Value {
        this.state = this.integrator.integrateState(this.state, delta)
        const value = this.interpolator(this.progress())
        return value
    }

    public isFinished() {
        let positionNearZero, velocityNearZero
        positionNearZero = Math.abs(this.state.x) < this.options.tolerance
        velocityNearZero = Math.abs(this.state.v) < this.options.tolerance
        return positionNearZero && velocityNearZero
    }

    public setFrom(value: Value) {
        this.current = value
        this.updateInterpolator()
    }

    public setVelocity(velocity: number) {
        this.state.v = velocity
    }

    progress(): number {
        return 1 - this.state.x / this.difference
    }

    // The spring always settles to 0, so we create an interpolation to the destination
    // And calculate the progress based on the current state and the span of the interpolation
    // This lets us integrate over state.x, even though Value is generic
    public setTo(value: Value) {
        this.destination = value
        this.difference = this.interpolation.difference(this.destination, this.current)
        this.state.x = this.difference
        this.updateInterpolator()
    }

    /** @internal */
    public getState(): State {
        return this.state
    }

    updateInterpolator() {
        if (this.current === undefined || this.destination === undefined) {
            return
        }
        this.interpolator = this.interpolation.interpolate(this.current, this.destination)
    }
}
