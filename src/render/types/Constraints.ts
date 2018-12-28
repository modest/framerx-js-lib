import * as React from "react"
import { Rect } from "./Rect"
import { Size } from "./Size"
import { isFiniteNumber } from "../utils/isFiniteNumber"
import { Animatable, AnimatableObject, isAnimatable } from "../../animation/Animatable"
import { WithFractionOfFreeSpace } from "../traits/FreeSpace"

export interface DefaultProps {
    parentSize: AnimatableObject<Size> // Should always be mirrored with the parentSize in ConstraintProperties
}

// Represents model property values for layout constraints. These may be internally inconsistent. Mask and Values are generated from these.
export interface ConstraintProperties extends Partial<WithFractionOfFreeSpace> {
    parentSize: Size | AnimatableObject<Size> | null

    left: Animatable<number> | number | null
    right: Animatable<number> | number | null
    top: Animatable<number> | number | null
    bottom: Animatable<number> | number | null
    centerX: ConstraintPercentage
    centerY: ConstraintPercentage
    width: ConstraintDimension
    height: ConstraintDimension
    aspectRatio: number | null
    autoSize?: boolean
}

export const constraintDefaults: ConstraintProperties = {
    left: null,
    right: null,
    top: null,
    bottom: null,
    centerX: "50%",
    centerY: "50%",
    aspectRatio: null,
    parentSize: null,
    width: 100,
    height: 100,
}

// Some property values can be defined using parent-relative percentages. Note: this used to be indicated using React.CSSPercentage.
export type ConstraintPercentage = string
export type ConstraintAuto = "auto"
export type ConstraintFreespaceFraction = string

// Dimensions can be numbers or strings: percentages, fractions of free space (fr), or auto
export type ConstraintDimension =
    | Animatable<number>
    | number
    | ConstraintPercentage
    | ConstraintAuto
    | ConstraintFreespaceFraction

export enum DimensionType {
    FixedNumber,
    Percentage,
    /** @internal */ Auto,
    FractionOfFreeSpace,
}

// Represents a set of active layout constraints. In a better world, this would be an enum / option set.
export interface ConstraintMask {
    left: boolean
    right: boolean
    top: boolean
    bottom: boolean

    widthType: DimensionType
    heightType: DimensionType

    aspectRatio: number | null
    fixedSize: boolean // usesIntrinsicSize?
}

export function isConstraintSupportingChild<T extends ConstraintProperties>(
    child: React.ReactChild
): child is React.ReactElement<T> {
    if (child === null || child === undefined || typeof child === "string" || typeof child === "number") {
        return false
    }
    // Assume for now that all children support constraints (so they get passed parentSize)
    return true
    // return isConstraintSupportingClass(child.type)
}

export function isConstraintSupportingClass<T extends ConstraintProperties>(
    classToTest: any
): classToTest is React.ComponentClass<T> {
    if (classToTest === null || classToTest === undefined) {
        return false
    }
    return classToTest.supportsConstraints === true
}

export namespace ConstraintMask {
    // Modifies the constraint mask to remove invalid (mutually exclusive) options and returns the original.
    // TODO: this removes major inconsistencies but probably needs to be merged with ConstraintSolver.
    export const quickfix = (constraints: ConstraintMask): ConstraintMask => {
        if (constraints.fixedSize) {
            // auto sized text
            // TODO: use auto dimension type
            constraints.widthType = DimensionType.FixedNumber
            constraints.heightType = DimensionType.FixedNumber
            constraints.aspectRatio = null
        }

        if (isFiniteNumber(constraints.aspectRatio)) {
            if ((constraints.left && constraints.right) || (constraints.top && constraints.bottom)) {
                constraints.widthType = DimensionType.FixedNumber
                constraints.heightType = DimensionType.FixedNumber
            }
            if (constraints.left && constraints.right && constraints.top && constraints.bottom) {
                constraints.bottom = false
            }
            if (
                constraints.widthType !== DimensionType.FixedNumber &&
                constraints.heightType !== DimensionType.FixedNumber
            ) {
                constraints.heightType = DimensionType.FixedNumber
            }
        }

        if (constraints.left && constraints.right) {
            constraints.widthType = DimensionType.FixedNumber

            if (constraints.fixedSize) {
                constraints.right = false
            }
        }
        if (constraints.top && constraints.bottom) {
            constraints.heightType = DimensionType.FixedNumber

            if (constraints.fixedSize) {
                constraints.bottom = false
            }
        }

        return constraints
    }
}

// Represents concrete snapshot values for constraints. Constraints that aren't active in the corresponding ConstraintsMask should be assumed to contain garbage.
export interface ConstraintValuesBase {
    left: number | null
    right: number | null
    top: number | null
    bottom: number | null
    centerAnchorX: number // [0...1]
    centerAnchorY: number // [0...1]
    widthType: DimensionType
    heightType: DimensionType
    aspectRatio: number | null
}

export interface ConstraintValues extends ConstraintValuesBase {
    width: number
    height: number
}

/**
 * @internal
 */
export interface UserConstraintValues extends ConstraintValuesBase {
    width: number | null
    height: number | null
}

export function valueToDimensionType(value: string | number | Animatable<number> | undefined) {
    if (typeof value === "string") {
        const trimmedValue = value.trim()
        if (trimmedValue === "auto") return DimensionType.Auto
        if (trimmedValue.endsWith("fr")) return DimensionType.FractionOfFreeSpace
        if (trimmedValue.endsWith("%")) return DimensionType.Percentage
    }
    return DimensionType.FixedNumber
}

export namespace ConstraintValues {
    // Returns concrete current values given some ConstraintProperties.
    export const fromProperties = (
        props: Partial<ConstraintProperties> & { autoSize?: boolean }
    ): UserConstraintValues => {
        const { left, right, top, bottom, width, height, centerX, centerY, aspectRatio, autoSize } = props
        const constraints = ConstraintMask.quickfix({
            left: isFiniteNumber(left) || isAnimatable(left),
            right: isFiniteNumber(right) || isAnimatable(right),
            top: isFiniteNumber(top) || isAnimatable(top),
            bottom: isFiniteNumber(bottom) || isAnimatable(bottom),
            widthType: valueToDimensionType(width),
            heightType: valueToDimensionType(height),
            aspectRatio: aspectRatio || null,
            fixedSize: autoSize === true,
        })

        let widthValue: number | null = null
        let heightValue: number | null = null

        let widthType = DimensionType.FixedNumber
        let heightType = DimensionType.FixedNumber

        if (constraints.widthType !== DimensionType.FixedNumber && typeof width === "string") {
            const parsedWidth = parseFloat(width)

            if (width.endsWith("fr")) {
                widthType = DimensionType.FractionOfFreeSpace
                widthValue = parsedWidth
            } else if (width === "auto") {
                widthType = DimensionType.Auto
            } else {
                // Percentage
                widthType = DimensionType.Percentage
                widthValue = parsedWidth / 100
            }
        } else if (width !== undefined && typeof width !== "string") {
            widthValue = Animatable.getNumber(width)
        }

        if (constraints.heightType !== DimensionType.FixedNumber && typeof height === "string") {
            const parsedHeight = parseFloat(height)

            if (height.endsWith("fr")) {
                heightType = DimensionType.FractionOfFreeSpace
                heightValue = parsedHeight
            } else if (height === "auto") {
                heightType = DimensionType.Auto
            } else {
                // Percentage
                heightType = DimensionType.Percentage
                heightValue = parseFloat(height) / 100
            }
        } else if (height !== undefined && typeof height !== "string") {
            heightValue = Animatable.getNumber(height)
        }

        let centerAnchorX = 0.5
        let centerAnchorY = 0.5
        if (centerX) {
            centerAnchorX = parseFloat(centerX) / 100
        }
        if (centerY) {
            centerAnchorY = parseFloat(centerY) / 100
        }

        return {
            left: constraints.left ? Animatable.getNumber(left) : null,
            right: constraints.right ? Animatable.getNumber(right) : null,
            top: constraints.top ? Animatable.getNumber(top) : null,
            bottom: constraints.bottom ? Animatable.getNumber(bottom) : null,
            widthType,
            heightType,
            width: widthValue,
            height: heightValue,
            aspectRatio: constraints.aspectRatio || null,
            centerAnchorX: centerAnchorX,
            centerAnchorY: centerAnchorY,
        }
    }

    export const toMinSize = (
        values: UserConstraintValues,
        parentSize: Size | AnimatableObject<Size> | null | undefined,
        autoSize: Size | null = null
    ): Size => {
        let width: number | null = null
        let height: number | null = null

        const parentWidth = parentSize ? Animatable.getNumber(parentSize.width) : null
        const parentHeight = parentSize ? Animatable.getNumber(parentSize.height) : null

        const hOpposingPinsOffset = pinnedOffset(values.left, values.right)

        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset
        } else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width
        } else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width
                    break
                case DimensionType.FractionOfFreeSpace:
                    width = 0
                    break
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width
                    }
                    break
            }
        }

        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom)

        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset
        } else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height
        } else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height
                    break
                case DimensionType.FractionOfFreeSpace:
                    height = 0
                    break
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height
                    }
                    break
            }
        }

        return sizeAfterApplyingDefaultsAndAspectRatio(width, height, values)
    }

    export const toSize = (
        values: UserConstraintValues,
        parentSize: Size | AnimatableObject<Size> | null | undefined,
        autoSize: Size | null,
        freeSpace: WithFractionOfFreeSpace | null
    ): Size => {
        let width: number | null = null
        let height: number | null = null

        const parentWidth = parentSize ? Animatable.getNumber(parentSize.width) : null
        const parentHeight = parentSize ? Animatable.getNumber(parentSize.height) : null

        const hOpposingPinsOffset = pinnedOffset(values.left, values.right)

        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset
        } else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width
        } else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width
                    break
                case DimensionType.FractionOfFreeSpace:
                    width = freeSpace
                        ? (freeSpace.freeSpaceInParent.width / freeSpace.freeSpaceUnitDivisor.width) * values.width
                        : 0
                    break
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width
                    }
                    break
            }
        }

        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom)

        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset
        } else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height
        } else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height
                    break
                case DimensionType.FractionOfFreeSpace:
                    height = freeSpace
                        ? (freeSpace.freeSpaceInParent.height / freeSpace.freeSpaceUnitDivisor.height) * values.height
                        : 0
                    break
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height
                    }
                    break
            }
        }

        return sizeAfterApplyingDefaultsAndAspectRatio(width, height, values)
    }

    // Returns a parent-relative rect given concrete ConstraintValues.
    export const toRect = (
        values: UserConstraintValues,
        parentSize: Size | AnimatableObject<Size> | null,
        autoSize: Size | null = null,
        pixelAlign: boolean = false,
        // This argument is actually never used, because fractional sizes are always calculated by it's parent to static sizes
        freeSpace: WithFractionOfFreeSpace | null = null
    ): Rect => {
        let x = values.left || 0
        let y = values.top || 0
        let width: number | null = null
        let height: number | null = null

        const parentWidth = parentSize ? Animatable.getNumber(parentSize.width) : null
        const parentHeight = parentSize ? Animatable.getNumber(parentSize.height) : null

        const hOpposingPinsOffset = pinnedOffset(values.left, values.right)

        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset
        } else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width
        } else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width
                    break
                case DimensionType.FractionOfFreeSpace:
                    width = freeSpace
                        ? (freeSpace.freeSpaceInParent.width / freeSpace.freeSpaceUnitDivisor.width) * values.width
                        : 0
                    break
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width
                    }
                    break
            }
        }

        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom)

        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset
        } else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height
        } else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height
                    break
                case DimensionType.FractionOfFreeSpace:
                    height = freeSpace
                        ? (freeSpace.freeSpaceInParent.height / freeSpace.freeSpaceUnitDivisor.height) * values.height
                        : 0
                    break
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height
                    }
                    break
            }
        }

        const sizeWithDefaults = sizeAfterApplyingDefaultsAndAspectRatio(width, height, values)
        width = sizeWithDefaults.width
        height = sizeWithDefaults.height

        if (values.left !== null) {
            x = values.left
        } else if (parentWidth && values.right !== null) {
            x = parentWidth - values.right - width
        } else if (parentWidth) {
            x = values.centerAnchorX * parentWidth - width / 2
        }

        if (values.top !== null) {
            y = values.top
        } else if (parentHeight && values.bottom !== null) {
            y = parentHeight - values.bottom - height
        } else if (parentHeight) {
            y = values.centerAnchorY * parentHeight - height / 2
        }

        const f = { x, y, width, height }
        if (pixelAlign) {
            return Rect.pixelAligned(f)
        }
        return f
    }
}

function sizeAfterApplyingDefaultsAndAspectRatio(
    width: number | null,
    height: number | null,
    values: UserConstraintValues
): Size {
    let w = isFiniteNumber(width) ? width : 100
    let h = isFiniteNumber(height) ? height : 100

    if (isFiniteNumber(values.aspectRatio)) {
        if (isFiniteNumber(values.left) && isFiniteNumber(values.right)) {
            h = w / values.aspectRatio
        } else if (isFiniteNumber(values.top) && isFiniteNumber(values.bottom)) {
            w = h * values.aspectRatio
        } else if (values.widthType !== DimensionType.FixedNumber) {
            h = w / values.aspectRatio
        } else {
            w = h * values.aspectRatio
        }
    }

    return {
        width: w,
        height: h,
    }
}

function pinnedOffset(start: number | null, end: number | null) {
    if (!isFiniteNumber(start) || !isFiniteNumber(end)) return null
    return start + end
}
