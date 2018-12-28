/**
 * @internal
 */
export interface State {
    x: number
    v: number
}

/**
 * @internal
 */
export type AccelerationFunction = (state: State) => number

/**
 * @internal
 */
interface Delta {
    dx: number
    dv: number
}

/**
 * @internal
 */
export class Integrator {
    private accelerationForState: AccelerationFunction

    public constructor(accelerationFunction: AccelerationFunction) {
        this.accelerationForState = accelerationFunction
    }

    public integrateState(state: State, dt: number) {
        let a, b, c, d, dvdt, dxdt
        a = this.evaluateState(state)
        b = this.evaluateStateWithDerivative(state, dt * 0.5, a)
        c = this.evaluateStateWithDerivative(state, dt * 0.5, b)
        d = this.evaluateStateWithDerivative(state, dt, c)

        dxdt = (1.0 / 6.0) * (a.dx + 2.0 * (b.dx + c.dx) + d.dx)
        dvdt = (1.0 / 6.0) * (a.dv + 2.0 * (b.dv + c.dv) + d.dv)

        state.x = state.x + dxdt * dt
        state.v = state.v + dvdt * dt

        return state
    }

    private evaluateState(initialState: State): Delta {
        const dv = this.accelerationForState(initialState)
        return { dx: initialState.v, dv: dv }
    }

    private evaluateStateWithDerivative(initialState: State, dt: number, derivative: Delta): Delta {
        let output, state
        state = {
            x: initialState.x + derivative.dx * dt,
            v: initialState.v + derivative.dv * dt,
        }
        output = {
            dx: state.v,
            dv: this.accelerationForState(state),
        }
        return output
    }
}
