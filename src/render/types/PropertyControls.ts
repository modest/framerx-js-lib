import { deprecationWarning } from "../../utils/deprecation"
import { isFiniteNumber } from "../utils/isFiniteNumber"

/** @public */
export type PropertyControls<ComponentProps = any, ArrayTypes = any> = {
    [K in keyof ComponentProps]?: ControlDescription<Partial<ComponentProps>, ArrayTypes>
}

export type CompactControlsDescription<P = any> = NumberControlDescription<P> | EnumControlDescription<P>

export type FlatControlDescription<P = any> =
    | CompactControlsDescription<P>
    | BooleanControlDescription<P>
    | StringControlDescription<P>
    | ColorControlDescription<P>
    | FusedNumberControlDescription<P>
    | SegmentedEnumControlDescription<P>
    | ImageControlDescription<P>
    | FileControlDescription<P>
    | ComponentInstanceDescription<P>

export type ControlDescription<P = any, Q = any> =
    | FlatControlDescription<P>
    | ArrayControlDescription<P, Q>
    | ObjectControlDescription<P, Q>

/**
 * @public
 */
export const enum ControlType {
    Boolean = "boolean",
    Number = "number",
    String = "string",
    FusedNumber = "fusednumber",
    Enum = "enum",
    SegmentedEnum = "segmentedenum",
    Color = "color",
    Image = "image",
    File = "file",
    ComponentInstance = "componentinstance",
    Array = "array",
    Object = "object",
}

const ControlTypeNames = {
    boolean: true,
    number: true,
    string: true,
    fusednumber: true,
    enum: true,
    segmentedenum: true,
    color: true,
    image: true,
    file: true,
    componentinstance: true,
    array: true,
    object: true,
}

function isControlType(name: string): name is ControlType {
    return ControlTypeNames[name]
}

export interface BaseControlDescription<P = any> {
    title?: string
    hidden?: (props: P) => boolean
}

export interface BooleanControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Boolean
    defaultValue?: boolean
    disabledTitle?: string
    enabledTitle?: string
}

export interface NumberControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Number
    defaultValue?: number
    max?: number
    min?: number
    unit?: string
    step?: number
    displayStepper?: boolean
}

export interface StringControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.String
    defaultValue?: string
    placeholder?: string
}

export interface FusedNumberControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.FusedNumber
    defaultValue?: number
    toggleKey: keyof P
    toggleTitles: [string, string]
    valueKeys: [keyof P, keyof P, keyof P, keyof P]
    valueLabels: [string, string, string, string]
    min?: number
}

export interface DeprecatedFusedNumberControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.FusedNumber
    valueKeys: [keyof P, keyof P, keyof P, keyof P]
    valueLabels: [string, string, string, string]
    min?: number
    // deprecated
    splitKey: keyof P
    splitLabels: [string, string]
}

export interface EnumControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Enum
    defaultValue?: string
    options: string[]
    optionTitles?: string[] | ((props: P | null) => string[])
}

export interface SegmentedEnumControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.SegmentedEnum
    defaultValue?: string
    options: string[]
    optionTitles?: string[] | ((props: P | null) => string[])
}

export interface ColorControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Color
    defaultValue?: string
}

export interface ImageControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Image
}

export interface FileControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.File
    allowedFileTypes: string[]
}

export interface ComponentInstanceDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.ComponentInstance
}

export interface ArrayControlDescription<P = any, Q = any> extends BaseControlDescription<P> {
    type: ControlType.Array
    propertyControl: FlatControlDescription<Q>
    maxCount?: number
    defaultValue?: any[]
}

export interface ObjectControlDescription<P = any, Q = any> extends BaseControlDescription<P> {
    type: ControlType.Object
    propertyControls: { [K in keyof Q]?: CompactControlsDescription<Partial<Q>> }
}

function toNumber(o: any, min?: number): number | undefined {
    if (typeof o === "number" && (!isFiniteNumber(min) || o >= min)) return o
}

function toString(o: any): string | undefined {
    if (typeof o === "string") return o
}

function toBoolean(o: any): boolean | undefined {
    if (o === true || o === false) return o
}

function toStringList(o: any): string[] | undefined {
    if (o instanceof Array) {
        return o.map(v => toString(v)).filter(v => v) as string[]
    }
}

function toString2(o: any): [string, string] | undefined {
    if (o instanceof Array) {
        const s1 = toString(o[0])
        const s2 = toString(o[1])
        if (s1 && s2) return [s1, s2]
    }
}

function toString4(o: any): [string, string, string, string] | undefined {
    if (o instanceof Array) {
        const s1 = toString(o[0])
        const s2 = toString(o[1])
        const s3 = toString(o[2])
        const s4 = toString(o[3])
        if (s1 && s2 && s3 && s4) return [s1, s2, s3, s4]
    }
}

function toHiddenFunction<P = any>(o: any): ((props: P) => boolean) | undefined {
    if (typeof o === "function") return o
}

function toStringArrayFunction<P = any>(o: any): ((props: P) => string[]) | undefined {
    if (typeof o === "function") return o
}

function toArray(o: any, type: ControlType): any[] | undefined {
    if (!Array.isArray(o)) return
    switch (type) {
        case ControlType.Boolean:
            return o.filter(item => item === true || item === false)
        case ControlType.Number:
            return o.filter(isFiniteNumber)
        case ControlType.String:
        case ControlType.Enum:
        case ControlType.SegmentedEnum:
        case ControlType.Color:
            return toStringList(o)
    }
}

function defaultControl(
    type: ControlType,
    values: Partial<
        BooleanControlDescription &
            NumberControlDescription &
            StringControlDescription &
            FusedNumberControlDescription &
            DeprecatedFusedNumberControlDescription &
            EnumControlDescription &
            SegmentedEnumControlDescription &
            ColorControlDescription &
            ImageControlDescription &
            FileControlDescription &
            ComponentInstanceDescription &
            ArrayControlDescription &
            ObjectControlDescription
    >
): ControlDescription | ArrayControlDescription | null {
    const title = toString(values.title)
    const hidden = toHiddenFunction(values.hidden)
    const defaultValue = values.defaultValue
    switch (type) {
        case ControlType.Boolean: {
            const disabledTitle = toString(values.disabledTitle)
            const enabledTitle = toString(values.enabledTitle)
            return { title, hidden, defaultValue: toBoolean(defaultValue), type, disabledTitle, enabledTitle }
        }
        case ControlType.Number: {
            const min = toNumber(values.min)
            const max = toNumber(values.max)
            const unit = toString(values.unit)
            const step = toNumber(values.step)
            const displayStepper = toBoolean(values.displayStepper)
            return { title, hidden, defaultValue: toNumber(defaultValue), type, min, max, unit, step, displayStepper }
        }
        case ControlType.String:
            const placeholder = toString(values.placeholder)
            return { title, hidden, defaultValue, type, placeholder }
        case ControlType.FusedNumber: {
            const valueKeys = toString4(values.valueKeys)
            const valueLabels = toString4(values.valueLabels)
            const min = toNumber(values.min)

            let toggleKey = toString(values.toggleKey)
            let toggleTitles = toString2(values.toggleTitles)

            if (!toggleKey) {
                toggleKey = toString(values.splitKey)
                if (!toggleKey) return null
                deprecationWarning("splitKey option of FusedNumber control type", "1.0.0", "toggleKey")
            }

            if (!toggleTitles) {
                toggleTitles = toString2(values.splitLabels)
                if (!toggleTitles) return null
                deprecationWarning("splitLabels option of FusedNumber control type", "1.0.0", "toggleTitles")
            }

            if (!toggleKey || !toggleTitles || !valueKeys || !valueLabels) return null
            return {
                title,
                hidden,
                defaultValue: toNumber(defaultValue),
                type,
                toggleKey,
                toggleTitles,
                valueKeys,
                valueLabels,
                min,
            }
        }
        case ControlType.Enum: {
            const options = toStringList(values.options)
            if (!options) return null
            const optionTitles = toStringList(values.optionTitles) || toStringArrayFunction(values.optionTitles)
            return { title, hidden, defaultValue: toString(defaultValue), type, options, optionTitles }
        }
        case ControlType.SegmentedEnum: {
            const options = toStringList(values.options)
            if (!options) return null
            const optionTitles = toStringList(values.optionTitles) || toStringArrayFunction(values.optionTitles)
            return { title, hidden, defaultValue: toString(defaultValue), type, options, optionTitles }
        }
        case ControlType.Color:
            return { title, hidden, defaultValue: toString(defaultValue), type }
        case ControlType.Image:
            return { title, hidden, type }
        case ControlType.File:
            const allowedFileTypes = toStringList(values.allowedFileTypes)
            if (!allowedFileTypes) return null
            return { title, hidden, type, allowedFileTypes }
        case ControlType.ComponentInstance:
            return { title, hidden, type }
        case ControlType.Array:
            if (!values.propertyControl || !values.propertyControl.type) return null
            const propertyControl = defaultControl(values.propertyControl.type, values.propertyControl as object) // No idea why this cast is needed
            if (!propertyControl) return null
            if (propertyControl.type === ControlType.Array || propertyControl.type === ControlType.Object) return null
            const maxCount = toNumber(values.maxCount, 1)
            return {
                title,
                hidden,
                type,
                propertyControl,
                maxCount,
                defaultValue: toArray(values.defaultValue, propertyControl.type),
            }
        case ControlType.Object:
            if (!values.propertyControls) return null
            if (Object.keys(values.propertyControls).length !== 2) return null // We only support combo controls for now
            const propertyControls = verifyPropertyControls(values.propertyControls) as {
                string: CompactControlsDescription
            }
            return { title, hidden, type, propertyControls }
    }
    return null
}

export function verifyPropertyControls(desc: object): PropertyControls<any> {
    const controls: PropertyControls<any> = {}
    for (const key in desc) {
        const value = desc[key]
        if (typeof value === "string" && isControlType(value)) {
            const d = defaultControl(value, {})
            if (d) {
                controls[key] = d
            }
            continue
        }
        const type = value.type
        if (typeof type === "string" && isControlType(type)) {
            const d = defaultControl(type, value)
            if (d) {
                controls[key] = d
            }
            continue
        }
    }

    return controls
}
