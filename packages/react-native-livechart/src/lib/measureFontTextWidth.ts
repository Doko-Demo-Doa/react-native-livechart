import type { SkFont } from "../tgfx";

/**
 * Horizontal layout width for `text` via Skia `measureText` (replaces deprecated `getTextWidth`).
 * Marked worklet for use inside Reanimated `useDerivedValue`.
 */
export function measureFontTextWidth(font: SkFont, text: string): number {
  "worklet";
  if (typeof font.measureText === "function") return font.measureText(text).width;
  return text.length * (font.fontSize ?? font.getSize?.() ?? 12) * 0.6;
}
