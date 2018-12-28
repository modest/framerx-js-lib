import { Integrator, State } from "./Integrator"
import { Animator } from "./Animator"

export type Options = {
    velocity: number
    friction: number
    tolerance: number
}
/**
 * @internal
 */
export class FrictionAnimator implements Animator<number, Partial<Options>> {
    options: Options

    private state: State
    private integrator: Integrator
    public constructor(options: Partial<Options>) {
        this.options = {
            velocity: 0,
            friction: 2,
            tolerance: 1 / 10,
        }
        Object.assign(this.options, options)
        this.state = {
            x: 0,
            v: this.options.velocity,
        }

        this.integrator = new Integrator(state => -(this.options.friction * state.v))
    }

    public setFrom(value: number) {
        this.state.x = value
    }

    public setTo(value: number) {}

    public setVelocity(velocity: number) {
        this.state.v = velocity
    }

    public getState(): State {
        return this.state
    }

    public isReady() {
        return true
    }

    public next(delta: number): number {
        this.state = this.integrator.integrateState(this.state, delta)
        return this.state.x
    }

    public isFinished() {
        return Math.abs(this.state.v) < this.options.tolerance
    }
}
