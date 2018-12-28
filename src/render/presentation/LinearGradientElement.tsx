import * as React from "react"
import { LinearGradientElementProperties } from "../utils/elementPropertiesForLinearGradient"

export class LinearGradientElement extends React.Component<LinearGradientElementProperties, {}> {
    render() {
        return (
            <linearGradient id={this.props.id} gradientTransform={`rotate(${this.props.angle}, 0.5, 0.5)`}>
                <stop offset="0" stopColor={this.props.startColor} stopOpacity={this.props.startAlpha} />
                <stop offset="1" stopColor={this.props.stopColor} stopOpacity={this.props.stopAlpha} />
            </linearGradient>
        )
    }
}
