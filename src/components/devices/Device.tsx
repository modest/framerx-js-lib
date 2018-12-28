import * as React from "react"

import { DeviceRegistry } from "./DeviceRegisty"
import { Size } from "../../render/types/Size"
import { Animatable, AnimatableObject } from "../../animation/Animatable"
import { componentLoader } from "../../render/componentLoader"
import { getURLs } from "../../render/utils/getURLs"
import { DeviceRenderer, DeviceRendererProperties } from "./DeviceRenderer"
import { DeviceSkins, DeviceSkin } from "./DeviceSkin"
import { DeviceHands, DeviceHand } from "./DeviceHand"
import { isWithPackage, WithPackage } from "./WithPackage"

export * from "./DeviceSkin"
export * from "./DeviceHand"

const FramerLocalScheme = "framer-local://"

/**
 * @internal
 */
export interface DeviceProperties {
    parentSize: null | AnimatableObject<Size>
    deviceSize: Size
    contentSize: Size
    skin?: string
    hand?: string
    zoom: number
    responsive: boolean
    rotate?: boolean
    background?: string

    onRequirePackage: (pakkage: string, displayName: string) => void
    /**
     * @internal
     */
    renderer: typeof DeviceRenderer
}

/**
 * @internal
 */
export interface DeviceDescriptor {
    title: string // Should contain full title
    category?: string
    selector?: string // Optional, should contain short moniker
    kind?: string
    skins: DeviceSkins
    hands: DeviceHands

    screen: Size
    pixelRatio?: number
    canRotate?: boolean
}

/**
 * @internal
 */
export class Device extends React.Component<Partial<DeviceProperties>> {
    /**
     * @internal
     */
    static defaultProps: DeviceProperties = {
        parentSize: null,
        deviceSize: Size.zero,
        contentSize: Size.zero,
        zoom: -1,
        responsive: false,

        onRequirePackage: () => {},
        renderer: DeviceRenderer,
    }
    /**
     * @internal
     */
    static registry = new DeviceRegistry()
    /**
     * @internal
     */
    static descriptor: DeviceDescriptor = {
        title: "Device Base Class",
        screen: Size.zero,
        pixelRatio: 1,
        skins: {},
        hands: {},
    }

    /**
     * @internal
     */
    get descriptor(): DeviceDescriptor {
        return (this.constructor as any).descriptor
    }

    /**
     * @internal
     */
    get skins(): DeviceSkins {
        return this.descriptor.skins
    }

    /**
     * @internal
     */
    get hands(): DeviceHands {
        return this.descriptor.hands
    }

    /**
     * @internal
     */
    get svgScreenMask(): string | undefined {
        return undefined
    }

    /**
     * @internal
     */
    get properties(): DeviceProperties {
        return this.props as DeviceProperties
    }

    /**
     * @internal
     */
    componentDidMount() {
        this.computeRequiredPackages()
    }

    /**
     * @internal
     */
    componentDidUpdate(prevProps: DeviceProperties) {
        this.computeRequiredPackages()
    }

    /**
     * @internal
     */
    computeRequiredPackages() {
        if (!this.props.onRequirePackage) {
            return
        }
        const { skin, hand } = this.props

        if (skin) {
            const skinOrPackage = this.skins[skin]
            if (isWithPackage(skinOrPackage)) {
                this.props.onRequirePackage(skinOrPackage.package, skin)
            }
        }

        if (hand) {
            const handOrPackage = this.hands[hand]
            if (isWithPackage(handOrPackage)) {
                this.props.onRequirePackage(handOrPackage.package, hand)
            }
        }
    }

    /**
     * @internal
     */
    render() {
        const { width, height } = this.props.parentSize
            ? {
                  width: Animatable.getNumber(this.props.parentSize.width),
                  height: Animatable.getNumber(this.props.parentSize.height),
              }
            : this.properties.deviceSize

        const rendererProps: DeviceRendererProperties = {
            skin: this.getSkin(),
            hand: this.getHand(),
            device: Size(width, height),
            screen: this.descriptor.screen,
            content: this.properties.contentSize,
            pixelRatio: this.descriptor.pixelRatio || 1,
            rotate: this.props.rotate || false,
            responsive: this.properties.responsive,
            svgScreenMask: this.svgScreenMask,
        }

        const deviceRenderer = React.createElement(this.properties.renderer, rendererProps, this.props.children)
        const outerStyle = this.outerStyle(rendererProps)
        let inner: JSX.Element = deviceRenderer
        if (this.props.zoom !== -1) {
            const innerStyle = this.outerStyle(rendererProps)
            innerStyle.transformOrigin = `center`
            innerStyle.transform = `scale(${this.props.zoom})`
            inner = <div style={innerStyle}>{deviceRenderer}</div>
        }

        return <div style={outerStyle}>{inner}</div>
    }

    private getSkin(): DeviceSkin | null {
        const skin = this.props.skin ? this.skins[this.props.skin] : null
        let resolvedSkin: DeviceSkin | null = null
        if (isWithPackage(skin)) {
            resolvedSkin = Device.skinOrHandFromPackage(skin)
        } else {
            resolvedSkin = skin
        }

        if (resolvedSkin) {
            const image = resolvedSkin.image
            if (image.startsWith(FramerLocalScheme)) {
                resolvedSkin.image = this.toLocalPath(image.substr(FramerLocalScheme.length))
            }
        }

        return resolvedSkin
    }

    private getHand(): DeviceHand | null {
        const hand = this.props.hand ? this.hands[this.props.hand] : null
        if (isWithPackage(hand)) {
            return Device.skinOrHandFromPackage(hand)
        } else {
            return hand
        }
    }

    private outerStyle(rendererProps: DeviceRendererProperties): React.CSSProperties {
        return {
            width: this.properties.deviceSize.width,
            height: this.properties.deviceSize.height,
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            overflow: "hidden",
            display: "block",
            position: "absolute",
            background: this.properties.background || this.properties.renderer.getBackgroundColor(rendererProps),
        }
    }

    private static skinOrHandFromPackage(withPackage: WithPackage) {
        const packageId = withPackage.package
        const components = packageId && componentLoader.componentsForPackage(packageId)
        if (components && components.length) {
            const externalSkin: any = components[0]
            const instance = new externalSkin.class()

            // Update the image path to go to the package folder:
            if ("image" in instance) {
                const { projectURL } = getURLs()
                instance.image = `${projectURL === "" ? "." : projectURL}/node_modules/${packageId}/${instance.image}`
            }

            // Apply any set overrides on the externally loaded package:
            const keys = Object.keys(withPackage)
            keys.forEach(key => {
                if (key !== "image" && key in instance) {
                    instance[key] = withPackage[key]
                }
            })
            return instance
        }
        return null
    }

    private toLocalPath(path: string): string {
        const { projectURL, imageBaseURL } = getURLs()

        let packageId: string | null = null
        componentLoader.forEachComponent(component => {
            if (component.class === this.constructor) {
                if (component.depth > 0) {
                    // Resolve only if we're external:
                    packageId = component.packageIdentifier
                }
                // Found, but as "internal", meaning we need to resolve
                // locally:
                return true
            }
            return false
        })
        if (packageId) {
            return `${projectURL === "" ? "." : projectURL}/node_modules/${packageId}/${path}`
        }

        return `${imageBaseURL}/${path}`
    }
}
