import { LinearGradient } from "../types/Gradient"
import { WithShape } from "../traits/Shape"
import { FillProperties } from "../traits/Fill"
import {
    elementPropertiesForLinearGradient,
    LinearGradientElementProperties,
} from "./elementPropertiesForLinearGradient"

export function gradientForShape(
    nodeId: string,
    node: WithShape & FillProperties
): LinearGradientElementProperties | undefined {
    if (LinearGradient.isLinearGradient(node.fill)) {
        return elementPropertiesForLinearGradient(node.fill, nodeId)
    }
    return undefined
}
