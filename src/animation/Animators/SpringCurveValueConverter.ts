const epsilon: number = 0.001
const minDuration: number = 0.01
const maxDuration: number = 10.0
const minDamping: number = Number.MIN_VALUE
const maxDamping: number = 1
type NumFunc = (num: number) => number
export type CurveOptions = {
    tension: number
    friction: number
    velocity: number
}
// Newton's method
function approximateRoot(func: NumFunc, derivative: NumFunc, initialGuess: number, times: number = 12): number {
    let result = initialGuess
    for (let i = 1, end = times, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        result = result - func(result) / derivative(result)
    }
    return result
}

function angularFrequency(undampedFrequency: number, dampingRatio: number): number {
    return undampedFrequency * Math.sqrt(1 - Math.pow(dampingRatio, 2))
}

export namespace SpringCurveValueConverter {
    export function computeDampingRatio(tension: number, friction: number, mass: number = 1): number {
        return friction / (2 * Math.sqrt(mass * tension))
    }

    // Tries to compute the duration of a spring,
    // but can't for certain velocities and if dampingRatio >= 1
    // In those cases it will return null
    export function computeDuration(
        tension: number,
        friction: number,
        velocity: number = 0,
        mass: number = 1
    ): number | null {
        let duration
        const dampingRatio = computeDampingRatio(tension, friction)
        const undampedFrequency = Math.sqrt(tension / mass)
        // This is basically duration extracted out of the envelope functions
        if (dampingRatio < 1) {
            const a = Math.sqrt(1 - Math.pow(dampingRatio, 2))
            const b = velocity / (a * undampedFrequency)
            const c = dampingRatio / a
            const d = -((b - c) / epsilon)
            if (d <= 0) {
                return null
            }
            duration = Math.log(d) / (dampingRatio * undampedFrequency)
        } else {
            return null
        }
        return duration
    }

    export function computeDerivedCurveOptions(
        dampingRatio: number,
        duration: number,
        velocity: number = 0,
        mass: number = 1
    ): CurveOptions {
        let derivative: NumFunc, envelope: NumFunc
        dampingRatio = Math.max(Math.min(dampingRatio, maxDamping), minDamping)
        duration = Math.max(Math.min(duration, maxDuration), minDuration)

        if (dampingRatio < 1) {
            envelope = function(envelopeUndampedFrequency) {
                const exponentialDecay = envelopeUndampedFrequency * dampingRatio
                const currentDisplacement = exponentialDecay * duration
                const a = exponentialDecay - velocity
                const b = angularFrequency(envelopeUndampedFrequency, dampingRatio)
                const c = Math.exp(-currentDisplacement)
                return epsilon - (a / b) * c
            }

            derivative = function(derivativeUndampedFrequency) {
                const exponentialDecay = derivativeUndampedFrequency * dampingRatio
                const currentDisplacement = exponentialDecay * duration
                const d = currentDisplacement * velocity + velocity
                const e = Math.pow(dampingRatio, 2) * Math.pow(derivativeUndampedFrequency, 2) * duration
                const f = Math.exp(-currentDisplacement)
                const g = angularFrequency(Math.pow(derivativeUndampedFrequency, 2), dampingRatio)
                const factor = -envelope(derivativeUndampedFrequency) + epsilon > 0 ? -1 : 1
                return (factor * ((d - e) * f)) / g
            }
        } else {
            envelope = function(envelopeUndampedFrequency) {
                const a = Math.exp(-envelopeUndampedFrequency * duration)
                const b = (envelopeUndampedFrequency - velocity) * duration + 1
                return -epsilon + a * b
            }

            derivative = function(derivativeUndampedFrequency) {
                const a = Math.exp(-derivativeUndampedFrequency * duration)
                const b = (velocity - derivativeUndampedFrequency) * Math.pow(duration, 2)
                return a * b
            }
        }

        const result = {
            tension: 100,
            friction: 10,
            velocity,
        }

        const initialGuess = 5 / duration
        const undampedFrequency = approximateRoot(envelope, derivative, initialGuess)
        if (!isNaN(undampedFrequency)) {
            result.tension = Math.pow(undampedFrequency, 2) * mass
            result.friction = dampingRatio * 2 * Math.sqrt(mass * result.tension)
        }
        return result
    }
}
