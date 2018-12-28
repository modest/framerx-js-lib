import * as time from "./Time"

import { EventEmitter } from "./EventEmitter"

export type LoopEventNames = "render" | "update" | "finish"
export type LoopDeltaCallback = (this: Loop, frame: number) => void

let LoopTimeStep = 1 / 60

/**
 * @public
 */
export class Loop extends EventEmitter<LoopEventNames> {
    private _started = false
    private _frame = 0
    private _frameTasks: Function[] = []

    /**
     * To add a task to be done at the end of a frame.
     * Tasks added from a task will be ignored. These will run after loop events have been processed.
     * @internal
     */
    addFrameTask(task: Function) {
        this._frameTasks.push(task)
    }

    private _processFrameTasks() {
        const postEventTasks = this._frameTasks
        const length = postEventTasks.length
        if (length === 0) return

        for (let i = 0; i < length; i++) {
            postEventTasks[i]()
        }

        postEventTasks.length = 0
    }

    /**
     * @internal
     */
    static set TimeStep(value: number) {
        LoopTimeStep = value
    }

    /**
     * @internal
     */
    static get TimeStep() {
        return LoopTimeStep
    }

    /**
     * @internal
     */
    constructor(start = false) {
        super()
        if (start) {
            this.start()
        }
    }

    /**
     * @internal
     */
    start(): this {
        if (this._started) return this

        this._frame = 0
        this._started = true
        time.raf(this.tick)
        return this
    }

    /**
     * @internal
     */
    stop(): this {
        this._started = false
        return this
    }

    /**
     * @internal
     */
    get frame() {
        return this._frame
    }

    /**
     * @internal
     */
    get time() {
        return this._frame * LoopTimeStep
    }

    /**
     * @internal
     */
    private tick = () => {
        if (!this._started) return

        time.raf(this.tick)

        this.emit("update", this._frame, LoopTimeStep)
        this.emit("render", this._frame, LoopTimeStep)
        this._processFrameTasks()

        this._frame++
    }
}

/**
 * @internal
 */
export const MainLoop = new Loop()
