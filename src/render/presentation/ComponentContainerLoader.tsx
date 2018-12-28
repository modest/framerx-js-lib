import * as React from "react"

export const ComponentContainerLoader: React.SFC<any> = props => {
    if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()
    let style = loadingStyle
    let text = ""

    if (props.parentSize && props.parentSize.width > 64 && props.parentSize.height > 32) {
        if (props.error) {
            style = errorStyle
            const { error, file } = props.error
            if (error instanceof Error) {
                text = error.name + " in " + props.error.file + ": " + error.message
            } else {
                text = "Error in " + file + ": " + error
            }
        } else {
            text = "Loading Component…"
        }
    }

    return <div style={style}>{text}</div>
}

const errorStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "11px",
    lineHeight: "16px",
    color: "rgb(255, 0, 85)",
    textOverflow: "ellipsis",
    backgroundColor: "rgba(255, 0, 85, .1)",
}

const loadingStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: "11px",
    lineHeight: "16px",
    color: "#8855FF",
    background: "rgba(137, 87, 255, 0.1)",
    border: "1px solid rgb(136, 85, 255)",
    textOverflow: "ellipsis",
}
