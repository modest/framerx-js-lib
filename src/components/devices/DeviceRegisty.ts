import { Device } from "./Device"
import { componentLoader, ComponentDefinition, ComponentIdentifier } from "../../render/componentLoader"

/**
 * @internal
 */
export type DevicesData = {
    devices: { [key: string]: ComponentDefinition }
    deviceSkins: { [key: string]: ComponentDefinition }
}

/**
 * @internal
 */
export class DeviceRegistry {
    resolve(identifier: string): typeof Device | undefined {
        const component = componentLoader.componentForIdentifier(identifier)
        if (!component || component.type !== "device") {
            return undefined
        }
        return component.class as typeof Device
    }

    list(): DevicesData {
        const devices = {}
        const deviceSkins = {}
        const componentIdentifiers = componentLoader.componentIdentifiers()
        componentIdentifiers.map((identifier: ComponentIdentifier) => {
            const component = componentLoader.componentForIdentifier(identifier)
            if (component && component.type === "device") {
                devices[component.identifier] = (component.class as typeof Device).descriptor
                if (component) {
                    if (component.type === "device") {
                        devices[component.identifier] = (component.class as typeof Device).descriptor
                    } else if (component.type === "device-skin") {
                        deviceSkins[component.identifier] = (component.class as typeof Device).descriptor
                    }
                }
            }
        })
        return { devices, deviceSkins }
    }
}
