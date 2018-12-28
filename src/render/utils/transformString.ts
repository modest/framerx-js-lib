import { roundedNumberString } from "./roundedNumber"
import { TransformValues } from "../types/TransformValues"

export function transformString(transform: TransformValues | undefined): string | undefined {
    if (transform === undefined) {
        return undefined
    }
    const { x, y, rotation, width, height } = transform
    let result: string | undefined
    if (x !== 0 || y !== 0) {
        result = `translate(${roundedNumberString(x, 3)} ${roundedNumberString(y, 3)})`
    }
    if (rotation !== 0) {
        const roundedRotation = roundedNumberString(rotation, 4)
        const roundedWidth = roundedNumberString(width / 2, 3)
        const roundedHeight = roundedNumberString(height / 2, 3)
        const rotationString = `rotate(${roundedRotation} ${roundedWidth} ${roundedHeight})`
        result = result ? `${result} ${rotationString}` : rotationString
    }
    return result
}
