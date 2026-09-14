import {
  Group,
  Path,
  Text as SkiaText,
  type SkFont,
  type SkPath,
} from "../tgfx";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

interface BadgeData {
  path: SkPath;
  textX: number;
  textY: number;
  text: string;
  bgColor: string;
  bgR: number;
  bgG: number;
  bgB: number;
  bgA: number;
  textColor: string;
}

export function BadgeOverlay({
  badge,
  font,
  borderColor,
  borderWidth = 1,
  offsetX = 0,
  offsetY = 0,
}: {
  badge: SharedValue<BadgeData>;
  font: SkFont;
  /** Pill border color. When unset, no border is drawn. */
  borderColor?: string;
  /** Border stroke width (px) — only used when `borderColor` is set. */
  borderWidth?: number;
  /** Horizontal nudge from the badge's anchor (px). */
  offsetX?: number;
  /** Vertical nudge from the badge's anchor (px). */
  offsetY?: number;
}) {
  const badgePath = useDerivedValue(() => badge.value.path);
  // A plain color string is baked into the compiled scene once and never
  // re-read, so an animated fill (the momentum-driven badge background)
  // needs the live `[r,g,b,a]` channel form instead — see the comment on
  // `backgroundRgba` in useBadge.ts.
  const bgR = useDerivedValue(() => badge.value.bgR);
  const bgG = useDerivedValue(() => badge.value.bgG);
  const bgB = useDerivedValue(() => badge.value.bgB);
  const bgA = useDerivedValue(() => badge.value.bgA);
  const textX = useDerivedValue(() => badge.value.textX);
  const textY = useDerivedValue(() => badge.value.textY);
  const text = useDerivedValue(() => badge.value.text);
  const textColor = useDerivedValue(() => badge.value.textColor);

  const transform =
    offsetX !== 0 || offsetY !== 0
      ? [{ translateX: offsetX }, { translateY: offsetY }]
      : undefined;

  return (
    <Group transform={transform}>
      <Path path={badgePath} style="fill" color={[bgR, bgG, bgB, bgA]} />
      {borderColor != null && (
        <Path
          path={badgePath}
          style="stroke"
          strokeWidth={borderWidth}
          color={borderColor}
        />
      )}
      <SkiaText x={textX} y={textY} text={text} font={font} color={textColor} />
    </Group>
  );
}
