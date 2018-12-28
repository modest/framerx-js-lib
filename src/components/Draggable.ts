import { Frame, FrameProps } from "./Frame"
import { WithDragging } from "./hoc/WithDragging"
import { DraggableProps } from "./hoc/WithDragging"

/** @public */
export const Draggable: React.ComponentClass<
    Partial<FrameProps> & Partial<DraggableProps<typeof Frame>>
> = WithDragging(Frame)
