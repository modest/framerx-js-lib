// Note: React is imported here to re-export to script.
import * as React from "react"
import * as ReactDOM from "react-dom"

import {
    ComponentLoader,
    ComponentDefinition,
    ComponentIdentifier,
    ComponentMap,
    DesignComponentDefinition,
    ErrorDefinition,
    PackageIdentifier,
    createErrorDefinition,
    isDesignDefinition,
    isErrorDefinition,
} from "./definition"
import { FramerIndexModule, collectComponents, collectPackages, localPackageFallbackIdentifier } from "./package"
import { stripComponent, warn } from "./utils"

export * from "./definition"

// TODO: Don't store state globally.
/**
 * @internal
 */
export const componentLoader: ComponentLoader = {
    componentForIdentifier: (identifier: ComponentIdentifier) => {
        return null
    },
    componentsForPackage: (packageIdentifier: PackageIdentifier) => {
        return []
    },
    componentIdentifiers: () => {
        return []
    },
    errorForIdentifier: (identifier: ComponentIdentifier) => {
        return null
    },
    forEachComponent: (cb: (component: ComponentDefinition) => boolean): void => {},
    forEachDesignComponents: (cb: (component: DesignComponentDefinition) => void): void => {},
    localPackageIdentifier: () => {
        return localPackageFallbackIdentifier
    },
    packageDisplayName: (packageIdentifier: PackageIdentifier): string | undefined => {
        return undefined
    },
    packageIdentifiers: (): PackageIdentifier[] => {
        return []
    },
}

/**
 * @internal
 */
export function updateComponentLoader(script: string, framer: any) {
    updateComponentLoaderWithScript(script, framer)
}

export function updateComponentLoaderWithScript(script: string, framer: any) {
    // A special require function with the dependencies we'd like to feed.
    const require = (name: string) => {
        if (name === "react") return React
        if (name === "react-dom" || name === "ReactDOM") return ReactDOM
        if (name === "framer") return framer
        if (name === "framer/resource") return {} // not a real module, tricked by our webpack compiler
        throw Error(`Component loader: Can't require ${name}`)
    }

    // NOTE: In Electron, module variable exists and resolves to index.debug.html.
    const fn = new Function("module", "exports", "require", script)
    const mod: FramerIndexModule = { exports: {} }
    try {
        fn(mod, mod.exports, require)
    } catch (error) {
        warn("An error occurred while reloading", error)
        return
    }

    // Figure out the name of the local package (or fallback).
    let localPackageIdentifier = localPackageFallbackIdentifier
    if (mod.exports.__framer__) {
        const { packageJson } = mod.exports.__framer__
        if (packageJson && packageJson.name) {
            localPackageIdentifier = packageJson.name
        }
    }

    // Get all packages referenced by the local package and any dependency under it.
    const packages = collectPackages(mod.exports)

    // Next, find all components in each package and put them in a lookup table.
    const components: ComponentMap = {}

    // Various optimized data structures to avoid lots of repeated computation:
    const definitionsByPackage: { [identifier: string]: ComponentDefinition[] } = {}
    const visibleComponentIdentifiers: ComponentIdentifier[] = []
    const visiblePackageNames: PackageIdentifier[] = []

    for (const name of Object.keys(packages)) {
        const packageInfo = packages[name]

        // Keep a list of all direct dependencies.
        if (packageInfo.depth <= 1) {
            visiblePackageNames.push(name)
        }

        // TODO: Review all unnecessary calls to componentIdentifiers().
        // TODO: Consider separate indexes for components & devices, etc.
        const packageComponents = collectComponents(packageInfo)

        // Store a list of components that are in this package.
        definitionsByPackage[name] = []
        for (const identifier of Object.keys(packageComponents)) {
            definitionsByPackage[name].push(packageComponents[identifier])
            // Keep a list of all component identifiers of direct dependencies.
            if (packageInfo.depth <= 1) {
                visibleComponentIdentifiers.push(identifier)
            }
        }

        Object.assign(components, packageComponents)
    }

    visiblePackageNames.sort((a, b) => {
        return packages[a].displayName.localeCompare(packages[b].displayName)
    })

    componentLoader.componentForIdentifier = (identifier: ComponentIdentifier): ComponentDefinition | null => {
        return components[identifier] || null
    }

    componentLoader.componentsForPackage = (packageIdentifier: PackageIdentifier): ComponentDefinition[] => {
        return definitionsByPackage[packageIdentifier] || []
    }

    // TODO: Allow more specific filtering across the entire tree of dependencies.
    componentLoader.componentIdentifiers = (): ComponentIdentifier[] => {
        return visibleComponentIdentifiers
    }

    componentLoader.errorForIdentifier = (identifier: ComponentIdentifier): ErrorDefinition | null => {
        // All errors will be stored under the filename, not the component's identifier.
        const file = stripComponent(identifier)
        if (!(file in components)) {
            // The component doesn't exist, return that as error.
            // NOTE: In the current setup, it is not possible that the component is still
            // loading but if that is the case that will need to be detected here.
            // TODO: Show a more user friendly error if component class changes name.
            return createErrorDefinition(identifier, "Component file does not exist.", { fileDoesNotExist: true })
        }
        const definition = components[file]
        if (!isErrorDefinition(definition)) {
            // This is a valid component definition.
            return null
        }
        return definition
    }

    componentLoader.forEachComponent = (cb: (component: ComponentDefinition) => boolean): void => {
        for (const identifier of visibleComponentIdentifiers) {
            const component = components[identifier]
            if (isErrorDefinition(component)) continue
            const abort = cb(component)
            if (abort) break
        }
    }

    componentLoader.forEachDesignComponents = (cb: (component: DesignComponentDefinition) => void): void => {
        componentLoader.forEachComponent(component => {
            if (!isDesignDefinition(component)) return false
            cb(component)
            return true
        })
    }

    // TODO: This is actually the name, not the identifier (which is [scope]name@version).
    componentLoader.localPackageIdentifier = (): PackageIdentifier => {
        return localPackageIdentifier
    }

    componentLoader.packageDisplayName = (packageIdentifier: PackageIdentifier) => {
        const packageInfo = packages[packageIdentifier]
        return packageInfo && packageInfo.displayName
    }

    // TODO: This is currently a list of package names, not identifiers.
    componentLoader.packageIdentifiers = (): PackageIdentifier[] => {
        return visiblePackageNames
    }
}
