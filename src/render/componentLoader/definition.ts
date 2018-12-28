import * as React from "react"

import { Override } from "../../data/WithOverride"

import { SetSizeAndPositionChildren } from "../presentation/SetSizeAndPositionChildren"
import { JSONObject } from "../types/JSONData"
import { PropertyControls } from "../types/PropertyControls"

import { stripComponent } from "./utils"

/**
 * @internal
 */
export type ComponentIdentifier = string

export type ComponentMap = {
    [name: string]: ComponentDefinition
}

/**
 * @ internal
 */
export interface ComponentLoader {
    /**
     * @internal
     */
    packageDisplayName(packageIdentifier: PackageIdentifier): string | undefined
    /**
     * @internal
     */
    localPackageIdentifier(): PackageIdentifier
    /**
     * Names of the packages that are direct dependencies of the project.
     * @internal
     */
    packageIdentifiers(): PackageIdentifier[]
    /**
     * @internal
     */
    componentsForPackage(packageIdentifier: PackageIdentifier): ComponentDefinition[]
    /**
     * @internal
     */
    componentForIdentifier(identifier: ComponentIdentifier): ComponentDefinition | null
    /**
     * @internal
     */
    errorForIdentifier(identifier: ComponentIdentifier): ErrorDefinition | null
    /**
     * Identifiers of the components that are in the current project
     * or in packages that are direct dependencies of the project.
     * @internal
     */
    componentIdentifiers(): ComponentIdentifier[]
    /**
     * @internal
     */
    forEachDesignComponents(cb: (component: DesignComponentDefinition) => void): void
    /**
     * @internal
     */
    forEachComponent(cb: (component: ComponentDefinition) => boolean): void
}

/**
 * NOTE: Also defined as ComponentType in the Server project.
 * @internal
 */
export type ComponentType = "component" | "device" | "deviceHand" | "deviceSkin" | "master" | "override"

/**
 * @internal
 */
export type PackageIdentifier = string

/**
 * @internal
 */
export type ComponentDefinition<P = any> = {
    class: React.ComponentType<P> | JSON | Override<any>
    /** Package depth of this component. 0 if part of project, 1 if a direct dependency, greater otherwise. */
    depth: number
    file: string
    identifier: ComponentIdentifier
    name: string
    /** Identifier of the package that contains this component (one package can contain multiple components). */
    packageIdentifier: PackageIdentifier
    properties: PropertyControls<P>
    type: ComponentType

    defaults?: P
}

/**
 * @internal
 */
export type ReactComponentDefinition<P = any> = ComponentDefinition<P> & { class: React.ComponentType<P> }

/**
 * @internal
 */
export type DesignComponentDefinition = ComponentDefinition & { class: JSONObject }

/**
 * @internal
 */
export function isDesignDefinition(d: ComponentDefinition): d is DesignComponentDefinition {
    return d.type === "master"
}

/**
 * @internal
 */
export function isNonUserFacing(d: ComponentDefinition): boolean {
    return d.type === "device" || d.type === "deviceSkin" || d.type === "deviceHand"
}

/**
 * @internal
 */
export function isOverride(d: ComponentDefinition): boolean {
    return d.type === "override"
}

/**
 * @internal
 */
export function isReactDefinition<P = any>(d: ComponentDefinition<P>): d is ReactComponentDefinition<P> {
    return d.type !== "master"
}

/**
 * @internal
 */
export type ErrorDefinition = ComponentDefinition<{}> & {
    error: Error | string

    fileDoesNotExist?: boolean
}

export function createErrorDefinition(identifier: string, error: string | Error, custom?: Partial<ErrorDefinition>) {
    const file = stripComponent(identifier)
    const cleanedFile = cleanFilename(file)
    const definition: ErrorDefinition = {
        class: SetSizeAndPositionChildren(createErrorComponentClass(error)),
        depth: identifier.startsWith(".") ? 0 : 1, // Assume a depth of 1 when non-local.
        error,
        file,
        identifier,
        name: cleanedFile,
        packageIdentifier: "<unknown>",
        properties: {},
        type: "component",
        ...custom,
    }
    return definition
}

/**
 * @internal
 */
export function isErrorDefinition(def: ComponentDefinition | ErrorDefinition): def is ErrorDefinition {
    return def !== undefined && (<ErrorDefinition>def).error !== undefined
}

function cleanFilename(filename: string) {
    if (!filename.startsWith("./")) return filename
    return filename.slice(2)
}

function createErrorComponentClass(error: string | Error): React.ComponentClass {
    return class ErrorComponent extends React.Component {
        render(): React.ReactNode {
            throw error
        }
    }
}
