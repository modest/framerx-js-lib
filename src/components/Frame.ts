import * as React from "react"
import { Frame as CoreFrame, CoreFrameProps } from "../render"
import { WithEvents, WithEventsProperties } from "./hoc/WithEvents"

/** @public */
export type FrameProps = CoreFrameProps & WithEventsProperties
/** @public */
export const Frame: React.ComponentClass<Partial<FrameProps>> = WithEvents(CoreFrame)
