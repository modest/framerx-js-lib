import { Map, OrderedMap } from "immutable"

// These types don’t do anything except make the code more readable
type Family = string
type Member = string
type Selector = string
type Weight = number | undefined
type Font = { selector: Selector; weight: Weight }

type Members = OrderedMap<Member, Font>
type Typefaces = OrderedMap<Family, Members>

// Parentheses for (slightly) improved readability only
type TypefaceDescriptors = ([Family, ([Member, Selector, Weight])[]])[]

function convertToOrderedMap(descriptors: TypefaceDescriptors): Typefaces {
    return OrderedMap<Family, Members>(
        descriptors.map(descriptor => [
            descriptor[0],
            OrderedMap<Member, Selector>(
                descriptor[1].map(member => [
                    member[0],
                    {
                        selector: member[1],
                        weight: member[2],
                    },
                ])
            ),
        ])
    )
}

const safeFonts: TypefaceDescriptors = [
    [
        "Arial",
        [
            ["Regular", "Arial", undefined],
            ["Black", "Arial-Black", undefined],
            ["Narrow", "Arial Narrow", undefined],
            ["Rounded Bold", "Arial Rounded MT Bold", undefined],
        ],
    ],
    [
        "Avenir",
        [
            ["Book", "Avenir", undefined],
            ["Light", "Avenir-Light", undefined],
            ["Medium", "Avenir-Medium", undefined],
            ["Heavy", "Avenir-Heavy", undefined],
            ["Black", "Avenir-Black", undefined],
        ],
    ],
    [
        "Avenir Next",
        [
            ["Regular", "Avenir Next", undefined],
            ["Ultra Light", "AvenirNext-UltraLight", undefined],
            ["Medium", "AvenirNext-Medium", undefined],
            ["Demi Bold", "AvenirNext-DemiBold", undefined],
            ["Heavy", "AvenirNext-Heavy", undefined],
        ],
    ],
    [
        "Avenir Next Condensed",
        [
            ["Regular", "Avenir Next Condensed", undefined],
            ["Ultra Light", "AvenirNextCondensed-UltraLight", undefined],
            ["Medium", "AvenirNextCondensed-Medium", undefined],
            ["Demi Bold", "AvenirNextCondensed-DemiBold", undefined],
            ["Heavy", "AvenirNextCondensed-Heavy", undefined],
        ],
    ],
    ["Baskerville", [["Regular", "Baskerville", undefined], ["Semi Bold", "Baskerville-SemiBold", undefined]]],
    [
        "Bodoni 72",
        [
            ["Book", "Bodoni 72", undefined],
            ["Oldstyle", "Bodoni 72 Oldstyle", undefined],
            ["Smallcaps", "Bodoni 72 Smallcaps", undefined],
        ],
    ],
    ["Courier", [["Regular", "Courier", undefined]]],
    ["Courier New", [["Regular", "Courier New", undefined]]],
    [
        "Futura",
        [
            ["Medium", "Futura", undefined],
            ["Condensed", "Futura-CondensedMedium", undefined],
            ["Condensed ExtraBold", "Futura-CondensedExtraBold", undefined],
        ],
    ],
    ["Georgia", [["Regular", "Georgia", undefined]]],
    [
        "Gill Sans",
        [
            ["Regular", "Gill Sans", undefined],
            ["Light", "GillSans-Light", undefined],
            ["SemiBold", "GillSans-SemiBold", undefined],
            ["UltraBold", "GillSans-UltraBold", undefined],
        ],
    ],
    ["Helvetica", [["Regular", "Helvetica", undefined], ["Light", "Helvetica-Light", undefined]]],
    [
        "Helvetica Neue",
        [
            ["Regular", "Helvetica Neue", undefined],
            ["UltraLight", "HelveticaNeue-UltraLight", undefined],
            ["Thin", "HelveticaNeue-Thin", undefined],
            ["Light", "HelveticaNeue-Light", undefined],
            ["Medium", "HelveticaNeue-Medium", undefined],
            ["Condensed Bold", "HelveticaNeue-CondensedBold", undefined],
            ["Condensed Black", "HelveticaNeue-CondensedBlack", undefined],
        ],
    ],
    ["Hoefler Text", [["Regular", "Hoefler Text", undefined]]],
    ["Impact", [["Regular", "Impact", undefined]]],
    ["Lucida Grande", [["Regular", "Lucida Grande", undefined]]],
    ["Menlo", [["Regular", "Menlo", undefined]]],
    ["Monaco", [["Regular", "Monaco", undefined]]],
    ["Optima", [["Regular", "Optima", undefined], ["ExtraBlack", "Optima-ExtraBlack", undefined]]],
    ["Palatino", [["Regular", "Palatino", undefined]]],
    [
        "SF Compact Display",
        [
            ["Regular", "SFCompactDisplay-Regular|.SFCompactDisplay-Regular", undefined],
            ["Ultralight", "SFCompactDisplay-Ultralight|.SFCompactDisplay-Ultralight", undefined],
            ["Thin", "SFCompactDisplay-Thin|.SFCompactDisplay-Thin", undefined],
            ["Light", "SFCompactDisplay-Light|.SFCompactDisplay-Light", undefined],
            ["Medium", "SFCompactDisplay-Medium|.SFCompactDisplay-Medium", undefined],
            ["Semibold", "SFCompactDisplay-Semibold|.SFCompactDisplay-Semibold", undefined],
            ["Heavy", "SFCompactDisplay-Heavy|.SFCompactDisplay-Heavy", undefined],
            ["Black", ".SFCompactDisplay-Black", undefined],
        ],
    ],
    [
        "SF Compact Rounded",
        [
            ["Regular", "SFCompactRounded-Regular|.SFCompactRounded-Regular", undefined],
            ["Ultralight", "SFCompactRounded-Ultralight|.SFCompactRounded-Ultralight", undefined],
            ["Thin", "SFCompactRounded-Thin|.SFCompactRounded-Thin", undefined],
            ["Light", "SFCompactRounded-Light|.SFCompactRounded-Light", undefined],
            ["Medium", "SFCompactRounded-Medium|.SFCompactRounded-Medium", undefined],
            ["Semibold", "SFCompactRounded-Semibold|.SFCompactRounded-Semibold", undefined],
            ["Heavy", "SFCompactRounded-Heavy|.SFCompactRounded-Heavy", undefined],
            ["Black", ".SFCompactRounded-Black", undefined],
        ],
    ],
    [
        "SF Compact Text",
        [
            ["Regular", "SFCompactText-Regular|.SFCompactText-Regular", undefined],
            ["Light", "SFCompactText-Light|.SFCompactText-Light", undefined],
            ["Medium", "SFCompactText-Medium|.SFCompactText-Medium", undefined],
            ["Semibold", "SFCompactText-Semibold|.SFCompactText-Semibold", undefined],
            ["Heavy", ".SFCompactText-Heavy", undefined],
        ],
    ],
    [
        "SF UI Display",
        [
            ["Regular", ".SFNSDisplay|SFUIDisplay-Regular|.SFUIDisplay", undefined],
            ["Ultralight", ".SFNSDisplay-Ultralight|SFUIDisplay-Ultralight|.SFUIDisplay-Ultralight", undefined],
            ["Thin", ".SFNSDisplay-Thin|SFUIDisplay-Thin|.SFUIDisplay-Thin", undefined],
            ["Light", ".SFNSDisplay-Light|SFUIDisplay-Light|.SFUIDisplay-Light", undefined],
            ["Medium", ".SFNSDisplay-Medium|SFUIDisplay-Medium|.SFUIDisplay-Medium", undefined],
            ["Semibold", ".SFNSDisplay-Semibold|SFUIDisplay-Semibold|.SFUIDisplay-Semibold", undefined],
            ["Heavy", ".SFNSDisplay-Heavy|SFUIDisplay-Heavy|.SFUIDisplay-Heavy", undefined],
            ["Black", ".SFNSDisplay-Black|.SFUIDisplay-Black", undefined],
        ],
    ],
    [
        "SF UI Display Condensed",
        [
            [
                "Regular",
                ".SFNSDisplayCondensed-Regular|SFUIDisplayCondensed-Regular|.SFUIDisplayCondensed-Regular",
                undefined,
            ],
            [
                "Ultralight",
                ".SFNSDisplayCondensed-Ultralight|SFUIDisplayCondensed-Ultralight|.SFUIDisplayCondensed-Ultralight",
                undefined,
            ],
            ["Thin", ".SFNSDisplayCondensed-Thin|SFUIDisplayCondensed-Thin|.SFUIDisplayCondensed-Thin", undefined],
            ["Light", ".SFNSDisplayCondensed-Light|SFUIDisplayCondensed-Light|.SFUIDisplayCondensed-Light", undefined],
            [
                "Medium",
                ".SFNSDisplayCondensed-Medium|SFUIDisplayCondensed-Medium|.SFUIDisplayCondensed-Medium",
                undefined,
            ],
            [
                "Semibold",
                ".SFNSDisplayCondensed-Semibold|SFUIDisplayCondensed-Semibold|.SFUIDisplayCondensed-Semibold",
                undefined,
            ],
            ["Heavy", ".SFNSDisplayCondensed-Heavy|SFUIDisplayCondensed-Heavy|.SFUIDisplayCondensed-Heavy", undefined],
            ["Black", ".SFNSDisplayCondensed-Black|.SFUIDisplayCondensed-Black", undefined],
        ],
    ],
    [
        "SF UI Text",
        [
            ["Regular", ".SFNSText|SFUIText-Regular|.SFUIText", undefined],
            ["Light", ".SFNSText-Light|SFUIText-Light|.SFUIText-Light", undefined],
            ["Medium", ".SFNSText-Medium|SFUIText-Medium|.SFUIText-Medium", undefined],
            ["Semibold", ".SFNSText-Semibold|SFUIText-Semibold|.SFUIText-Semibold", undefined],
            ["Heavy", ".SFNSText-Heavy|.SFUIText-Heavy", undefined],
        ],
    ],
    [
        "SF UI Text Condensed",
        [
            ["Regular", ".SFNSTextCondensed-Regular|SFUITextCondensed-Regular|.SFUITextCondensed-Regular", undefined],
            ["Light", ".SFNSTextCondensed-Light|SFUITextCondensed-Light|.SFUITextCondensed-Light", undefined],
            ["Medium", ".SFNSTextCondensed-Medium|SFUITextCondensed-Medium|.SFUITextCondensed-Medium", undefined],
            [
                "Semibold",
                ".SFNSTextCondensed-Semibold|SFUITextCondensed-Semibold|.SFUITextCondensed-Semibold",
                undefined,
            ],
            ["Heavy", ".SFNSTextCondensed-Heavy|.SFUITextCondensed-Heavy", undefined],
        ],
    ],
    ["Tahoma", [["Regular", "Tahoma", undefined]]],
    ["Times", [["Regular", "Times", undefined]]],
    ["Times New Roman", [["Regular", "Times New Roman", undefined]]],
    ["Trebuchet", [["Regular", "Trebuchet MS", undefined]]],
    ["Verdana", [["Regular", "Verdana", undefined]]],
]

export const typefaceAliases = {
    "__SF-Compact-Display-Regular__": "SFCompactDisplay-Regular|.SFCompactDisplay-Regular",
    "__SF-Compact-Display-Ultralight__": "SFCompactDisplay-Ultralight|.SFCompactDisplay-Ultralight",
    "__SF-Compact-Display-Thin__": "SFCompactDisplay-Thin|.SFCompactDisplay-Thin",
    "__SF-Compact-Display-Light__": "SFCompactDisplay-Light|.SFCompactDisplay-Light",
    "__SF-Compact-Display-Medium__": "SFCompactDisplay-Medium|.SFCompactDisplay-Medium",
    "__SF-Compact-Display-Semibold__": "SFCompactDisplay-Semibold|.SFCompactDisplay-Semibold",
    "__SF-Compact-Display-Heavy__": "SFCompactDisplay-Heavy|.SFCompactDisplay-Heavy",
    "__SF-Compact-Display-Black__": "SFCompactDisplay-Black|.SFCompactDisplay-Black",
    "__SF-Compact-Display-Bold__": "SFCompactDisplay-Bold|.SFCompactDisplay-Bold",

    "__SF-UI-Text-Regular__": ".SFNSText|SFProText-Regular|SFUIText-Regular|.SFUIText",
    "__SF-UI-Text-Light__": ".SFNSText-Light|SFProText-Light|SFUIText-Light|.SFUIText-Light",
    "__SF-UI-Text-Medium__": ".SFNSText-Medium|SFProText-Medium|SFUIText-Medium|.SFUIText-Medium",
    "__SF-UI-Text-Semibold__": ".SFNSText-Semibold|SFProText-Semibold|SFUIText-Semibold|.SFUIText-Semibold",
    "__SF-UI-Text-Bold__": ".SFNSText-Bold|SFProText-Bold|SFUIText-Bold|.SFUIText-Bold",
    "__SF-UI-Text-Heavy__": ".SFNSText-Heavy|SFProText-Heavy|.SFUIText-Heavy",
    "__SF-UI-Text-Italic__": ".SFNSText-Italic||SFProText-Italic|SFUIText-Italic|.SFUIText-Italic",
    "__SF-UI-Text-Light-Italic__":
        ".SFNSText-LightItalic|SFProText-LightItalic|SFUIText-LightItalic|.SFUIText-LightItalic",
    "__SF-UI-Text-Medium-Italic__":
        ".SFNSText-MediumItalic|SFProText-MediumItalic|SFUIText-MediumItalic|.SFUIText-MediumItalic",
    "__SF-UI-Text-Semibold-Italic__":
        ".SFNSText-SemiboldItalic|SFProText-SemiboldItalic|SFUIText-SemiboldItalic|.SFUIText-SemiboldItalic",
    "__SF-UI-Text-Bold-Italic__": ".SFNSText-BoldItalic|SFProText-BoldItalic|SFUIText-BoldItalic|.SFUIText-BoldItalic",
    "__SF-UI-Text-Heavy-Italic__": ".SFNSText-HeavyItalic|SFProText-HeavyItalic|.SFUIText-HeavyItalic",

    "__SF-Compact-Text-Regular__": "SFCompactText-Regular|.SFCompactText-Regular",
    "__SF-Compact-Text-Light__": "SFCompactText-Light|.SFCompactText-Light",
    "__SF-Compact-Text-Medium__": "SFCompactText-Medium|.SFCompactText-Medium",
    "__SF-Compact-Text-Semibold__": "SFCompactText-Semibold|.SFCompactText-Semibold",
    "__SF-Compact-Text-Bold__": "SFCompactText-Bold|.SFCompactText-Bold",
    "__SF-Compact-Text-Heavy__": "SFCompactText-Heavy|.SFCompactText-Heavy",
    "__SF-Compact-Text-Italic__": "SFCompactText-Italic|.SFCompactText-Italic",
    "__SF-Compact-Text-Light-Italic__": "SFCompactText-LightItalic|.SFCompactText-LightItalic",
    "__SF-Compact-Text-Medium-Italic__": "SFCompactText-MediumItalic|.SFCompactText-MediumItalic",
    "__SF-Compact-Text-Semibold-Italic__": "SFCompactText-SemiboldItalic|.SFCompactText-SemiboldItalic",
    "__SF-Compact-Text-Bold-Italic__": "SFCompactText-BoldItalic|.SFCompactText-BoldItalic",
    "__SF-Compact-Text-Heavy-Italic__": "SFCompactText-HeavyItalic|.SFCompactText-HeavyItalic",

    "__SF-UI-Display-Condensed-Regular__":
        ".SFNSDisplayCondensed-Regular|SFUIDisplayCondensed-Regular|.SFUIDisplayCondensed-Regular",
    "__SF-UI-Display-Condensed-Ultralight__":
        ".SFNSDisplayCondensed-Ultralight|SFUIDisplayCondensed-Ultralight|.SFUIDisplayCondensed-Ultralight",
    "__SF-UI-Display-Condensed-Thin__":
        ".SFNSDisplayCondensed-Thin|SFUIDisplayCondensed-Thin|.SFUIDisplayCondensed-Thin",
    "__SF-UI-Display-Condensed-Light__":
        ".SFNSDisplayCondensed-Light|SFUIDisplayCondensed-Light|.SFUIDisplayCondensed-Light",
    "__SF-UI-Display-Condensed-Medium__":
        ".SFNSDisplayCondensed-Medium|SFUIDisplayCondensed-Medium|.SFUIDisplayCondensed-Medium",
    "__SF-UI-Display-Condensed-Semibold__":
        ".SFNSDisplayCondensed-Semibold|SFUIDisplayCondensed-Semibold|.SFUIDisplayCondensed-Semibold",
    "__SF-UI-Display-Condensed-Bold__":
        ".SFNSDisplayCondensed-Bold|SFUIDisplayCondensed-Bold|.SFUIDisplayCondensed-Bold",
    "__SF-UI-Display-Condensed-Heavy__":
        ".SFNSDisplayCondensed-Heavy|SFUIDisplayCondensed-Heavy|.SFUIDisplayCondensed-Heavy",
    "__SF-UI-Display-Condensed-Black__": ".SFNSDisplayCondensed-Black|.SFUIDisplayCondensed-Black",

    "__SF-UI-Display-Regular__": ".SFNSDisplay|SFProDisplay-Regular|SFUIDisplay-Regular|.SFUIDisplay",
    "__SF-UI-Display-Ultralight__":
        ".SFNSDisplay-Ultralight|SFProDisplay-Ultralight|SFUIDisplay-Ultralight|.SFUIDisplay-Ultralight",
    "__SF-UI-Display-Thin__": ".SFNSDisplay-Thin|SFProDisplay-Thin|SFUIDisplay-Thin|.SFUIDisplay-Thin",
    "__SF-UI-Display-Light__": ".SFNSDisplay-Light|SFProDisplay-Light|SFUIDisplay-Light|.SFUIDisplay-Light",
    "__SF-UI-Display-Medium__": ".SFNSDisplay-Medium|SFProDisplay-Medium|SFUIDisplay-Medium|.SFUIDisplay-Medium",
    "__SF-UI-Display-Semibold__":
        ".SFNSDisplay-Semibold|SFProDisplay-Semibold|SFUIDisplay-Semibold|.SFUIDisplay-Semibold",
    "__SF-UI-Display-Bold__": ".SFNSDisplay-Bold|SFProDisplay-Bold|SFUIDisplay-Bold|.SFUIDisplay-Bold",
    "__SF-UI-Display-Heavy__": ".SFNSDisplay-Heavy|SFProDisplay-Heavy|SFUIDisplay-Heavy|.SFUIDisplay-Heavy",
    "__SF-UI-Display-Black__": ".SFNSDisplay-Black|SFProDisplay-Black|.SFUIDisplay-Black",
    "__SF-UI-Display-Italic__": ".SFNSDisplay-Italic|SFProDisplay-Italic|SFUIDisplay-Italic",
    "__SF-UI-Display-Ultralight-Italic__":
        ".SFNSDisplay-UltralightItalic|SFProDisplay-UltralightItalic|SFUIDisplay-UltralightItalic|.SFUIDisplay-UltralightItalic",
    "__SF-UI-Display-Thin-Italic__":
        ".SFNSDisplay-ThinItalic|SFProDisplay-ThinItalic|SFUIDisplay-ThinItalic|.SFUIDisplay-ThinItalic",
    "__SF-UI-Display-Light-Italic__":
        ".SFNSDisplay-LightItalic|SFProDisplay-LightItalic|SFUIDisplay-LightItalic|.SFUIDisplay-LightItalic",
    "__SF-UI-Display-Medium-Italic__":
        ".SFNSDisplay-MediumItalic|SFProDisplay-MediumItalic|SFUIDisplay-MediumItalic|.SFUIDisplay-MediumItalic",
    "__SF-UI-Display-Semibold-Italic__":
        ".SFNSDisplay-SemiboldItalic|SFProDisplay-SemiboldItalic|SFUIDisplay-SemiboldItalic|.SFUIDisplay-SemiboldItalic",
    "__SF-UI-Display-Bold-Italic__":
        ".SFNSDisplay-BoldItalic|SFProDisplay-BoldItalic|SFUIDisplay-BoldItalic|.SFUIDisplay-BoldItalic",
    "__SF-UI-Display-Heavy-Italic__":
        ".SFNSDisplay-HeavyItalic|SFProDisplay-HeavyItalic|SFUIDisplay-HeavyItalic|.SFUIDisplay-HeavyItalic",
    "__SF-UI-Display-Black-Italic__": ".SFNSDisplay-BlackItalic|SFProDisplay-BlackItalic|.SFUIDisplay-BlackItalic",

    "__SF-UI-Text-Condensed-Regular__":
        ".SFNSTextCondensed-Regular|SFUITextCondensed-Regular|.SFUITextCondensed-Regular",
    "__SF-UI-Text-Condensed-Light__": ".SFNSTextCondensed-Light|SFUITextCondensed-Light|.SFUITextCondensed-Light",
    "__SF-UI-Text-Condensed-Medium__": ".SFNSTextCondensed-Medium|SFUITextCondensed-Medium|.SFUITextCondensed-Medium",
    "__SF-UI-Text-Condensed-Semibold__":
        ".SFNSTextCondensed-Semibold|SFUITextCondensed-Semibold|.SFUITextCondensed-Semibold",
    "__SF-UI-Text-Condensed-Bold__": ".SFNSTextCondensed-Bold|SFUITextCondensed-Bold|.SFUITextCondensed-Bold",
    "__SF-UI-Text-Condensed-Heavy__": ".SFNSTextCondensed-Heavy|.SFUITextCondensed-Heavy",

    "__SF-Compact-Rounded-Regular__": "SFCompactRounded-Regular|.SFCompactRounded-Regular",
    "__SF-Compact-Rounded-Ultralight__": "SFCompactRounded-Ultralight|.SFCompactRounded-Ultralight",
    "__SF-Compact-Rounded-Thin__": "SFCompactRounded-Thin|.SFCompactRounded-Thin",
    "__SF-Compact-Rounded-Light__": "SFCompactRounded-Light|.SFCompactRounded-Light",
    "__SF-Compact-Rounded-Medium__": "SFCompactRounded-Medium|.SFCompactRounded-Medium",
    "__SF-Compact-Rounded-Semibold__": "SFCompactRounded-Semibold|.SFCompactRounded-Semibold",
    "__SF-Compact-Rounded-Bold__": "SFCompactRounded-Bold|.SFCompactRounded-Bold",
    "__SF-Compact-Rounded-Heavy__": "SFCompactRounded-Heavy|.SFCompactRounded-Heavy",
    "__SF-Compact-Rounded-Black__": "SFCompactRounded-Black|.SFCompactRounded-Black",
}

export const typefaces = convertToOrderedMap(
    typeof window !== "undefined" && window["SystemTypefaceDescriptors"] !== undefined
        ? window["SystemTypefaceDescriptors"]
        : safeFonts
)

export const defaultFontDescriptor =
    typeof window !== "undefined" && window["SystemTypefaceDefaultDescriptor"] !== undefined
        ? window["SystemTypefaceDefaultDescriptor"]
        : typefaces.get("SF UI Text").get("Regular")

export const fontSelectors = Map<Selector, [Family, Member, Weight]>(
    typefaces.flatMap((members: Members, family: string) => {
        return Map(
            members
                .map((font: Font, member: Selector) => {
                    return [font.selector, [family, member, font.weight]]
                })
                .toArray()
        )
    })
)
