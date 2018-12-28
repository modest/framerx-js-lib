import { BackgroundProperties, collectBackgroundFromProps } from "../traits/Background"
import { RadiusProperties, collectRadiusFromProps } from "../traits/Radius"
import { FilterProperties } from "../traits/Filters"
import { BackgroundFilterProperties } from "../traits/BackdropFilters"
import { BlendingProperties, collectBlendingFromProps } from "../traits/Blending"
import { OverflowProperties, collectOverflowFromProps } from "../traits/Overflow"
import { WithOpacity, collectOpacityFromProps } from "../traits/Opacity"
import { collectFiltersFromProps } from "../"
import { collectBoxShadowsForProps } from "./shadow"
import { BoxShadowProperties } from "../traits/Shadow"
import { TextColorProperties, collectTextColorFromProps } from "../traits/TextColor"

export type VisualProperties = Partial<
    BackgroundProperties &
        RadiusProperties &
        FilterProperties &
        BackgroundFilterProperties &
        BlendingProperties &
        OverflowProperties &
        BoxShadowProperties &
        WithOpacity &
        TextColorProperties
>

export function collectVisualStyleFromProps(props: VisualProperties, style: React.CSSProperties, zoom: number) {
    collectBackgroundFromProps(props, style)
    collectRadiusFromProps(props, style)
    collectFiltersFromProps(props, style)
    collectBlendingFromProps(props, style)
    collectOverflowFromProps(props, style)
    collectOpacityFromProps(props, style)
    collectTextColorFromProps(props, style)

    const showShadows = zoom < 8
    if (showShadows) collectBoxShadowsForProps(props, style)
}
