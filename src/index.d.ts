/// <reference types="react" />
import { List } from 'immutable';
import { ListenerFn } from 'eventemitter3';
import * as React from 'react';
import { Record } from 'immutable';

/**
 * @public
 */
export declare function Animatable<Value>(value: Value | Animatable<Value>): Animatable<Value>;

/**
 * @public
 */
export declare interface Animatable<Value> extends UpdateObserver<Value> {
    get(): Value;
    set(value: Value | Animatable<Value>): void;
    set(value: Value | Animatable<Value>, transaction?: TransactionId): void;
    /* Excluded from this release type: finishTransaction */
}

/**
 * @public
 */
export declare namespace Animatable {
    /* Excluded from this release type: transaction */
    /**
     * @public
     */
    export function getNumber(value: number | Animatable<number> | null | undefined, defaultValue?: number): number;
    /**
     * @public
     */
    export function get<Value>(value: Value | Animatable<Value> | null | undefined, defaultValue: Value): Value;
    /* Excluded from this release type: objectToValues */
}

/** @public */
export declare type AnimatableObject<T> = {
    [K in keyof T]: ToAnimatableOrValue<T[K]>;
};

/**
 * Animate a value or object.
 *
 * @remarks
 * Recommended use is to use convenience functions from the `animate` namespace
 * instead of passing an animator. Only use this for low-level animation tweaking.
 *
 * @param from - The animatable value or object to start from
 * @param to - The value to animate to
 * @param animator - Animator to use.
 * @param options - Animation options
 * @public
 */
export declare function animate<Value, Options>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, animator?: AnimatorClass<Value, Options>, options?: Partial<Options & AnimationOptions<Value>>): FramerAnimation<Value, Options>;

/**
 * @public
 */
export declare namespace animate {
    export function spring<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<SpringOptions & AnimationOptions<Value>>): FramerAnimation<Value, SpringOptions>;
    export function bezier<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<BezierOptions & AnimationOptions<Value>>): FramerAnimation<Value, BezierOptions>;
    export function linear<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<EaseOptions & AnimationOptions<Value>>): FramerAnimation<Value, BezierOptions>;
    export function ease<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<EaseOptions & AnimationOptions<Value>>): FramerAnimation<Value, BezierOptions>;
    export function easeIn<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<EaseOptions & AnimationOptions<Value>>): FramerAnimation<Value, BezierOptions>;
    export function easeOut<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<EaseOptions & AnimationOptions<Value>>): FramerAnimation<Value, BezierOptions>;
    export function easeInOut<Value>(from: Animatable<Value> | AnimatableObject<Value>, to: Value, options?: Partial<EaseOptions & AnimationOptions<Value>>): FramerAnimation<Value, BezierOptions>;
}

/* Excluded from this release type: AnimationDriver */

/**
 * @public
 */
declare interface AnimationInterface {
    /* Excluded from this release type: play */
    cancel(): void;
    /* Excluded from this release type: finish */
    isFinished(): boolean;
}

declare interface AnimationOptions<Value> extends InterpolationOptions {
    /* Excluded from this release type: customInterpolation */
    /* Excluded from this release type: precalculate */
}

/* Excluded from this release type: Animator */

/**
 * @public
 */
declare interface AnimatorClass<Value, Options = any> {
    /* Excluded from this release type: __new */
}

/* Excluded from this release type: AnyInterpolation */

declare interface ArrayControlDescription<P = any, Q = any> extends BaseControlDescription<P> {
    type: ControlType.Array;
    propertyControl: FlatControlDescription<Q>;
    maxCount?: number;
    defaultValue?: any[];
}

/* Excluded from this release type: Axis */

declare type Background = Color | Gradient | BackgroundImage | string;

declare interface BackgroundFilterProperties {
    backgroundBlur: number;
}

declare interface BackgroundImage {
    src: string;
    pixelWidth?: number;
    pixelHeight?: number;
    intrinsicWidth?: number;
    intrinsicHeight?: number;
    fit?: ImageFit;
}

declare namespace BackgroundImage {
    const isImageObject: (image: any) => image is object & BackgroundImage;
}

declare interface BackgroundProperties {
    background: Animatable<Background> | Background | null;
}

declare interface BaseControlDescription<P = any> {
    title?: string;
    hidden?: (props: P) => boolean;
}

declare enum Bezier {
    Linear = "linear",
    Ease = "ease",
    EaseIn = "ease-in",
    EaseOut = "ease-out",
    EaseInOut = "ease-in-out"
}

/* Excluded from this release type: BezierAnimator */

declare interface BezierOptions {
    curve: Curve;
    duration: number;
}

declare type BlendingMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";

declare interface BlendingProperties {
    blendingMode: BlendingMode;
}

declare interface BooleanControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Boolean;
    defaultValue?: boolean;
    disabledTitle?: string;
    enabledTitle?: string;
}

declare type BorderStyle = "solid" | "dashed" | "dotted" | "double";

declare interface BoxShadow {
    inset: boolean;
    color: string;
    x: number;
    y: number;
    blur: number;
    spread: number;
}

declare namespace BoxShadow {
    function is(shadow: any): shadow is BoxShadow;
    function toCSS(shadow: BoxShadow): string;
}

declare interface BoxShadowProperties {
    shadows: BoxShadow[];
}

/** @public */
export declare type Cancel = () => void;

/* Excluded from this release type: CanvasStore */

declare interface Change<Value> {
    value: Value;
    oldValue?: Value;
}

/**
 * @public
 */
export declare function Color(color: IncomingColor | Color | number, r?: number, g?: number, b?: number): Color;

/**
 * @public
 */
export declare interface Color {
    r: number;
    g: number;
    b: number;
    h: number;
    s: number;
    l: number;
    a: number;
    roundA: number;
    format: ColorFormat;
    initialValue?: string;
    isValid?: boolean;
}

/**
 * @public
 */
export declare namespace Color {
    const inspect: (color: Color, initialValue?: string | undefined) => string;
    const isColorObject: (color: any) => color is object & Color;
    const toString: (color: Color) => string;
    const toHex: (color: Color, allow3Char?: boolean) => string;
    const toHexString: (color: Color, allow3Char?: boolean) => string;
    const toRgbString: (color: Color) => string;
    const toHusl: (color: Color) => ColorHSLA;
    const toHslString: (color: Color) => string;
    const toHsv: (color: Color) => ColorHSVA;
    const toHsvString: (color: Color) => string;
    const toName: (color: Color) => string | false;
    const toHsl: (color: Color) => ColorHSLA;
    const toRgb: (color: Color) => ColorRGBA;
    const brighten: (color: Color, amount?: number) => Color;
    const lighten: (color: Color, amount?: number) => Color;
    const darken: (color: Color, amount?: number) => Color;
    const desaturate: (color: Color, amount?: number) => Color;
    const grayscale: (color: Color) => Color;
    const saturate: (color: Color, amount?: number) => Color;
    const hueRotate: (color: Color, angle: number) => Color;
    const alpha: (color: Color, a?: number) => Color;
    const transparent: (color: Color) => Color;
    const multiplyAlpha: (color: Color, a?: number) => Color;
    const interpolate: (colorA: Color, colorB: Color, model?: ColorMixModelType) => (progress: number) => Color;
    const isColorString: (colorString: string | object) => boolean;
    const mix: (colorA: Color, colorB: Color, fraction?: number, limit?: boolean, model?: ColorMixModelType) => Color | null;
    const random: (a?: number) => Color;
    const grey: (g?: number, a?: number) => Color;
    const gray: (g?: number, a?: number) => Color;
    const isColor: (color: string | Color) => boolean;
    const rgbToHsl: (r: number, g: number, b: number) => ColorHSL;
    const isValidColorProperty: (name: string, value: string) => boolean;
    const difference: (colorA: Color, colorB: Color) => number;
    const equal: (colorA: Color, colorB: Color, tolerance?: number) => boolean;
}

declare interface ColorControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Color;
    defaultValue?: string;
}

declare enum ColorFormat {
    RGB = "rgb",
    HSL = "hsl",
    HSV = "hsv",
    HEX = "hex",
    NAME = "name"
}

declare interface ColorHSL {
    h: number;
    s: number;
    l: number;
}

declare type ColorHSLA = ColorHSL & {
    a: number;
};

declare interface ColorHSV {
    h: number;
    s: number;
    v: number;
}

declare type ColorHSVA = ColorHSV & {
    a: number;
};

declare enum ColorMixModelType {
    RGB = "rgb",
    RGBA = "rgba",
    HSL = "hsl",
    HSLA = "hsla",
    HUSL = "husl"
}

declare interface ColorRGB {
    r: number;
    g: number;
    b: number;
}

declare type ColorRGBA = ColorRGB & {
    a: number;
};

declare type CompactControlsDescription<P = any> = NumberControlDescription<P> | EnumControlDescription<P>;

/* Excluded from this release type: ComponentContainer */

/* Excluded from this release type: ComponentContainerProperties */

/* Excluded from this release type: ComponentContainerProps */

/* Excluded from this release type: ComponentContainerState */

/* Excluded from this release type: ComponentDefinition */

/* Excluded from this release type: ComponentIdentifier */

declare interface ComponentInstanceDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.ComponentInstance;
}

/**
 * @ internal
 */
declare interface ComponentLoader {
    /* Excluded from this release type: packageDisplayName */
    /* Excluded from this release type: localPackageIdentifier */
    /* Excluded from this release type: packageIdentifiers */
    /* Excluded from this release type: componentsForPackage */
    /* Excluded from this release type: componentForIdentifier */
    /* Excluded from this release type: errorForIdentifier */
    /* Excluded from this release type: componentIdentifiers */
    /* Excluded from this release type: forEachDesignComponents */
    /* Excluded from this release type: forEachComponent */
}

/* Excluded from this release type: componentLoader */

/* Excluded from this release type: ComponentType */

declare type ConstraintAuto = "auto";

declare type ConstraintDimension = Animatable<number> | number | ConstraintPercentage | ConstraintAuto | ConstraintFreespaceFraction;

declare type ConstraintFreespaceFraction = string;

declare type ConstraintPercentage = string;

declare interface ConstraintProperties extends Partial<WithFractionOfFreeSpace> {
    parentSize: Size | AnimatableObject<Size> | null;
    left: Animatable<number> | number | null;
    right: Animatable<number> | number | null;
    top: Animatable<number> | number | null;
    bottom: Animatable<number> | number | null;
    centerX: ConstraintPercentage;
    centerY: ConstraintPercentage;
    width: ConstraintDimension;
    height: ConstraintDimension;
    aspectRatio: number | null;
    autoSize?: boolean;
}

declare interface ConstraintValuesBase {
    left: number | null;
    right: number | null;
    top: number | null;
    bottom: number | null;
    centerAnchorX: number;
    centerAnchorY: number;
    widthType: DimensionType;
    heightType: DimensionType;
    aspectRatio: number | null;
}

declare type ControlDescription<P = any, Q = any> = FlatControlDescription<P> | ArrayControlDescription<P, Q> | ObjectControlDescription<P, Q>;

declare type ControlPoints = [number, number, number, number];

/**
 * @public
 */
export declare const enum ControlType {
    Boolean = "boolean",
    Number = "number",
    String = "string",
    FusedNumber = "fusednumber",
    Enum = "enum",
    SegmentedEnum = "segmentedenum",
    Color = "color",
    Image = "image",
    File = "file",
    ComponentInstance = "componentinstance",
    Array = "array",
    Object = "object"
}

/* Excluded from this release type: ConvertColor */

declare interface CoreFrameProps extends FrameProperties, LayerProps {
}

/* Excluded from this release type: createDesignComponent */

declare type Curve = ControlPoints | Bezier;

declare type CustomPageEffect = (info: PageEffectInfo) => Partial<FrameProperties>;

declare interface DampingDurationSpringOptions {
    dampingRatio: number;
    duration: number;
    velocity: number;
    mass: number;
}

/**
 * @public
 */
export declare function Data<T extends object = object>(initial?: Partial<T> | object): T;

/**
 * @public
 */
export declare namespace Data {
    /* Excluded from this release type: _stores */
    /* Excluded from this release type: addData */
    /* Excluded from this release type: addObserver */
}

/* Excluded from this release type: DataObserver */

/* Excluded from this release type: DesignComponentDefinition */

/* Excluded from this release type: Device */

/* Excluded from this release type: DeviceDescriptor */

/* Excluded from this release type: DeviceHand */

/* Excluded from this release type: DeviceHands */

/* Excluded from this release type: DeviceProperties */

/* Excluded from this release type: DeviceRegistry */

/* Excluded from this release type: DevicesData */

/* Excluded from this release type: DeviceSkin */

/* Excluded from this release type: DeviceSkins */

declare enum DimensionType {
    FixedNumber = 0,
    Percentage = 1,
    /* Excluded from this release type: Auto */
    FractionOfFreeSpace = 3
}

declare type DragEventHandler<Draggable> = (event: FramerEvent, draggable: Draggable) => void;

declare interface DragEvents<Draggable> {
    onMove: (point: Point, draggable: Draggable) => void;
    /* Excluded from this release type: onDragDirectionLockStart */
    onDragAnimationStart: (animation: {
        x: AnimationInterface;
        y: AnimationInterface;
    }, draggable: Draggable) => void;
    onDragAnimationEnd: (animation: {
        x: AnimationInterface;
        y: AnimationInterface;
    }, draggable: Draggable) => void;
    onDragSessionStart: DragEventHandler<Draggable>;
    onDragSessionMove: DragEventHandler<Draggable>;
    onDragSessionEnd: DragEventHandler<Draggable>;
    onDragStart: DragEventHandler<Draggable>;
    onDragWillMove: DragEventHandler<Draggable>;
    onDragDidMove: DragEventHandler<Draggable>;
    onDragEnd: DragEventHandler<Draggable>;
}

/** @public */
export declare const Draggable: React.ComponentClass<Partial<FrameProps> & Partial<DraggableProps<typeof Frame>>>;

declare interface DraggableProps<Draggable> extends DraggableSpecificProps<Draggable> {
    enabled: boolean;
}

declare interface DraggableSpecificProps<Draggable> extends Partial<DragEvents<Draggable>> {
    momentum: boolean;
    momentumOptions: {
        friction: number;
        tolerance: number;
    };
    momentumVelocityMultiplier: number;
    speedX: number;
    speedY: number;
    bounce: boolean;
    bounceOptions: {
        friction: number;
        tension: number;
        tolerance: number;
    };
    directionLock: boolean;
    directionLockThreshold: {
        x: number;
        y: number;
    };
    overdrag: boolean;
    overdragScale: number;
    pixelAlign: boolean;
    velocityTimeout: number;
    velocityScale: number;
    horizontal: boolean;
    vertical: boolean;
    constraints: Partial<Rect>;
    mouseWheel: boolean;
}

declare type DraggableType = typeof Frame;

/* Excluded from this release type: DriverClass */

declare type EaseOptions = Omit<BezierOptions, "curve">;

declare interface EnumControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Enum;
    defaultValue?: string;
    options: string[];
    optionTitles?: string[] | ((props: P | null) => string[]);
}

/* Excluded from this release type: ErrorDefinition */

declare type EventDispatcher = ((type: string, event: FramerEvent, target: EventTarget) => void);

declare class EventEmitter<EventName> {
    private _emitter;
    eventNames(): string[];
    eventListeners(): {
        [index: string]: ListenerFn[];
    };
    on(eventName: EventName, fn: Function): void;
    off(eventName: EventName, fn: Function): void;
    once(eventName: EventName, fn: Function): void;
    unique(eventName: EventName, fn: Function): void;
    addEventListener(eventName: EventName, fn: Function, once: boolean, unique: boolean, context: Object): void;
    removeEventListeners(eventName?: EventName, fn?: Function): void;
    removeAllEventListeners(): void;
    countEventListeners(eventName?: EventName, handler?: Function): number;
    emit(eventName: EventName, ...args: any[]): void;
}

declare type EventHandler = (event: FramerEvent) => void;

/* Excluded from this release type: ExternalDeviceHand */

/* Excluded from this release type: ExternalDeviceSkin */

declare interface FileControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.File;
    allowedFileTypes: string[];
}

declare interface FillProperties {
    fill: Animatable<Background> | Background | null;
}

declare interface FilterNumberProperties {
    brightness: number;
    contrast: number;
    grayscale: number;
    hueRotate: number;
    invert: number;
    saturate: number;
    sepia: number;
    blur: number;
}

declare interface FilterProperties extends FilterNumberProperties {
    dropShadows: Shadow[];
}

/**
 * @public
 */
declare type FinishFunction = (transaction: TransactionId) => void;

declare type FlatControlDescription<P = any> = CompactControlsDescription<P> | BooleanControlDescription<P> | StringControlDescription<P> | ColorControlDescription<P> | FusedNumberControlDescription<P> | SegmentedEnumControlDescription<P> | ImageControlDescription<P> | FileControlDescription<P> | ComponentInstanceDescription<P>;

/** @public */
export declare const Frame: React.ComponentClass<Partial<FrameProps>>;

/** @public */
export declare interface FrameProperties extends ConstraintProperties, TransformProperties, VisualProperties {
    visible: boolean;
    name?: string;
    backfaceVisible?: boolean | Animatable<boolean>;
    perspective?: number | Animatable<number>;
    preserve3d?: boolean | Animatable<boolean>;
    borderWidth: number | Partial<{
        top: number;
        bottom: number;
        left: number;
        right: number;
    }>;
    borderColor: string;
    borderStyle: BorderStyle;
    style?: React.CSSProperties;
    className?: string;
    /* Excluded from this release type: _overrideForwardingDescription */
}

/** @public */
export declare type FrameProps = CoreFrameProps & WithEventsProperties;

/**
 * This could be called just Animation, but it's type would clash with
 * javascript's native Animation: https://developer.mozilla.org/en-US/docs/Web/API/Animation
 * So if you forget the import, you would get weird errors.
 *
 * Also, this class follows the native Animation as much as possible.
 * @public
 */
export declare class FramerAnimation<Value, AnimatorOptions> {
    /* Excluded from this release type: driver */
    /* Excluded from this release type: __constructor */
    /* Excluded from this release type: driverCallbackHandler */
    /* Excluded from this release type: playStateSource */
    /* Excluded from this release type: playStateValue */
    /* Excluded from this release type: playState */
    /* Excluded from this release type: onfinish */
    /* Excluded from this release type: oncancel */
    /* Excluded from this release type: readyPromise */
    /* Excluded from this release type: readyResolve */
    /* Excluded from this release type: resetReadyPromise */
    /**
     * @public
     */
    readonly ready: Promise<void>;
    /* Excluded from this release type: finishedPromise */
    /* Excluded from this release type: finishedResolve */
    /* Excluded from this release type: finishedReject */
    /* Excluded from this release type: resetFinishedPromise */
    /**
     * @public
     */
    readonly finished: Promise<void>;
    /* Excluded from this release type: play */
    /**
     * @public
     */
    cancel(): void;
    /* Excluded from this release type: finish */
    /* Excluded from this release type: isFinished */
}

declare type FramerAnimationState = "idle" | "running" | "finished";

/* Excluded from this release type: FramerAppleIMac */

/* Excluded from this release type: FramerAppleIPadAir */

/* Excluded from this release type: FramerAppleIPadMini */

/* Excluded from this release type: FramerAppleIPadPro */

/* Excluded from this release type: FramerAppleIPhone8 */

/* Excluded from this release type: FramerAppleIPhone8Plus */

/* Excluded from this release type: FramerAppleIPhoneSE */

/* Excluded from this release type: FramerAppleIPhoneX */

/* Excluded from this release type: FramerAppleIPhoneXR */

/* Excluded from this release type: FramerAppleIPhoneXS */

/* Excluded from this release type: FramerAppleIPhoneXSMax */

/* Excluded from this release type: FramerAppleMacBook */

/* Excluded from this release type: FramerAppleMacBookAir */

/* Excluded from this release type: FramerAppleMacBookPro */

/* Excluded from this release type: FramerAppleThunderboltDisplay */

/* Excluded from this release type: FramerAppleWatch38 */

/* Excluded from this release type: FramerAppleWatch42 */

/* Excluded from this release type: FramerDellXPS */

/**
 * @public
 */
export declare class FramerEvent {
    /* Excluded from this release type: originalEvent */
    /* Excluded from this release type: session */
    /* Excluded from this release type: time */
    /* Excluded from this release type: loopTime */
    /* Excluded from this release type: point */
    /* Excluded from this release type: devicePoint */
    /* Excluded from this release type: target */
    /* Excluded from this release type: delta */
    /* Excluded from this release type: __constructor */
    private static eventLikeFromOriginalEvent;
    /* Excluded from this release type: velocity */
    /* Excluded from this release type: offset */
    /* Excluded from this release type: isLeftMouseClick */
}

/* Excluded from this release type: FramerEventListener */

/* Excluded from this release type: FramerEventSession */

/* Excluded from this release type: FramerGoogleNexus4 */

/* Excluded from this release type: FramerGoogleNexus5X */

/* Excluded from this release type: FramerGoogleNexus6 */

/* Excluded from this release type: FramerGoogleNexusTablet */

/* Excluded from this release type: FramerGooglePixel2 */

/* Excluded from this release type: FramerGooglePixel2XL */

/* Excluded from this release type: FramerGooglePixel3 */

/* Excluded from this release type: FramerGooglePixel3XL */

/* Excluded from this release type: FramerHTCOneA9 */

/* Excluded from this release type: FramerMicrosoftLumia950 */

/* Excluded from this release type: FramerMicrosoftSurfaceBook */

/* Excluded from this release type: FramerMicrosoftSurfacePro3 */

/* Excluded from this release type: FramerMicrosoftSurfacePro4 */

/* Excluded from this release type: FramerSamsungGalaxyS8 */

/* Excluded from this release type: FramerSamsungGalaxyS9 */

/* Excluded from this release type: FramerSamsungNote5 */

/* Excluded from this release type: FramerSonySmartWatch */

/* Excluded from this release type: FramerSonyW850C */

/* Excluded from this release type: FramerStoreArtwork */

/* Excluded from this release type: FramerStoreIcon */

declare interface FusedNumberControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.FusedNumber;
    defaultValue?: number;
    toggleKey: keyof P;
    toggleTitles: [string, string];
    valueKeys: [keyof P, keyof P, keyof P, keyof P];
    valueLabels: [string, string, string, string];
    min?: number;
}

/* Excluded from this release type: GestureHandler */

/* Excluded from this release type: getURLs */

/**
 * @public
 */
declare type Gradient = LinearGradient | RadialGradient;

/** @public */
declare interface IdentityProps extends React.Props<any> {
    id?: string;
}

declare interface ImageControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Image;
}

declare type ImageFit = "fill" | "fit" | "stretch";

declare type IncomingColor = ColorRGB | ColorHSL | ColorRGBA | ColorHSLA | string;

/**
 * @public
 */
declare interface Interpolation<Value = any> {
    /* Excluded from this release type: interpolate */
    /* Excluded from this release type: difference */
}

/**
 * @public
 */
declare namespace Interpolation {
    /* Excluded from this release type: handleUndefined */
}

declare interface InterpolationOptions {
    colorModel: ColorMixModelType;
}

/* Excluded from this release type: Interpolator */

/* Excluded from this release type: isOverride */

/* Excluded from this release type: isReactDefinition */

/* Excluded from this release type: JSONArray */

/* Excluded from this release type: JSONData */

/* Excluded from this release type: JSONObject */

/**
 * @public
 */
declare class Layer<P extends Partial<LayerProps>, S> extends React.Component<P, S> {
    static readonly defaultProps: LayerProps;
    static applyWillChange<P extends Partial<LayerProps>>(layer: React.Component<P>, style: React.CSSProperties): void;
    /* Excluded from this release type: shouldComponentUpdate */
    /* Excluded from this release type: properties */
    private previousZoom;
    /* Excluded from this release type: componentDidUpdate */
    /* Excluded from this release type: resetSetStyle */
}

/** @public */
declare interface LayerProps extends IdentityProps {
    willChangeTransform?: boolean;
    /* Excluded from this release type: _forwardedOverrides */
}

/* Excluded from this release type: Line */

/**
 * @public
 */
declare interface LinearGradient {
    alpha: number;
    angle: number;
    start: string;
    end: string;
}

/**
 * @public
 */
declare namespace LinearGradient {
    /**
     * @param linearGradient
     */
    function isLinearGradient(linearGradient: any): linearGradient is LinearGradient;
    /* Excluded from this release type: hash */
    /* Excluded from this release type: toCSS */
}

/* Excluded from this release type: LineCap */

/* Excluded from this release type: LineJoin */

/* Excluded from this release type: loadJSON */

/**
 * @public
 */
declare class Loop extends EventEmitter<LoopEventNames> {
    private _started;
    private _frame;
    private _frameTasks;
    /* Excluded from this release type: addFrameTask */
    private _processFrameTasks;
    /* Excluded from this release type: TimeStep */
    /* Excluded from this release type: __constructor */
    /* Excluded from this release type: start */
    /* Excluded from this release type: stop */
    /* Excluded from this release type: frame */
    /* Excluded from this release type: time */
    /* Excluded from this release type: tick */
}

declare type LoopEventNames = "render" | "update" | "finish";

/* Excluded from this release type: MainLoop */

/* Excluded from this release type: NavigateTo */

/* Excluded from this release type: Navigation */

/* Excluded from this release type: NavigationItem */

/* Excluded from this release type: NavigationLink */

/* Excluded from this release type: NavigationProps */

/* Excluded from this release type: NavigationState */

/* Excluded from this release type: NavigationTarget */

/* Excluded from this release type: NavigationTransition */

/* Excluded from this release type: NavigationTransitionDirection */

/* Excluded from this release type: NavigationTransitionOptions */

/* Excluded from this release type: Navigator */

declare interface NumberControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.Number;
    defaultValue?: number;
    max?: number;
    min?: number;
    unit?: string;
    step?: number;
    displayStepper?: boolean;
}

declare interface ObjectControlDescription<P = any, Q = any> extends BaseControlDescription<P> {
    type: ControlType.Object;
    propertyControls: {
        [K in keyof Q]?: CompactControlsDescription<Partial<Q>>;
    };
}

/* Excluded from this release type: ObservableObject */

/**
 * @public
 */
declare type Observer<Value> = {
    update: UpdateFunction<Value>;
    finish: FinishFunction;
} | UpdateFunction<Value>;

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare type Overflow = "visible" | "hidden" | "scroll" | "auto";

declare interface OverflowProperties {
    overflow: Overflow;
}

/** @public */
export declare type Override<T extends object = FrameProps & {
    [key: string]: any;
}> = OverrideObject<T> | OverrideFunction<T>;

/** @public */
export declare type OverrideFunction<P extends object = any> = (props: P) => Partial<P>;

/** @public */
export declare type OverrideObject<T extends object = any> = Partial<T>;

/* Excluded from this release type: PackageIdentifier */

/**
 * The Page component allows you to create horizontally or vertically swipeable areas. It can be imported from the Framer Library and used in code components. Add children to create pages to swipe between. These children will be stretched to the size of the page component by default, but can also be set to auto to maintain their original size.
 * See {@link PageProperties} for it's properties
 * @public
 */
export declare class Page extends React.Component<Partial<PageProps>> {
    /* Excluded from this release type: _isStylable */
    private pages;
    private animation;
    private propsBoundedCurrentPage;
    private shouldReflectPropsBoundedCurrentPage;
    private contentOffset;
    private currentContentPage;
    private cancelUpdating;
    private static pageProps;
    /* Excluded from this release type: defaultProps */
    /* Excluded from this release type: propertyControls */
    private readonly properties;
    private readonly isHorizontalDirection;
    private readonly currentContentOffset;
    private boundedCurrentPage;
    /* Excluded from this release type: componentWillUpdate */
    /* Excluded from this release type: componentDidUpdate */
    private nearestPageIndex;
    private onDragAnimationStart;
    private onDragSessionStart;
    private applyEffects;
    private contentOffsetUpdated;
    private cancelAnimation;
    private effectValues;
    private wrapHandler;
    private offsetForPage;
    /* Excluded from this release type: render */
}

declare enum PageAlignment {
    Start = "start",
    Center = "center",
    End = "end"
}

declare type PageContentDimension = "auto" | "stretch";

declare type PageDirection = "horizontal" | "vertical";

/**
 * @public
 */
export declare enum PageEffect {
    None = "none",
    Cube = "cube",
    CoverFlow = "coverflow",
    Wheel = "wheel",
    Pile = "pile"
}

declare interface PageEffectInfo {
    offset: number;
    normalizedOffset: number;
    size: Size;
    index: number;
    direction: PageDirection;
    gap: number;
    pageCount: number;
}

/** @public */
export declare interface PageEvents {
    onChangePage: (currentIndex: number, previousIndex: number, pageComponent: Page) => void;
}

/**
 * All properties that can be used with the {@link Page} component it also extends all {@link ScrollProperties} properties.
 * @public
 */
export declare interface PageProperties {
    /**
     * Current swipe direction. Either "horizontal" or "vertical".
     */
    direction: PageDirection;
    /**
     * Width of the pages within the component. Either "auto" or "stretch" or a numeric value.
     */
    contentWidth: PageContentDimension | number;
    /**
     * Height of the pages within the component. Either "auto" or "stretch" or a numeric value.
     */
    contentHeight: PageContentDimension | number;
    /** Alignment of the pages within the component. Either "start", "center", or "end" */
    alignment: PageAlignment;
    /** Index of the current page. */
    currentPage: number;
    /* Excluded from this release type: animateCurrentPageUpdate */
    /** Gap between the page. */
    gap: number;
    /** Padding within the page component. */
    padding: number;
    /** Set padding on all sides, or one specific one. */
    paddingPerSide: boolean;
    /** Top padding within the page component. */
    paddingTop: number;
    /** Right padding within the page component. */
    paddingRight: number;
    /** Bottom padding within the page component. */
    paddingBottom: number;
    /** Left padding within the page component. */
    paddingLeft: number;
    /** Enable or disabling momentum, which defines if the page should auto-snap to the next page or not. */
    momentum: boolean;
    /** Enable dragging of the scroll inside the page component. */
    draggingEnabled: boolean;
    /** Pick an effect from one of the defaults. */
    defaultEffect: PageEffect;
    /* Excluded from this release type: effect */
}

/** @public */
export declare interface PageProps extends PageProperties, FrameProperties, LayerProps, Partial<PageEvents>, Partial<DragEvents<typeof Frame>>, Partial<ScrollEvents> {
}

/* Excluded from this release type: PathSegment */

/* Excluded from this release type: PathSegmentRecord */

/**
 * @public
 */
export declare function Point(x: number, y: number): Point;

/**
 * @public
 */
export declare interface Point {
    x: number;
    y: number;
}

/**
 * @public
 */
export declare namespace Point {
    /* Excluded from this release type: add */
    /* Excluded from this release type: subtract */
    /* Excluded from this release type: multiply */
    /* Excluded from this release type: divide */
    /* Excluded from this release type: absolute */
    /* Excluded from this release type: reverse */
    /* Excluded from this release type: pixelAligned */
    /* Excluded from this release type: distance */
    /* Excluded from this release type: angle */
    /** @public */
    const isEqual: (a: Point, b: Point) => boolean;
    /* Excluded from this release type: rotationNormalizer */
    /* Excluded from this release type: center */
}

/**
 * Prints to the console.
 *
 * @param args - Arguments to print
 * @public
 */
export declare function print(...args: any[]): void;

/** @public */
export declare type PropertyControls<ComponentProps = any, ArrayTypes = any> = {
    [K in keyof ComponentProps]?: ControlDescription<Partial<ComponentProps>, ArrayTypes>;
};

/* Excluded from this release type: PropertyStore */

/* Excluded from this release type: PropertyTree */

/* Excluded from this release type: Props */

/**
 * @public
 */
declare interface RadialGradient {
    alpha: number;
    widthFactor: number;
    heightFactor: number;
    centerAnchorX: number;
    centerAnchorY: number;
    start: string;
    end: string;
}

/**
 * @public
 */
declare namespace RadialGradient {
    /**
     * @param radialGradient
     * @public
     */
    function isRadialGradient(radialGradient: any): radialGradient is RadialGradient;
    /* Excluded from this release type: toCSS */
}

declare interface RadiusProperties {
    radius: RadiusValue | Partial<{
        topLeft: RadiusValue;
        topRight: RadiusValue;
        bottomLeft: RadiusValue;
        bottomRight: RadiusValue;
    }>;
}

declare type RadiusValue = number | Animatable<number> | string;

/* Excluded from this release type: ReactComponentDefinition */

/**
 * @public
 */
export declare interface Rect extends Point, Size {
}

/**
 * @public
 */
export declare namespace Rect {
    /**
     *
     * @param rect
     * @param other
     * @public
     */
    export function equals(rect: Rect | null, other: Rect | null): boolean;
    /* Excluded from this release type: atOrigin */
    /* Excluded from this release type: fromTwoPoints */
    /* Excluded from this release type: fromRect */
    /* Excluded from this release type: multiply */
    /* Excluded from this release type: divide */
    /* Excluded from this release type: offset */
    /* Excluded from this release type: inflate */
    /* Excluded from this release type: pixelAligned */
    /* Excluded from this release type: halfPixelAligned */
    /* Excluded from this release type: round */
    /* Excluded from this release type: roundToOutside */
    /* Excluded from this release type: minX */
    /* Excluded from this release type: maxX */
    /* Excluded from this release type: minY */
    /* Excluded from this release type: maxY */
    /* Excluded from this release type: positions */
    /* Excluded from this release type: center */
    /* Excluded from this release type: fromPoints */
    /* Excluded from this release type: merge */
    /* Excluded from this release type: intersection */
    /* Excluded from this release type: points */
    /* Excluded from this release type: containsPoint */
    /**
     * Returns wether a rect contains another rect entirely
     * @param rectA
     * @param rectB
     * @returns true if rectA contains rectB
     */
    const containsRect: (rectA: Rect, rectB: Rect) => boolean;
    /* Excluded from this release type: toCSS */
    /* Excluded from this release type: inset */
    /* Excluded from this release type: intersects */
    /* Excluded from this release type: overlapHorizontally */
    /* Excluded from this release type: overlapVertically */
    /* Excluded from this release type: doesNotIntersect */
    /**
     *
     * @param rectA
     * @param rectB
     * @return if the input rectangles are equal in size and position
     * @public
     */
    const isEqual: (rectA: Rect | null, rectB: Rect | null) => boolean;
    /* Excluded from this release type: cornerPoints */
    /* Excluded from this release type: midPoints */
    /* Excluded from this release type: pointDistance */
    /* Excluded from this release type: fromAny */
}

/* Excluded from this release type: RenderEnvironment */

/* Excluded from this release type: RenderTarget */

/**
 * The Scroll component in Framer allows you create scrollable areas.
 * It can be imported from the Framer Library and used in code components.
 * Add children that exceed the height or width of the component to create
 * horizontally or vertically scrollable areas.
 * See {@link ScrollProperties} for its properties
 * @public
 */
export declare class Scroll extends React.Component<Partial<ScrollProps>> {
    /* Excluded from this release type: _isStylable */
    /* Excluded from this release type: supportsConstraints */
    /* Excluded from this release type: scrollProps */
    /* Excluded from this release type: defaultProps */
    /* Excluded from this release type: propertyControls */
    /* Excluded from this release type: properties */
    private wrapHandlers;
    /* Excluded from this release type: render */
}

declare type ScrollDirection = "horizontal" | "vertical" | "both";

declare type ScrollEventHandler = (event: FramerEvent, scrollComponent: Scroll) => void;

/**
 * @public
 */
export declare interface ScrollEvents {
    /** On start of scroll. */
    onScrollStart: ScrollEventHandler;
    /** On scroll. */
    onScroll: ScrollEventHandler;
    /** On end of scroll. */
    onScrollEnd: ScrollEventHandler;
    /* Excluded from this release type: onScrollSessionStart */
    /* Excluded from this release type: onScrollSessionEnd */
}

/**
 * The properties for the {@link Scroll} component, which are also available within other components, like {@link Page}.
 * @public
 */
export declare interface ScrollProperties {
    draggingEnabled: boolean;
    /** Scrolling direction. */
    direction: ScrollDirection;
    /** Lock the current scrolling direction. */
    directionLock: boolean;
    /**
     * @internalremarks
     * Ignored and deprecated; see https://github.com/framer/company/issues/10018 for future direction
     * @deprecated mouseWheel is always enabled
     */
    mouseWheel: boolean;
    /** Horizontal offset of the scrollable content. */
    contentOffsetX: number | Animatable<number> | null;
    /** Vertical offset of the scrollable content. */
    contentOffsetY: number | Animatable<number> | null;
}

/** @public */
export declare interface ScrollProps extends ScrollProperties, FrameProperties, LayerProps, Partial<ScrollEvents>, Partial<DragEvents<DraggableType>> {
}

declare interface SegmentedEnumControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.SegmentedEnum;
    defaultValue?: string;
    options: string[];
    optionTitles?: string[] | ((props: P | null) => string[]);
}

/* Excluded from this release type: serverURL */

/* Excluded from this release type: setGlobalRenderEnvironment */

declare interface Shadow {
    color: string;
    x: number;
    y: number;
    blur: number;
}

declare namespace Shadow {
    function is(shadow: any): shadow is Shadow;
}

/**
 * @public
 */
export declare function Size(width: number, height: number): Size;

/**
 * @public
 */
export declare interface Size {
    width: number;
    height: number;
}

/**
 * @public
 */
export declare namespace Size {
    /* Excluded from this release type: equals */
    /* Excluded from this release type: update */
    /* Excluded from this release type: subtract */
    /**
     * @public
     */
    const zero: Size;
    /**
     * Checks if the size has a zero width and zero height
     * @param size size to check
     * @public
     */
    const isZero: (size: Size) => boolean;
    /* Excluded from this release type: defaultIfZero */
}

/* Excluded from this release type: SpringAnimator */

declare type SpringOptions = TensionFrictionSpringOptions | DampingDurationSpringOptions;

/**
 * @public
 */
export declare class Stack extends Layer<StackProperties, StackState> {
    /* Excluded from this release type: _isStylable */
    /* Excluded from this release type: defaultStackSpecificProps */
    /* Excluded from this release type: defaultProps */
    /* Excluded from this release type: propertyControls */
    /* Excluded from this release type: rect */
    /* Excluded from this release type: rect */
    /* Excluded from this release type: state */
    /* Excluded from this release type: getDerivedStateFromProps */
    /* Excluded from this release type: updatedSize */
    /* Excluded from this release type: minSize */
    /* Excluded from this release type: size */
    /* Excluded from this release type: render */
    /* Excluded from this release type: paddingSize */
    /* Excluded from this release type: minChildrenSizes */
    /* Excluded from this release type: childSizes */
    /* Excluded from this release type: _cssExport */
    /* Excluded from this release type: childFractions */
    /* Excluded from this release type: childLayoutRects */
    /* Excluded from this release type: autoSize */
    /* Excluded from this release type: freeSpace */
    /* Excluded from this release type: invisibleItemIndexes */
    private layoutChildren;
    private layoutPlaceholders;
    /* Excluded from this release type: childInsertion */
}

/**
 * @public
 */
declare type StackAlignment = "start" | "center" | "end";

/**
 * @public
 */
declare type StackDirection = "horizontal" | "vertical";

/**
 * @public
 */
declare type StackDistribution = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";

/* Excluded from this release type: StackPlaceHolders */

/**
 * @public
 */
declare interface StackProperties extends StackSpecificProps, FrameProperties, LayerProps {
}

/**
 * @public
 */
declare interface StackSpecificProps {
    direction: StackDirection;
    distribution: StackDistribution;
    alignment: StackAlignment;
    gap: number;
    padding: number;
    paddingPerSide: boolean;
    paddingTop: number;
    paddingRight: number;
    paddingLeft: number;
    paddingBottom: number;
    /* Excluded from this release type: placeholders */
}

/**
 * @public
 */
declare interface StackState {
    size: AnimatableObject<Size> | Size | null;
    shouldCheckImageAvailability: boolean;
    currentBackgroundImageSrc: string | null;
}

/* Excluded from this release type: StackState_2 */

/* Excluded from this release type: State */

/* Excluded from this release type: State_2 */

declare interface StringControlDescription<P = any> extends BaseControlDescription<P> {
    type: ControlType.String;
    defaultValue?: string;
    placeholder?: string;
}

/* Excluded from this release type: StrokeAlignment */

/* Excluded from this release type: SVG */

/* Excluded from this release type: SVGProperties */

/* Excluded from this release type: SVGProps */

declare interface TensionFrictionSpringOptions {
    tension: number;
    friction: number;
    tolerance: number;
    velocity: number;
}

/* Excluded from this release type: Text */

/* Excluded from this release type: TextAlignment */

declare interface TextColorProperties {
    color: Color | string;
}

/* Excluded from this release type: TextProperties */

/* Excluded from this release type: TextProps */

declare type ToAnimatableOrValue<PossiblyAnimatable> = PossiblyAnimatable extends Animatable<infer Value> ? Value | Animatable<Value> : PossiblyAnimatable | Animatable<PossiblyAnimatable>;

/**
 * @public
 */
declare type TransactionId = number;

/**
 * @public
 */
export declare function transform<InputValue, OutputValue>(from: [InputValue, InputValue], to: [OutputValue, OutputValue], options?: Partial<transform.Options<InputValue, OutputValue>>): (from: InputValue) => OutputValue;

/**
 * @public
 */
export declare namespace transform {
    export interface Options<InputValue, OutputValue> {
        inputInterpolation: Interpolation<InputValue>;
        outputInterpolation: Interpolation<OutputValue>;
        limit: boolean;
        colorModel: ColorMixModelType;
    }
    export function value<InputValue, OutputValue>(input: InputValue, from: [InputValue, InputValue], to: [OutputValue, OutputValue], options?: Partial<transform.Options<InputValue, OutputValue>>): OutputValue;
}

declare interface TransformProperties {
    z: Animatable<number> | number;
    rotation: Animatable<number> | number;
    rotationX: Animatable<number> | number;
    rotationY: Animatable<number> | number;
    rotationZ: Animatable<number> | number;
    scale: Animatable<number> | number;
    scaleX: Animatable<number> | number;
    scaleY: Animatable<number> | number;
    scaleZ: Animatable<number> | number;
    skew: Animatable<number> | number;
    skewX: Animatable<number> | number;
    skewY: Animatable<number> | number;
    originX: Animatable<number> | number;
    originY: Animatable<number> | number;
    originZ: Animatable<number> | number;
}

/* Excluded from this release type: updateComponentLoader */

/**
 * @public
 */
declare type UpdateFunction<Value> = (change: Change<Value>, transaction?: TransactionId) => void;

/**
 * @public
 */
declare interface UpdateObserver<Value> {
    onUpdate(handler: Observer<Value>): Cancel;
}

/* Excluded from this release type: UserConstraintValues */

/* Excluded from this release type: ValueInterpolation */

/* Excluded from this release type: Vector */

/* Excluded from this release type: VectorGroup */

/* Excluded from this release type: VectorGroupProperties */

/* Excluded from this release type: VectorGroupProps */

/* Excluded from this release type: VectorProperties */

/* Excluded from this release type: VectorProps */

/**
 * This version is automatically updated by the Makefile
 * @public
 */
export declare const version = "0.10.1";

declare type VisualProperties = Partial<BackgroundProperties & RadiusProperties & FilterProperties & BackgroundFilterProperties & BlendingProperties & OverflowProperties & BoxShadowProperties & WithOpacity & TextColorProperties>;

declare interface WithEventsProperties extends WithPanHandlers, WithTapHandlers, WithMouseHandlers, WithMouseWheelHandler {
}

/**
 * @public
 */
declare interface WithFractionOfFreeSpace {
    /* Excluded from this release type: freeSpaceInParent */
    /* Excluded from this release type: freeSpaceUnitDivisor */
}

declare interface WithMouseHandlers {
    onMouseDown: EventHandler;
    onClick: EventHandler;
    onMouseUp: EventHandler;
    onMouseEnter: EventHandler;
    onMouseLeave: EventHandler;
}

declare interface WithMouseWheelHandler {
    onMouseWheelStart: EventHandler;
    onMouseWheel: EventHandler;
    onMouseWheelEnd: EventHandler;
}

/* Excluded from this release type: WithNavigator */

declare interface WithOpacity {
    opacity: number | Animatable<number>;
}

/* Excluded from this release type: WithOverride */

/* Excluded from this release type: WithPackage */

declare interface WithPanHandlers {
    onPanStart: EventHandler;
    onPan: EventHandler;
    onPanEnd: EventHandler;
}

/* Excluded from this release type: WithPath */

declare interface WithTapHandlers {
    onTapStart: EventHandler;
    onTap: EventHandler;
    onTapEnd: EventHandler;
}
