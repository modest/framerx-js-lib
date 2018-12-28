import * as React from "react"

import { DeviceSkin, DeviceHand } from "./Device"
import { Screen } from "../Screen"
import { Size } from "../../render"
import { isMobile } from "../../utils/environment"

export interface DeviceRendererProperties {
    skin: DeviceSkin | null
    hand: DeviceHand | null
    device: Size
    screen: Size
    content: Size
    pixelRatio: number
    rotate: boolean
    responsive: boolean
    svgScreenMask?: string
}

export enum DeviceRendererMode {
    Canvas,
    Screen,
    Device,
}

export class DeviceRenderer extends React.Component<DeviceRendererProperties> {
    static defaultProps: DeviceRendererProperties = {
        skin: null,
        hand: null,
        device: Size.zero,
        screen: Size.zero,
        content: Size.zero,
        pixelRatio: 1,
        rotate: false,
        responsive: false,
    }

    static getMode(props: DeviceRendererProperties): DeviceRendererMode {
        const skin = props.skin
        if (!skin) {
            if (Size.isZero(props.screen)) {
                return DeviceRendererMode.Canvas
            } else {
                return DeviceRendererMode.Screen
            }
        } // else
        return DeviceRendererMode.Device
    }

    static getBackgroundColor(props: DeviceRendererProperties): string {
        switch (DeviceRenderer.getMode(props)) {
            case DeviceRendererMode.Canvas:
                return "#fff"
            case DeviceRendererMode.Screen:
                return "none"
            case DeviceRendererMode.Device:
                return "transparent"
        }
    }

    private isViewingOnMobile = isMobile()

    // Styling
    //

    getScreenStyle(
        screen: Size,
        device: Size,
        rotate: boolean,
        scale: number,
        svgScreenMask?: string
    ): React.CSSProperties {
        const screenRect = this.calculateScreenRect(screen, device, rotate, scale)
        const dimX = rotate ? screen.height : screen.width
        const dimY = rotate ? screen.width : screen.height
        const svgMaskTransform = rotate ? `translate(0 ${dimY}) rotate(-90)` : ""
        const svgMaskImage = svgScreenMask
            ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none' width='${dimX}' height='${dimY}'><g transform='${svgMaskTransform}' x='0' y='0'>${svgScreenMask}</g></svg>")`
            : undefined
        return {
            display: this.props.children ? "block" : "none",
            position: "absolute",
            top: screenRect.top,
            left: screenRect.left,
            width: screenRect.width,
            height: screenRect.height,
            overflow: "hidden",
            borderRadius: 3,
            WebkitMaskImage: svgMaskImage,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            ...({ WebkitMaskSize: "100% 100%" } as React.CSSProperties),
        }
    }

    // Rendition
    //

    private willRenderWithScale(scale: number) {
        // FIXME: this is a horrible hack and depends on knowledge of Framer's internals
        if (window["_bridge"]) {
            window["_bridge"]("fixmeHackyNotePreviewContentScale", scale)
        }
    }

    render() {
        switch (DeviceRenderer.getMode(this.props)) {
            case DeviceRendererMode.Canvas:
                return this.renderCanvasMode()
            case DeviceRendererMode.Screen:
                return this.renderScreenOnly()
            case DeviceRendererMode.Device:
                return this.renderSkinAndScreen(this.props.skin!, this.props.hand)
        }
    }

    renderCanvasMode() {
        const { device, content, responsive } = this.props

        if (responsive) {
            // The content is resized to match the window size:
            this.willRenderWithScale(1)
            return (
                <Screen width={device.width} height={device.height} scale={1}>
                    {this.props.children}
                </Screen>
            )
        } // else

        let contentScale = 1
        const scalesDown = content.width > device.width || content.height > device.height
        const scalesUp = content.width <= device.width || content.height <= device.height
        // Scale if the content doesn't fit
        if (scalesUp || scalesDown) {
            contentScale = Math.min(device.width / content.width, device.height / content.height)
        }

        this.willRenderWithScale(contentScale)
        return (
            <div style={this.getScreenStyle(content, device, false, contentScale)}>
                <Screen width={device.width} height={device.height} scale={contentScale}>
                    {this.props.children}
                </Screen>
            </div>
        )
    }

    renderScreenOnly() {
        const { screen, rotate, device, pixelRatio, svgScreenMask } = this.props
        const scaleX = device.width / (rotate ? screen.height : screen.width)
        const scaleY = device.height / (rotate ? screen.width : screen.height)
        const scale = Math.min(scaleX, scaleY)
        const screenWidth = rotate ? screen.height : screen.width
        const screenHeight = rotate ? screen.width : screen.height

        this.willRenderWithScale(scale * pixelRatio)
        return (
            <div
                style={this.getScreenStyle(
                    screen,
                    device,
                    rotate,
                    scale,
                    this.isViewingOnMobile ? undefined : svgScreenMask
                )}
            >
                <Screen width={screenWidth / pixelRatio} height={screenHeight / pixelRatio} scale={scale * pixelRatio}>
                    {this.props.children}
                </Screen>
            </div>
        )
    }

    renderSkinAndScreen(skin: DeviceSkin, hand: DeviceHand | null) {
        const { rotate, device, pixelRatio, svgScreenMask } = this.props

        const imageRectAndScale = this.calculateSkinRectAndScreenScale(skin, device, rotate)
        const imageStyle: React.CSSProperties = {
            pointerEvents: "none",
            display: "block",
            position: "absolute",
            top: imageRectAndScale.top,
            left: imageRectAndScale.left,
            width: imageRectAndScale.width,
            height: imageRectAndScale.height,
            transform: rotate ? "rotate(-90deg)" : undefined,
        }

        const screen = Size.defaultIfZero(device.width, device.height, this.props.screen)
        const screenStyle = this.getScreenStyle(screen, device, rotate, imageRectAndScale.scale, svgScreenMask)

        const rendition: JSX.Element[] = []

        // Hand
        if (!rotate && hand !== null) {
            const width = hand.width * imageRectAndScale.scale
            const height = hand.height * imageRectAndScale.scale
            const handStyle: React.CSSProperties = {
                pointerEvents: "none",
                display: "block",
                position: "absolute",
                width,
                height,
                top: (hand.offset || 0) + (this.props.device.height - height) / 2,
                left: (this.props.device.width - width) / 2,
            }
            rendition.push(<img key="hand" src={hand.image} style={handStyle} />)
        }

        // Screen
        this.willRenderWithScale(imageRectAndScale.scale * pixelRatio)
        const screenElement = (
            <div key="screen" style={screenStyle}>
                <Screen
                    width={screen.width / pixelRatio}
                    height={screen.height / pixelRatio}
                    scale={imageRectAndScale.scale * pixelRatio}
                >
                    {this.props.children}
                </Screen>
            </div>
        )

        // Device
        const deviceElement = <img key="device" src={skin.image} style={imageStyle} />
        rendition.push(deviceElement, screenElement)

        // FIXME: this check assumed that the presence of a mask path implies the device images uses a cutout. Devices should have a specific over- and underlay instead
        // if (this.props.svgScreenMask) {
        //     // Screen first, device second:
        //     rendition.push(screenElement, deviceElement)
        // } else {
        //     // Device first, screen second:
        //     rendition.push(deviceElement, screenElement)
        // }

        return rendition
    }

    // Calculators
    //

    calculateSkinRectAndScreenScale(skin: DeviceSkin, outerSize: Size, rotate: boolean) {
        const outerWidth = outerSize.width
        const outerHeight = outerSize.height
        const { padding } = skin
        let { imageWidth, imageHeight } = skin

        if (rotate) {
            const r = imageWidth
            imageWidth = imageHeight
            imageHeight = r
        }

        const scaleX = (outerWidth - padding * 2) / imageWidth
        const scaleY = (outerHeight - padding * 2) / imageHeight
        const scale = Math.min(scaleX, scaleY)
        const width = scale * (rotate ? imageHeight : imageWidth)
        const height = scale * (rotate ? imageWidth : imageHeight)
        const left = (outerWidth - width) / 2
        const top = (outerHeight - height) / 2

        return {
            width,
            height,
            left,
            top,
            scale,
        }
    }

    calculateScreenRect(screen: Size, outerSize: Size, rotate: boolean, scale: number) {
        const screenWidth = screen.width
        const screenHeight = screen.height
        const width = scale * (rotate ? screenHeight : screenWidth)
        const height = scale * (rotate ? screenWidth : screenHeight)
        const left = (outerSize.width - width) / 2
        const top = (outerSize.height - height) / 2

        return {
            width,
            height,
            left,
            top,
        }
    }
}
