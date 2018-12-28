import { Interpolation } from "./Interpolation"
import { AnyInterpolation, ValueInterpolation } from "./ValueInterpolation"
import { ColorMixModelType } from "../render/types/Color/types"

const defaultTransformOptions: transform.Options<any, any> = {
    /**
     * @internal
     */
    inputInterpolation: AnyInterpolation,
    /**
     * @internal
     */
    outputInterpolation: AnyInterpolation,
    limit: false,
    colorModel: ColorMixModelType.HUSL,
}

/**
 * @public
 */
export function transform<InputValue, OutputValue>(
    from: [InputValue, InputValue],
    to: [OutputValue, OutputValue],
    options: Partial<transform.Options<InputValue, OutputValue>> = defaultTransformOptions
): (from: InputValue) => OutputValue {
    const { colorModel } = options
    if (colorModel) {
        const interpolation = new ValueInterpolation({ colorModel })
        if (!options.inputInterpolation) {
            options.inputInterpolation = interpolation
        }
        if (!options.outputInterpolation) {
            options.outputInterpolation = interpolation
        }
    }
    const { inputInterpolation, outputInterpolation, limit } = {
        ...defaultTransformOptions,
        ...options,
    } as transform.Options<InputValue, OutputValue>

    const totalDifference = inputInterpolation.difference(from[0], from[1])
    if (totalDifference === 0) {
        // Nothing to interpolate
        return () => {
            return to[0]
        }
    }
    const progressToOutput = outputInterpolation.interpolate(to[0], to[1])
    const inputToProgress = (input: InputValue) => {
        const currentDifference = inputInterpolation.difference(from[0], input)
        let outputValue = currentDifference / totalDifference
        if (limit) {
            outputValue = Math.max(0, Math.min(outputValue, 1))
        }
        return outputValue
    }
    return (inputValue: InputValue): OutputValue => {
        return progressToOutput(inputToProgress(inputValue))
    }
}

/**
 * @public
 */
export namespace transform {
    export interface Options<InputValue, OutputValue> {
        inputInterpolation: Interpolation<InputValue>
        outputInterpolation: Interpolation<OutputValue>
        limit: boolean
        colorModel: ColorMixModelType
    }

    export function value<InputValue, OutputValue>(
        input: InputValue,
        from: [InputValue, InputValue],
        to: [OutputValue, OutputValue],
        options: Partial<transform.Options<InputValue, OutputValue>> = defaultTransformOptions
    ) {
        return transform(from, to, options)(input)
    }
}
