import type { SharedValue } from "react-native-reanimated";

/**
 * Resolves an optional ambient opacity multiplier (e.g. a scrub fade) to
 * fold directly into a leaf's own alpha computation, instead of an extra
 * wrapping `<Group opacity>` — TGFX only supports one animated opacity per
 * paint chain (a second nested one freezes instead of compositing). Must stay
 * a standalone `"worklet"` function rather than a closure defined inside a
 * component: a plain closure isn't reliably callable from another
 * already-compiled worklet (Reanimated treats it as a cross-thread "remote
 * function" call and throws).
 */
export function ambientOpacity(groupOpacity?: SharedValue<number>): number {
  "worklet";
  return groupOpacity ? groupOpacity.get() : 1;
}
