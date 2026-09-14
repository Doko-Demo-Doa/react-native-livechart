import {
  Group,
  Text as SkiaText,
  type SkFont,
} from "../tgfx";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

interface LabelEntry {
  x: number;
  y: number;
  label: string;
  alpha: number;
}

/**
 * A single pre-allocated text label driven by a shared value array.
 * Reads the entry at `index` — positioned off-screen when the index
 * exceeds the array length.
 */
export function AnimatedLabel({
  entries,
  index,
  font,
  color,
  groupOpacity,
}: {
  entries: SharedValue<LabelEntry[]>;
  index: number;
  font: SkFont;
  color: string;
  /**
   * Ambient reveal/auto-hide opacity to fold into this label's own alpha.
   * TGFX freezes a chain's alpha once two *animated* `<Group opacity>`s are
   * nested (only one slot per draw), so the ambient value is multiplied in
   * here instead of via a second wrapping Group — see the callers in
   * XAxisOverlay/YAxisOverlay.
   */
  groupOpacity?: SharedValue<number>;
}) {
  const x = useDerivedValue(() => entries.value[index]?.x ?? -200);
  const y = useDerivedValue(() => entries.value[index]?.y ?? -200);
  const text = useDerivedValue(() => entries.value[index]?.label ?? " ");
  const opacity = useDerivedValue(() => {
    const alpha = entries.value[index]?.alpha ?? 0;
    return groupOpacity ? alpha * groupOpacity.get() : alpha;
  });

  return (
    <Group opacity={opacity}>
      <SkiaText x={x} y={y} text={text} font={font} color={color} />
    </Group>
  );
}
