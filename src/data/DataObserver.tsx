import * as React from "react"
import { Data } from "./Data"
import { Cancel } from "../animation/Animatable"
import { MainLoop } from "../core/Loop"

/**
 * @internal
 */
export interface Props {}
/**
 * @internal
 */
export interface State {
    update: number
}
const initialState = { update: 0 }

/**
 * @internal
 */
export const DataObserverContext = React.createContext(initialState)

/**
 * @internal
 */
export class DataObserver extends React.Component<Props, State> {
    observers: Cancel[] = []
    state = initialState

    static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null {
        const prevUpdate = (prevState && prevState.update) || 1
        return { update: prevUpdate + 1 }
    }

    taskAdded = false
    frameTask = () => {
        this.taskAdded = false
        this.setState({ update: this.state.update + 1 })
    }

    observer = () => {
        if (this.taskAdded) return
        this.taskAdded = true
        MainLoop.addFrameTask(this.frameTask)
    }

    render() {
        const { children } = this.props
        this.observers.map(cancel => cancel())
        this.observers = []
        Data._stores.forEach((d: object) => {
            const observer = Data.addObserver(d, this.observer)
            this.observers.push(observer)
        })
        return <DataObserverContext.Provider value={{ ...this.state }}>{children}</DataObserverContext.Provider>
    }
}
