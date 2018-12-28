import { Device, DeviceDescriptor, DeviceSkins, DeviceHands } from "./Device"

interface CreateFramerDeviceOptions {
    selector: string
    kind?: string
    screenWidth: number
    screenHeight: number
    pixelRatio?: number
    bezelWidth?: number
    bezelHeight?: number
    canRotate?: boolean
    hands?: DeviceHands
    skins?: DeviceSkins
    svgScreenMask?: string
}

const categoryName = "Framer Bezel"
const iPhoneHands: DeviceHands = {
    "Hand 1": { package: "@framer/framer.device-hand-iphone-1" },
    "Hand 2": { package: "@framer/framer.device-hand-iphone-2" },
}

const createDevice = (options: CreateFramerDeviceOptions): typeof Device => {
    const compoundDescriptor = {
        title: `${categoryName} ${options.selector}`,
        category: categoryName,
        selector: options.selector,
        kind: options.kind === undefined ? "phone" : options.kind,
        screen: { width: options.screenWidth, height: options.screenHeight },
        pixelRatio: options.pixelRatio || 2,
        canRotate: options.canRotate === undefined ? true : options.canRotate,
        skins: options.skins || {},
        hands: options.hands || {},
    }

    return class extends Device {
        static descriptor: DeviceDescriptor = compoundDescriptor

        get svgScreenMask(): string | undefined {
            return options.svgScreenMask || super.svgScreenMask
        }
    }
}

// Watches
/** @internal */
export const FramerAppleWatch38 = createDevice({
    selector: "Apple Watch 38mm",
    kind: "watch",
    screenWidth: 272,
    screenHeight: 340,
    bezelWidth: 25,
    bezelHeight: 50,
    canRotate: false,
    skins: {
        "Space Black Steel - Black": { package: "@framer/framer.device-skin-apple-watch-38mm-black-steel" },
        Edition: { package: "@framer/framer.device-skin-apple-watch-38mm-edition" },
        "Rose Gold Aluminum - Midnight Blue": {
            package: "@framer/framer.device-skin-apple-watch-38mm-rose-gold-aluminum-midnight-blue",
        },
        "Silver Aluminum - Cocoa": { package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-cocoa" },
        "Silver Aluminum - Concrete": {
            package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-concrete",
        },
        "Silver Aluminum - Ocean Blue": {
            package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-ocean-blue",
        },
        "Silver Aluminum - Red": { package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-red" },
        "Silver Aluminum - Turquoise": {
            package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-turquoise",
        },
        "Silver Aluminum - White": { package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-white" },
        "Silver Aluminum - Yellow": { package: "@framer/framer.device-skin-apple-watch-38mm-silver-aluminum-yellow" },
        "Space Gray Aluminum - Black": {
            package: "@framer/framer.device-skin-apple-watch-38mm-space-gray-aluminum-black",
        },
        "Steel - White": { package: "@framer/framer.device-skin-apple-watch-38mm-steel-white" },
        "Nike Plus - Silver Aluminum - Flat Silver Volt": {
            package: "@framer/framer.device-skin-apple-watch-38mm-nike-plus-silver-aluminum-flat-silver-volt",
        },
        "Nike Plus - Silver Aluminum - Flat Silver White": {
            package: "@framer/framer.device-skin-apple-watch-38mm-nike-plus-silver-aluminum-flat-silver-white",
        },
        "Nike Plus - Space Gray Aluminum - Black Cool Gray": {
            package: "@framer/framer.device-skin-apple-watch-38mm-nike-plus-space-gray-aluminum-black-cool-gray",
        },
        "Nike Plus - Space Gray Aluminum - Black Volt": {
            package: "@framer/framer.device-skin-apple-watch-38mm-nike-plus-space-gray-aluminum-black-volt",
        },
    },
})
/** @internal */
export const FramerAppleWatch42 = createDevice({
    selector: "Apple Watch 42mm",
    kind: "watch",
    screenWidth: 312,
    screenHeight: 390,
    bezelWidth: 25,
    bezelHeight: 50,
    canRotate: false,
    skins: {
        Edition: { package: "@framer/framer.device-skin-apple-watch-42mm-edition" },
        "Gold Aluminum - Cocoa": { package: "@framer/framer.device-skin-apple-watch-42mm-gold-aluminum" },
        "Rose Gold Aluminum - Midnight Blue": {
            package: "@framer/framer.device-skin-apple-watch-42mm-rose-gold-aluminum-midnight-blue",
        },
        "Silver Aluminum - Concrete": {
            package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-concrete",
        },
        "Silver Aluminum - Green": { package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-green" },
        "Silver Aluminum - Light Pink": {
            package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-light-pink",
        },
        "Silver Aluminum - Ocean Blue": {
            package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-ocean-blue",
        },
        "Silver Aluminum - Pink Sand": {
            package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-pink-sand",
        },
        "Silver Aluminum - Red": { package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-red" },
        "Silver Aluminum - Turquoise": {
            package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-turquoise",
        },
        "Silver Aluminum - White": { package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-white" },
        "Silver Aluminum - Yellow": { package: "@framer/framer.device-skin-apple-watch-42mm-silver-aluminum-yellow" },
        "Space Black - Steel Black": { package: "@framer/framer.device-skin-apple-watch-42mm-space-black-steel-black" },
        "Space Gray - Aluminum Black": {
            package: "@framer/framer.device-skin-apple-watch-42mm-space-gray-aluminum-black",
        },
        "Steel - White": { package: "@framer/framer.device-skin-apple-watch-42mm-steel-white" },
        "Nike Plus - Silver Aluminum - Flat Silver Volt": {
            package: "@framer/framer.device-skin-apple-watch-42mm-nike-plus-silver-aluminum-flat-silver-volt",
        },
        "Nike Plus - Silver Aluminum - Flat Silver White": {
            package: "@framer/framer.device-skin-apple-watch-42mm-nike-plus-silver-aluminum-flat-silver-white",
        },
        "Nike Plus - Space Gray Aluminum - Black Cool Gray": {
            package: "@framer/framer.device-skin-apple-watch-42mm-nike-plus-space-gray-aluminum-black-cool-gray",
        },
        "Nike Plus - Space Gray Aluminum - Black Volt": {
            package: "@framer/framer.device-skin-apple-watch-42mm-nike-plus-space-gray-aluminum-black-volt",
        },
    },
})
/** @internal */
export const FramerSonySmartWatch = createDevice({
    selector: "Sony SmartWatch 3",
    kind: "watch",
    screenWidth: 320,
    screenHeight: 320,
    pixelRatio: 1.5,
    canRotate: false,
    skins: {
        White: { package: "@framer/framer.device-skin-sony-smartwatch-3-white" },
        Black: { package: "@framer/framer.device-skin-sony-smartwatch-3-black" },
    },
})

// Phones
/** @internal */
export const FramerAppleIPhoneSE = createDevice({
    selector: "Apple iPhone SE",
    screenWidth: 640,
    screenHeight: 1136,
    canRotate: true,
    skins: {
        Gold: { package: "@framer/framer.device-skin-apple-iphone-se-gold" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone-se-silver" },
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone-se-space-gray" },
        "Rose Gold": { package: "@framer/framer.device-skin-apple-iphone-se-rose-gold" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 2098, height: 3269 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 2098, height: 3269 },
    },
})
/** @internal */
export const FramerAppleIPhone8 = createDevice({
    selector: "Apple iPhone 8",
    screenWidth: 750,
    screenHeight: 1334,
    skins: {
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone8-space-gray" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone8-silver" },
        Gold: { package: "@framer/framer.device-skin-apple-iphone8-gold" },
    },
    hands: iPhoneHands,
})
/** @internal */
export const FramerAppleIPhone8Plus = createDevice({
    selector: "Apple iPhone 8 Plus",
    screenWidth: 1242,
    screenHeight: 2208,
    pixelRatio: 3,
    skins: {
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone8-plus-space-gray" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone8-plus-silver" },
        Gold: { package: "@framer/framer.device-skin-apple-iphone8-plus-gold" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3949, height: 6154, offset: -15 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3949, height: 6154, offset: -15 },
    },
})
/** @internal */
export const FramerAppleIPhoneX = createDevice({
    selector: "Apple iPhone X",
    screenWidth: 1125,
    screenHeight: 2436,
    pixelRatio: 3,
    skins: {
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone-x-space-gray" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone-x-silver" },
    },
    svgScreenMask:
        "<path d='M 876 26 L 876 27 C 876 54.794 854.794 90 806 90 L 320 90 C 271.206 90 250 54.794 250 27 L 250 26 C 250 13.145 250 0 227 0 L 130 0 C 48.935 0 0 48.935 0 130 L 0 2306 C 0 2387.065 48.935 2436 130 2436 L 995 2436 C 1076.065 2436 1125 2387.065 1125 2306 L 1125 130 C 1125 48.935 1076.065 0 995 0 L 899 0 C 876 0 876 13.145 876 26 Z' fill='#000'></path>",
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3567, height: 5558, offset: -15 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3567, height: 5558, offset: -15 },
    },
})
/** @internal */
export const FramerAppleIPhoneXS = createDevice({
    selector: "Apple iPhone XS",
    screenWidth: 1125,
    screenHeight: 2436,
    pixelRatio: 3,
    skins: {
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone-xs-spacegrey" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone-xs-silver" },
        Gold: { package: "@framer/framer.device-skin-apple-iphone-xs-gold" },
    },
    svgScreenMask:
        "<path fill='#000000' d='M876,26 L876,27 C876,54.7939392 854.793939,90 806,90 L320,90 C271.206061,90 250,54.7939392 250,27 L250,25.9999936 C250,13.1450152 249.999996,1.42108547e-14 227.000025,0 L130,0 C48.934969,0 0,48.934969 0,130 L0,2306 C0,2387.06503 48.934969,2436 130,2436 L995,2436 C1076.06503,2436 1125,2387.06503 1125,2306 L1125,130 C1125,48.934969 1076.06503,0 995,0 L899,0 C876,0 876,13.1450195 876,26 Z'/>",
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3567, height: 5558, offset: -15 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3567, height: 5558, offset: -15 },
    },
})
/** @internal */
export const FramerAppleIPhoneXR = createDevice({
    selector: "Apple iPhone XR",
    screenWidth: 828,
    screenHeight: 1792,
    pixelRatio: 2,
    skins: {
        Blue: { package: "@framer/framer.device-skin-apple-iphone-xr-blue" },
        Coral: { package: "@framer/framer.device-skin-apple-iphone-xr-coral" },
        Red: { package: "@framer/framer.device-skin-apple-iphone-xr-red" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone-xr-silver" },
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone-xr-spacegrey" },
        Yellow: { package: "@framer/framer.device-skin-apple-iphone-xr-yellow" },
    },
    svgScreenMask:
        "<path fill='#000' d='M171,5.68434189e-14 C178.179702,5.68434189e-14 184,5.82029825 184,13 C184.671387,25.1625977 187.04912,32.8738094 190.811884,39.9095654 C195.256715,48.2206766 201.779323,54.7432852 210.090435,59.1881161 C218.401546,63.6329469 227.73588,66 243.926397,66 L584.073603,66 C600.26412,66 609.598454,63.6329469 617.909565,59.1881161 C626.220677,54.7432852 632.743285,48.2206766 637.188116,39.9095654 C640.95016,32.8751542 643.243408,25.0819092 644,13 C644,5.82029825 649.820298,5.68434189e-14 657,5.68434189e-14 L721.598764,0 C758.596792,5.68434189e-14 772.013171,3.85226286 785.539097,11.0860072 C799.065023,18.3197516 809.680248,28.9349774 816.913993,42.4609033 C824.147737,55.9868292 828,69.4032081 828,106.401236 L828,1685.59876 C828,1722.59679 824.147737,1736.01317 816.913993,1749.5391 C809.680248,1763.06502 799.065023,1773.68025 785.539097,1780.91399 C772.013171,1788.14774 758.596792,1792 721.598764,1792 L106.401236,1792 C69.4032081,1792 55.9868292,1788.14774 42.4609033,1780.91399 C28.9349774,1773.68025 18.3197516,1763.06502 11.0860072,1749.5391 C3.85226286,1736.01317 0,1722.59679 0,1685.59876 L0,106.401236 C0,69.4032081 3.85226286,55.9868292 11.0860072,42.4609033 C18.3197516,28.9349774 28.9349774,18.3197516 42.4609033,11.0860072 C55.9868292,3.85226286 69.4032081,5.68434189e-14 106.401236,5.68434189e-14 L171,5.68434189e-14 Z'/>",
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 2708, height: 4220, offset: -15 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 2708, height: 4220, offset: -15 },
    },
})
/** @internal */
export const FramerAppleIPhoneXSMax = createDevice({
    selector: "Apple iPhone XS Max",
    screenWidth: 1242,
    screenHeight: 2688,
    pixelRatio: 3,
    skins: {
        "Space Gray": { package: "@framer/framer.device-skin-apple-iphone-xs-max-spacegrey" },
        Silver: { package: "@framer/framer.device-skin-apple-iphone-xs-max-silver" },
        Gold: { package: "@framer/framer.device-skin-apple-iphone-xs-max-gold" },
    },
    svgScreenMask:
        "<path fill='#000000' d='M288,0 C297.941125,0 305.72957,8.05894469 306,18 C306.542114,37.9282227 309.576285,48.4396546 314.815379,58.2359082 C320.567513,68.9914638 329.008536,77.4324867 339.764092,83.1846208 C350.519647,88.9367548 362.090097,92 386.098193,92 L855.901807,92 C879.909903,92 891.480353,88.9367548 902.235908,83.1846208 C912.991464,77.4324867 921.432487,68.9914638 927.184621,58.2359082 C932.426286,48.434846 935.425964,37.958374 936,18 C936.285921,8.05895296 944.058875,0 954,0 L1092.01272,6.0596658e-15 C1144.16656,-3.52084034e-15 1163.07881,5.43029825 1182.14547,15.6272632 C1201.21214,25.8242281 1216.17577,40.7878597 1226.37274,59.8545263 C1236.5697,78.921193 1242,97.8334379 1242,149.987284 L1242,2538.01272 C1242,2590.16656 1236.5697,2609.07881 1226.37274,2628.14547 C1216.17577,2647.21214 1201.21214,2662.17577 1182.14547,2672.37274 C1163.07881,2682.5697 1144.16656,2688 1092.01272,2688 L149.987284,2688 C97.8334379,2688 78.921193,2682.5697 59.8545263,2672.37274 C40.7878597,2662.17577 25.8242281,2647.21214 15.6272632,2628.14547 C5.43029825,2609.07881 -5.4496192e-14,2590.16656 -6.08831961e-14,2538.01272 L4.0397772e-15,149.987284 C-2.34722689e-15,97.8334379 5.43029825,78.921193 15.6272632,59.8545263 C25.8242281,40.7878597 40.7878597,25.8242281 59.8545263,15.6272632 C78.921193,5.43029825 97.8334379,3.52084034e-15 149.987284,-6.0596658e-15 L288,-4.28410666e-15 Z'/>",
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3949, height: 6154, offset: -15 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3949, height: 6154, offset: -15 },
    },
})
/** @internal */
export const FramerGoogleNexus4 = createDevice({
    selector: "Google Nexus 4",
    screenWidth: 768,
    screenHeight: 1280,
    skins: {
        Phone: { package: "@framer/framer.device-skin-google-nexus-4" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 2362, height: 3681, offset: -52 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 2362, height: 3681, offset: -52 },
    },
})
/** @internal */
export const FramerGoogleNexus5X = createDevice({
    selector: "Google Nexus 5X",
    screenWidth: 1080,
    screenHeight: 1920,
    pixelRatio: 3,
    skins: {
        Phone: { package: "@framer/framer.device-skin-google-nexus-5x" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3292, height: 5130, offset: 8 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3292, height: 5130, offset: 8 },
    },
})
/** @internal */
export const FramerGoogleNexus6 = createDevice({
    selector: "Google Nexus 6",
    screenWidth: 1440,
    screenHeight: 2560,
    pixelRatio: 3.5,
    skins: {
        Phone: { package: "@framer/framer.device-skin-google-nexus-6p" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4304, height: 6707, offset: 8 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4304, height: 6707, offset: 8 },
    },
})
/** @internal */
export const FramerGooglePixel2 = createDevice({
    selector: "Google Pixel 2",
    screenWidth: 1080,
    screenHeight: 1920,
    pixelRatio: 2.627,
    skins: {
        "Clearly White": { package: "@framer/framer.device-skin-google-pixel-2-clearly-white" },
        "Just Black": { package: "@framer/framer.device-skin-google-pixel-2-just-black" },
        "Kinda Blue": { package: "@framer/framer.device-skin-google-pixel-2-kinda-blue" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3316, height: 5167 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3316, height: 5167 },
    },
})
/** @internal */
export const FramerGooglePixel2XL = createDevice({
    selector: "Google Pixel 2 XL",
    screenWidth: 1440,
    screenHeight: 2880,
    pixelRatio: 4,
    svgScreenMask:
        "<path d='M 0 84 C 0 37.608 37.608 0 84 0 L 1356 0 C 1402.392 0 1440 37.608 1440 84 L 1440 2796 C 1440 2842.392 1402.392 2880 1356 2880 L 84 2880 C 37.608 2880 0 2842.392 0 2796 Z' fill='#000'></path>",
    skins: {
        "Black and White": { package: "@framer/framer.device-skin-google-pixel-2-xl-black-and-white" },
        "Just Black": { package: "@framer/framer.device-skin-google-pixel-2-xl-just-black" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4530, height: 7059 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4530, height: 7059 },
    },
})
/** @internal */
export const FramerGooglePixel3 = createDevice({
    selector: "Google Pixel 3",
    screenWidth: 1080,
    screenHeight: 2160,
    pixelRatio: 2.627,
    svgScreenMask: "<rect width='1080' height='2160' fill='#000000' rx='45'/>",
    skins: {
        "Clearly White": { package: "@framer/framer.device-skin-google-pixel-3-clearlywhite" },
        "Just Black": { package: "@framer/framer.device-skin-google-pixel-3-justblack" },
        "Not Pink": { package: "@framer/framer.device-skin-google-pixel-3-notpink" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3316, height: 5167 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3316, height: 5167 },
    },
})
/** @internal */
export const FramerGooglePixel3XL = createDevice({
    selector: "Google Pixel 3XL",
    screenWidth: 1440,
    screenHeight: 2960,
    pixelRatio: 3.5,
    svgScreenMask:
        "<path fill='#000000' d='M108,2.31946634e-07 L409.011687,1.55059141e-06 C439.939632,1.61701389e-06 465.011686,25.0720554 465.011686,56.000001 C465.011686,56.0002891 465.011686,56.0005772 465.011686,56.0008653 C465.011487,68.8875673 465.011388,78.9499079 465.011388,86.1878871 C465.011388,112.694005 475.444384,126.121845 486.431948,139.121281 C497.419513,152.120716 524.145044,170.83411 558.848058,170.83411 C665.879469,170.83411 865.259791,170.83411 879.942291,170.83411 C903.258059,170.83411 932.491466,162.064769 949.852489,143.266488 C967.213512,124.468207 976.173524,106.310104 976.173524,84.0828788 C976.173524,73.7219195 976.173524,63.3609603 976.173524,53.000001 L976.173524,53.000001 C976.173524,23.7289093 999.902432,1.06170877e-06 1029.17352,9.98686559e-07 L1331.02038,1.42108547e-14 C1391.21942,-1.2961176e-07 1440.02038,48.800962 1440.02038,109 L1440.02038,2905.00059 C1440.02038,2935.37625 1415.39605,2960.00059 1385.02038,2960.00059 L58,2960.00059 C25.9674845,2960.00059 3.92285176e-15,2934.0331 0,2902.00059 L-2.31946629e-07,108 C-2.31946636e-07,48.353247 48.3532468,1.09569308e-14 108,0 Z'/>",
    skins: {
        "Clearly White": { package: "@framer/framer.device-skin-google-pixel-3xl-clearlywhite" },
        "Just Black": { package: "@framer/framer.device-skin-google-pixel-3xl-justblack" },
        "Not Pink": { package: "@framer/framer.device-skin-google-pixel-3xl-notpink" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4530, height: 7059 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4530, height: 7059 },
    },
})
/** @internal */
export const FramerHTCOneA9 = createDevice({
    selector: "HTC One A9",
    screenWidth: 1080,
    screenHeight: 1920,
    pixelRatio: 3,
    skins: {
        Black: { package: "@framer/framer.device-skin-htc-one-a9-black" },
        White: { package: "@framer/framer.device-skin-htc-one-a9-white" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 3436, height: 5354 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 3436, height: 5354 },
    },
})
/** @internal */
export const FramerMicrosoftLumia950 = createDevice({
    selector: "Microsoft Lumia 950",
    screenWidth: 1440,
    screenHeight: 2560,
    pixelRatio: 4,
    skins: {
        Black: { package: "@framer/framer.device-skin-microsoft-lumia-950-black" },
        White: { package: "@framer/framer.device-skin-microsoft-lumia-950-white" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4494, height: 7003, offset: -84 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4494, height: 7003, offset: -84 },
    },
})
/** @internal */
export const FramerSamsungNote5 = createDevice({
    selector: "Samsung Note 5",
    screenWidth: 1440,
    screenHeight: 2560,
    pixelRatio: 4,
    skins: {
        Black: { package: "@framer/framer.device-skin-samsung-note-5-black" },
        Gold: { package: "@framer/framer.device-skin-samsung-note-5-gold" },
        Pink: { package: "@framer/framer.device-skin-samsung-note-5-pink" },
        "Silver Titanium": { package: "@framer/framer.device-skin-samsung-note-5-silver-titanium" },
        White: { package: "@framer/framer.device-skin-samsung-note-5-white" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4279, height: 6668, offset: -84 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4279, height: 6668, offset: -84 },
    },
})
/** @internal */
export const FramerSamsungGalaxyS8 = createDevice({
    selector: "Samsung Galaxy S8",
    screenWidth: 1440,
    screenHeight: 2960,
    pixelRatio: 4,
    svgScreenMask:
        "<path d='M 125 0 C 53.755 0 0 62.755 0 134 L 0 2826 C 0 2897.245 53.755 2960 125 2960 L 1315 2960 C 1386.245 2960 1440 2897.245 1440 2826 L 1440 134 C 1440 62.755 1386.245 0 1315 0 Z' fill='#000'></path>",
    skins: {
        "Artic Silver": { package: "@framer/framer.device-skin-samsung-s8-artic-silver" },
        "Coral Blue": { package: "@framer/framer.device-skin-samsung-s8-coral-blue" },
        "Maple Gold": { package: "@framer/framer.device-skin-samsung-s8-maple-gold" },
        "Midnight Black": { package: "@framer/framer.device-skin-samsung-s8-midnight-black" },
        "Orchid Gray": { package: "@framer/framer.device-skin-samsung-s8-orchid-gray" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4210, height: 6560 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4210, height: 6560 },
    },
})
/** @internal */
export const FramerSamsungGalaxyS9 = createDevice({
    selector: "Samsung Galaxy S9",
    screenWidth: 1440,
    screenHeight: 2960,
    pixelRatio: 4,
    svgScreenMask:
        "<path fill='#000000' d='M125.020384,0 C53.7756513,0 0.0203840029,62.7552673 0.0203840029,134 L0.0203840029,2826 C0.0203840029,2897.24473 53.7756513,2960 125.020384,2960 L1315.02038,2960 C1386.26512,2960 1440.02038,2897.24473 1440.02038,2826 L1440.02038,134 C1440.02038,62.7552673 1386.26512,0 1315.02038,0 L125.020384,0 Z'/>",
    skins: {
        "Burgundy Red": { package: "@framer/framer.device-skin-samsung-galaxy-s9-burgundyred" },
        "Coral Blue": { package: "@framer/framer.device-skin-samsung-galaxy-s9-coralblue" },
        "Lilac Purple": { package: "@framer/framer.device-skin-samsung-galaxy-s9-lilacpurple" },
        "Midnight Black": { package: "@framer/framer.device-skin-samsung-galaxy-s9-midnightblack" },
        "Sunrise Gold": { package: "@framer/framer.device-skin-samsung-galaxy-s9-sunrisegold" },
        "Titanium Gray": { package: "@framer/framer.device-skin-samsung-galaxy-s9-titaniumgray" },
    },
    hands: {
        "Hand 1": { package: "@framer/framer.device-hand-iphone-1", width: 4210, height: 6560 },
        "Hand 2": { package: "@framer/framer.device-hand-iphone-2", width: 4210, height: 6560 },
    },
})

// Tablets
/** @internal */
export const FramerAppleIPadAir = createDevice({
    selector: "Apple iPad Air",
    kind: "tablet",
    screenWidth: 1536,
    screenHeight: 2048,
    skins: {
        Gold: { package: "@framer/framer.device-skin-apple-ipad-air-gold" },
        Silver: { package: "@framer/framer.device-skin-apple-ipad-air-silver" },
        "Space Gray": { package: "@framer/framer.device-skin-apple-ipad-air-space-gray" },
    },
})
/** @internal */
export const FramerAppleIPadMini = createDevice({
    selector: "Apple iPad Mini",
    kind: "tablet",
    screenWidth: 1536,
    screenHeight: 2048,
    skins: {
        Gold: { package: "@framer/framer.device-skin-apple-ipad-mini-gold" },
        Silver: { package: "@framer/framer.device-skin-apple-ipad-mini-silver" },
        "Space Gray": { package: "@framer/framer.device-skin-apple-ipad-mini-space-gray" },
    },
})
/** @internal */
export const FramerAppleIPadPro = createDevice({
    selector: "Apple iPad Pro",
    kind: "tablet",
    screenWidth: 2048,
    screenHeight: 2732,
    skins: {
        Gold: { package: "@framer/framer.device-skin-apple-ipad-pro-gold" },
        Silver: { package: "@framer/framer.device-skin-apple-ipad-pro-silver" },
        "Space Gray": { package: "@framer/framer.device-skin-apple-ipad-pro-space-gray" },
    },
})
/** @internal */
export const FramerGoogleNexusTablet = createDevice({
    selector: "Google Nexus Tablet",
    kind: "tablet",
    screenWidth: 1536,
    screenHeight: 2048,
    skins: {
        Tablet: { package: "@framer/framer.device-skin-google-nexus-9" },
    },
})
/** @internal */
export const FramerMicrosoftSurfacePro3 = createDevice({
    selector: "Microsoft Surface Pro 3",
    kind: "tablet",
    screenWidth: 2160,
    screenHeight: 1440,
    pixelRatio: 1.5,
    skins: {
        Surface: { package: "@framer/framer.device-skin-microsoft-surface-pro-3" },
    },
})
/** @internal */
export const FramerMicrosoftSurfacePro4 = createDevice({
    selector: "Microsoft Surface Pro 4",
    kind: "tablet",
    screenWidth: 2736,
    screenHeight: 1824,
    skins: {
        Surface: { package: "@framer/framer.device-skin-microsoft-surface-pro-4" },
    },
})

// Computers
/** @internal */
export const FramerAppleIMac = createDevice({
    selector: "Apple iMac",
    kind: "computer",
    screenWidth: 5120,
    screenHeight: 2880,
    canRotate: false,
    skins: {
        iMac: { package: "@framer/framer.device-skin-apple-imac" },
    },
})
/** @internal */
export const FramerAppleThunderboltDisplay = createDevice({
    selector: "Apple Thunderbolt Display",
    kind: "computer",
    screenWidth: 2560,
    screenHeight: 1440,
    pixelRatio: 1,
    canRotate: false,
    skins: {
        Display: { package: "@framer/framer.device-skin-apple-thunderbolt-display" },
    },
})
/** @internal */
export const FramerAppleMacBook = createDevice({
    selector: "Apple MacBook",
    kind: "computer",
    screenWidth: 2304,
    screenHeight: 1440,
    canRotate: false,
    skins: {
        MacBook: { package: "@framer/framer.device-skin-apple-macbook" },
    },
})
/** @internal */
export const FramerAppleMacBookAir = createDevice({
    selector: "Apple MacBook Air",
    kind: "computer",
    screenWidth: 1440,
    screenHeight: 900,
    pixelRatio: 1,
    canRotate: false,
    skins: {
        "MacBook Air": { package: "@framer/framer.device-skin-apple-macbook-air" },
    },
})
/** @internal */
export const FramerAppleMacBookPro = createDevice({
    selector: "Apple MacBook Pro",
    kind: "computer",
    screenWidth: 2880,
    screenHeight: 1800,
    canRotate: false,
    skins: {
        "MacBook Pro": { package: "@framer/framer.device-skin-apple-macbook-pro" },
    },
})
/** @internal */
export const FramerDellXPS = createDevice({
    selector: "Dell XPS",
    kind: "computer",
    screenWidth: 3840,
    screenHeight: 2160,
    canRotate: false,
    skins: {
        Display: { package: "@framer/framer.device-skin-dell-xps" },
    },
})
/** @internal */
export const FramerMicrosoftSurfaceBook = createDevice({
    selector: "Microsoft Surface Book",
    kind: "computer",
    screenWidth: 3000,
    screenHeight: 2000,
    canRotate: false,
    skins: {
        "Surface Book": { package: "@framer/framer.device-skin-microsoft-surface-book" },
    },
})

// TV
/** @internal */
export const FramerSonyW850C = createDevice({
    selector: "Sony W850C",
    kind: "tv",
    screenWidth: 1280,
    screenHeight: 720,
    pixelRatio: 1,
    canRotate: false,
    skins: {
        TV: { package: "@framer/framer.device-skin-sony-w850c" },
    },
})

// Store
/** @internal */
export const FramerStoreArtwork = createDevice({
    selector: "Artwork",
    kind: "store",
    screenWidth: 800,
    screenHeight: 600,
    pixelRatio: 1,
    canRotate: false,
    skins: {},
})
/** @internal */
export const FramerStoreIcon = createDevice({
    selector: "Icon",
    kind: "store",
    screenWidth: 50,
    screenHeight: 50,
    pixelRatio: 1,
    canRotate: false,
    skins: {},
})
