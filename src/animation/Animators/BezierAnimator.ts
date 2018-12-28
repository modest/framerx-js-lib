import { Animator } from "./Animator"
import { Interpolation, Interpolator } from "../../interpolation/Interpolation"
import { Point } from "../../render/types/Point"

export enum Bezier {
    Linear = "linear",
    Ease = "ease",
    EaseIn = "ease-in",
    EaseOut = "ease-out",
    EaseInOut = "ease-in-out",
}

export const BezierDefaults: BezierOptions = {
    curve: Bezier.Ease,
    duration: 1,
}

function controlPointsForCurve(curve: Bezier): ControlPoints {
    switch (curve) {
        case Bezier.Linear:
            return [0, 0, 1, 1]
        case Bezier.Ease:
            return [0.25, 0.1, 0.25, 1]
        case Bezier.EaseIn:
            return [0.42, 0, 1, 1]
        case Bezier.EaseOut:
            return [0, 0, 0.58, 1]
        case Bezier.EaseInOut:
            return [0.42, 0, 0.58, 1]
    }
}

export type ControlPoints = [number, number, number, number]
export type Curve = ControlPoints | Bezier
export interface BezierOptions {
    curve: Curve
    duration: number
}

/**
 * Animator class using a bezier curve.
 * @beta
 */
export class BezierAnimator<Value> implements Animator<Value, BezierOptions> {
    private unitBezier: UnitBezier
    private options: BezierOptions

    current: Value
    destination: Value
    interpolator: Interpolator<Value>
    progress = 0
    constructor(options: Partial<BezierOptions>, private interpolation: Interpolation<Value>) {
        this.options = { ...BezierDefaults, ...options }
        let controlPoints: ControlPoints
        if (typeof this.options.curve === "string") {
            controlPoints = controlPointsForCurve(this.options.curve)
        } else {
            controlPoints = this.options.curve
        }
        const [p1x, p1y, p2x, p2y] = controlPoints
        this.unitBezier = new UnitBezier(Point(p1x, p1y), Point(p2x, p2y))
    }

    setFrom(value: Value) {
        this.current = value
        this.updateInterpolator()
    }

    setTo(value: Value) {
        this.destination = value
        this.updateInterpolator()
    }

    isReady(): boolean {
        return this.interpolator !== undefined
    }

    updateInterpolator() {
        if (this.current === undefined || this.destination === undefined) {
            return
        }
        this.interpolator = this.interpolation.interpolate(this.current, this.destination)
    }

    next = (delta: number): Value => {
        const { duration } = this.options
        this.progress += delta / duration
        const value = this.unitBezier.solve(this.progress, this.solveEpsilon(duration))
        this.current = this.interpolator(value)
        return this.current
    }

    isFinished(): boolean {
        return this.progress >= 1
    }

    solveEpsilon(duration: number) {
        return 1.0 / (200.0 * duration)
    }
}

// Based on WebKit implementation from https://github.com/WebKit/webkit/blob/master/PerformanceTests/MotionMark/resources/extensions.js#L379
class UnitBezier {
    private a: Point
    private b: Point
    private c: Point

    constructor(point1: Point, point2: Point) {
        // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
        this.c = Point.multiply(point1, 3)
        this.b = Point.subtract(Point.multiply(Point.subtract(point2, point1), 3), this.c)
        this.a = Point.subtract(Point.subtract(Point(1, 1), this.c), this.b)
    }
    solve(x: number, epsilon: number): number {
        return this.sampleY(this.solveForT(x, epsilon))
    }

    sampleX(t: number): number {
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        return ((this.a.x * t + this.b.x) * t + this.c.x) * t
    }

    sampleY(t: number): number {
        return ((this.a.y * t + this.b.y) * t + this.c.y) * t
    }

    sampleDerivativeX(t: number): number {
        return (3 * this.a.x * t + 2 * this.b.x) * t + this.c.x
    }

    solveForT(x: number, epsilon: number): number {
        let t0, t1, t2, x2, d2, i
        t2 = x
        for (i = 0; i < 8; ++i) {
            x2 = this.sampleX(t2) - x
            if (Math.abs(x2) < epsilon) return t2
            d2 = this.sampleDerivativeX(t2)
            if (Math.abs(d2) < epsilon) break
            t2 = t2 - x2 / d2
        }

        t0 = 0
        t1 = 1
        t2 = x

        if (t2 < t0) return t0
        if (t2 > t1) return t1

        while (t0 < t1) {
            x2 = this.sampleX(t2)
            if (Math.abs(x2 - x) < epsilon) return t2
            if (x > x2) t0 = t2
            else t1 = t2
            t2 = (t1 - t0) * 0.5 + t0
        }

        return t2
    }
}
