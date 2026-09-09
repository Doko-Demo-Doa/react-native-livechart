import type { SkFont } from "../tgfx";
import { resolveFontConfig } from "../core/resolveConfig";
import type { FontConfig } from "../types";

type TgfxFontDescriptor = {
  fontSize: number;
  getSize: () => number;
  measureText: (text: string) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  getMetrics: () => { ascent: number; descent: number; leading: number };
};

function getSize(this: TgfxFontDescriptor) {
  "worklet";
  return this.fontSize;
}

function measureText(this: TgfxFontDescriptor, text: string) {
  "worklet";
  return {
    x: 0,
    y: -this.fontSize * 0.8,
    width: text.length * this.fontSize * 0.6,
    height: this.fontSize,
  };
}

function getMetrics(this: TgfxFontDescriptor) {
  "worklet";
  return {
    ascent: -this.fontSize * 0.8,
    descent: this.fontSize * 0.2,
    leading: 0,
  };
}

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
  return {
    fontFamily,
    fontSize,
    fontWeight,
    // The chart's layout math remains worklet-side. These mirror the small
    // SkFont query surface while TGFX owns actual text shaping at draw time.
    getSize,
    measureText,
    getMetrics,
  };
}
