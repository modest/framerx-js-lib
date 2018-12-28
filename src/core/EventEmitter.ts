import { EventEmitter as EventEmitter3, ListenerFn } from "eventemitter3"

export class EventEmitter<EventName> {
    private _emitter = new EventEmitter3<string>()

    eventNames() {
        return this._emitter.eventNames() as string[]
    }

    eventListeners() {
        const listeners: { [index: string]: ListenerFn[] } = {}

        for (const eventName of this._emitter.eventNames()) {
            listeners[eventName as string] = this._emitter.listeners(eventName)
        }

        return listeners
    }

    on(eventName: EventName, fn: Function) {
        this.addEventListener(eventName, fn, false, false, this)
    }

    off(eventName: EventName, fn: Function) {
        this.removeEventListeners(eventName, fn)
    }

    once(eventName: EventName, fn: Function) {
        this.addEventListener(eventName, fn, true, false, this)
    }

    unique(eventName: EventName, fn: Function) {
        this.addEventListener(eventName, fn, false, true, this)
    }

    addEventListener(eventName: EventName, fn: Function, once: boolean, unique: boolean, context: Object) {
        if (unique) {
            for (const name of this._emitter.eventNames()) {
                if (fn === (this._emitter.listeners(name) as any)) {
                    return
                }
            }
        }

        if (once === true) {
            this._emitter.once(eventName as any, fn as any, context)
        } else {
            this._emitter.addListener(eventName as any, fn as any, context)
        }
    }

    removeEventListeners(eventName?: EventName, fn?: Function): void {
        if (eventName) {
            this._emitter.removeListener(eventName as any, fn as any)
        } else {
            this.removeAllEventListeners()
        }
    }

    removeAllEventListeners() {
        this._emitter.removeAllListeners()
    }

    countEventListeners(eventName?: EventName, handler?: Function): number {
        if (eventName) {
            return this._emitter.listeners(eventName as any).length
        } else {
            let count = 0

            for (const name of this._emitter.eventNames()) {
                count += this._emitter.listeners(name).length
            }

            return count
        }
    }

    emit(eventName: EventName, ...args: any[]) {
        this._emitter.emit(eventName as any, ...args)
    }
}
