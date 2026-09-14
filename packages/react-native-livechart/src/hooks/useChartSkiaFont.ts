import type { SkFont } from "../tgfx";
import { resolveFontConfig } from "../core/resolveConfig";
import type { FontConfig } from "../types";

/** Resolves a native TGFX text descriptor. Font matching and shaping are native. */
export function useChartSkiaFont(
  fontProp: FontConfig | undefined,
  defaultFamily: string,
  defaultSize: number,
): SkFont {
  const { fontFamily, fontSize, fontWeight } = resolveFontConfig(
    fontProp,
    defaultFamily,
    defaultSize,
  );
  // `fontSize` is captured by closure rather than read off `this` — a method
  // called as `font.getMetrics()` normally binds `this` to `font`, but once
  // this plain object crosses into a Reanimated worklet (captured inside a
  // `useDerivedValue`), the object is cloned for the UI-thread runtime and
  // each function becomes its own worklet; called back through that clone,
  // `this` is no longer the original `font` object, so `this.fontSize` reads
  // `undefined` and every layout computation (grid/axis label positions)
  // silently comes out `NaN`. A closure has no such receiver to lose.
  return {
    fontFamily,
    fontSize,
    fontWeight,
    // The chart's layout math remains worklet-side. These mirror the small
    // SkFont query surface while TGFX owns actual text shaping at draw time.
    getSize: () => {
      "worklet";
      return fontSize;
    },
    measureText: (text: string) => {
      "worklet";
      return {
        x: 0,
        y: -fontSize * 0.8,
        width: text.length * fontSize * 0.6,
        height: fontSize,
      };
    },
    getMetrics: () => {
      "worklet";
      return {
        ascent: -fontSize * 0.8,
        descent: fontSize * 0.2,
        leading: 0,
      };
    },
  };
}
