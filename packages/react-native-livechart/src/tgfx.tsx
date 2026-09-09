/**
 * The small compatibility boundary between the chart renderer and TGFX.
 *
 * Keeping Skia-shaped props here lets the chart's public components stay stable
 * while the drawing primitives use TGFX's declarative, SharedValue-aware scene.
 * New code should use TGFX names/props directly where possible.
 */
import type { ComponentType, ReactNode } from "react";
import {
  Atlas as TgfxAtlas,
  Blur as TgfxBlur,
  Canvas as TgfxCanvas,
  Circle as TgfxCircle,
  DashPathEffect as TgfxDashPathEffect,
  Group as TgfxGroup,
  Line as TgfxLine,
  LinearGradient as TgfxLinearGradient,
  Path as TgfxPath,
  RadialGradient as TgfxRadialGradient,
  Rect as TgfxRect,
  RoundedRect as TgfxRoundedRect,
  Shader as TgfxShader,
  Text as TgfxText,
} from "react-native-tgfx";
import { useDerivedValue } from "react-native-reanimated";

export type SkPath = any;
export type SkColor = string;
export type SkRect = { x: number; y: number; width: number; height: number; w?: number; h?: number };
export type SkRSXform = { scos: number; ssin: number; tx: number; ty: number };
export type SkImage = any;
export type SkCanvas = any;
export type SkPaint = any;
export type SkFont = any;
export type SkFontMgr = any;
/** Legacy input accepted by the deprecated public `font.typeface` option. */
export type DataSourceParam = any;
export type Uniforms = Record<string, any>;

/** Font information TGFX needs for its native text shaper. */
export type TgfxFont = {
  fontFamily: string;
  fontSize: number;
  fontWeight?: number | string;
  getSize?: () => number;
  measureText?: (text: string) => { x: number; y: number; width: number; height: number };
  getMetrics?: () => { ascent: number; descent: number; leading: number };
};

type AnyProps = Record<string, any>;
const any = <T,>(component: T) => component as unknown as ComponentType<AnyProps>;
const RawRect = any(TgfxRect);
const RawRoundedRect = any(TgfxRoundedRect);
const RawLine = any(TgfxLine);
const RawPath = any(TgfxPath);
const RawText = any(TgfxText);
const RawBlur = any(TgfxBlur);
const RawShader = any(TgfxShader);
const RawLinearGradient = any(TgfxLinearGradient);
const RawRadialGradient = any(TgfxRadialGradient);

export function vec(x = 0, y = 0) {
  "worklet";
  return { x, y };
}

export const Canvas = any(TgfxCanvas);
export const Group = any(TgfxGroup);
export const Circle = any(TgfxCircle);
/**
 * TGFX supports live individual gradient stops, but its alpha compiler expects
 * the stop *list* itself to be a JS array. Skia accepted a SharedValue of an
 * array, which the chart uses for a few UI-thread calculations (notably the
 * initial loading mask). Snapshot that outer list before passing it to TGFX.
 */
function gradientList(value: unknown) {
  if (Array.isArray(value) || value == null) return value;
  if (typeof value === "object") {
    const live = value as { get?: () => unknown; value?: unknown };
    const current = live.get?.() ?? live.value;
    return Array.isArray(current) ? current : value;
  }
  return value;
}

export function LinearGradient({ colors, positions, ...props }: AnyProps) {
  return (
    <RawLinearGradient
      {...props}
      colors={gradientList(colors)}
      positions={gradientList(positions)}
    />
  );
}

export function RadialGradient({ colors, positions, ...props }: AnyProps) {
  return (
    <RawRadialGradient
      {...props}
      colors={gradientList(colors)}
      positions={gradientList(positions)}
    />
  );
}
export const DashPathEffect = any(TgfxDashPathEffect);

export function Rect({ rect, ...props }: AnyProps) {
  if (rect) {
    return <RawRect {...props} x={rect.x} y={rect.y} width={rect.width ?? rect.w} height={rect.height ?? rect.h} />;
  }
  return <RawRect {...props} />;
}

export function RoundedRect({ rect, r, ...props }: AnyProps) {
  if (rect) {
    return <RawRoundedRect {...props} r={r} x={rect.x} y={rect.y} width={rect.width ?? rect.w} height={rect.height ?? rect.h} />;
  }
  return <RawRoundedRect {...props} r={r} />;
}

/** Converts Skia's point-pair line vocabulary into TGFX's four scalar slots. */
export function Line({ p1, p2, ...props }: AnyProps) {
  const x1 = useDerivedValue(() => p1?.value?.x ?? p1?.get?.().x ?? p1?.x ?? 0);
  const y1 = useDerivedValue(() => p1?.value?.y ?? p1?.get?.().y ?? p1?.y ?? 0);
  const x2 = useDerivedValue(() => p2?.value?.x ?? p2?.get?.().x ?? p2?.x ?? 0);
  const y2 = useDerivedValue(() => p2?.value?.y ?? p2?.get?.().y ?? p2?.y ?? 0);
  return <RawLine {...props} x1={x1} y1={y1} x2={x2} y2={y2} />;
}

export function Path({ path, ...props }: AnyProps) {
  return <RawPath {...props} path={path ?? ""} />;
}

export function Text({ font, ...props }: AnyProps) {
  return <RawText {...props} fontFamily={font?.fontFamily} fontSize={font?.fontSize ?? font?.getSize?.() ?? 12} fontWeight={font?.fontWeight} />;
}

/** TGFX names the effect `Blur`; the old `style` setting has no TGFX equivalent. */
export function BlurMask({ blur, children }: AnyProps) {
  return <RawBlur blur={blur}>{children as ReactNode}</RawBlur>;
}

export const Blur = any(TgfxBlur);

export function Shader({ source, ...props }: AnyProps) {
  return <RawShader {...props} source={typeof source === "string" ? source : source?.source ?? ""} />;
}

/**
 * TGFX's Atlas requires a native TGFX image. The chart's old atlas assets were
 * Skia pictures, so callers are migrated to regular primitives while this
 * compatibility export keeps the renderer tree well-formed during that change.
 */
export const Atlas = any(TgfxAtlas);

export const Skia = {
  Color: (color: string) => color,
  XYWHRect: (x: number, y: number, width: number, height: number): SkRect => ({ x, y, width, height, w: width, h: height }),
  RSXform: (scos: number, ssin: number, tx: number, ty: number): SkRSXform => ({ scos, ssin, tx, ty }),
  RuntimeEffect: { Make: (source: string): any => ({ source }) },
  Path: { Make: (): string => "" },
  PathBuilder: { Make: (): any => ({ moveTo() { return this; }, lineTo() { return this; }, cubicTo() { return this; }, close() { return this; }, detach() { return ""; } }) },
  Paint: (): any => ({ setAntiAlias() {}, setColor() {}, setStyle() {}, setStrokeWidth() {}, setStrokeCap() {}, setStrokeJoin() {} }),
  PictureRecorder: (): any => ({ beginRecording: () => ({ drawCircle() {}, drawImageRect() {}, drawText() {}, drawPath() {}, scale() {}, save() {}, restore() {}, translate() {} }), finishRecordingAsPicture: () => null }),
};

/** TGFX does not expose Skia picture recording; atlas callers fall back safely. */
export const drawAsImageFromPicture = (_picture?: unknown, _size?: unknown): null => null;

export const PaintStyle = { Fill: "fill", Stroke: "stroke" } as const;
export const StrokeCap = { Round: "round" } as const;
export const StrokeJoin = { Round: "round" } as const;
