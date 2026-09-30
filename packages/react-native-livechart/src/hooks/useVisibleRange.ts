import { useCallback, useEffect, useRef } from "react";
import {
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { VisibleRange } from "../types";

export type { VisibleRange };

/** Engine SharedValues the visible-range reaction reads. */
export interface VisibleRangeEngineRefs {
  timestamp: SharedValue<number>;
  displayWindow: SharedValue<number>;
  viewEnd: SharedValue<number | null>;
}

export interface UseVisibleRangeOptions {
  engine: VisibleRangeEngineRefs;
  /** Earliest retained time (unix seconds) — used for the `onReachStart` trigger. */
  minTime: SharedValue<number>;
  /** Fires (throttled to ~1 Hz) when the visible window's edges change. */
  onVisibleRangeChange?: (range: VisibleRange) => void;
  /**
   * Fires once when the window's left edge comes within one window-width of the
   * earliest retained data — the cue to lazily page in older history. Re-arms
   * after the edge moves back out.
   */
  onReachStart?: () => void;
}

/**
 * Throttle key for a visible range: integer seconds of each edge, follow
 * state, and the near-start flag. Including follow state reports a return to
 * live even when the rounded edges have not moved. `onReachStart` edge-triggers
 * off the trailing flag.
 */
export function rangeSignature(
  startSec: number,
  endSec: number,
  following: boolean,
  near: boolean,
): string {
  "worklet";
  return `${Math.round(startSec)}|${Math.round(endSec)}|${following ? 1 : 0}|${near ? 1 : 0}`;
}

/** Whether the window's left edge is within `threshold` seconds of the oldest data. */
export function isNearStart(
  winStart: number,
  minTime: number,
  threshold: number,
): boolean {
  "worklet";
  return winStart <= minTime + threshold;
}

/**
 * Bridges the UI-thread visible window to JS paging callbacks. A reaction watches
 * the window edges and `scheduleOnRN`s `onVisibleRangeChange` (throttled) and
 * `onReachStart` (edge-triggered near the oldest data). Inert when both callbacks
 * are absent. Used by both `LiveChart` and `LiveChartSeries`.
 */
export function useVisibleRange({
  engine,
  minTime,
  onVisibleRangeChange,
  onReachStart,
}: UseVisibleRangeOptions): void {
  // Latest callbacks behind refs so the (deps-stable) dispatchers below always
  // call the current prop without re-subscribing the reaction each render.
  const rangeCb = useRef(onVisibleRangeChange);
  const reachCb = useRef(onReachStart);
  useEffect(() => {
    rangeCb.current = onVisibleRangeChange;
    reachCb.current = onReachStart;
  }, [onVisibleRangeChange, onReachStart]);

  const emitRange = useCallback(
    /* istanbul ignore next -- dispatched via scheduleOnRN from the UI thread, not in Jest */
    (startSec: number, endSec: number, following: boolean) => {
      rangeCb.current?.({ startSec, endSec, following });
    },
    [],
  );
  const emitReachStart = useCallback(
    /* istanbul ignore next -- dispatched via scheduleOnRN from the UI thread, not in Jest */
    () => {
      reachCb.current?.();
    },
    [],
  );

  const active = onVisibleRangeChange != null || onReachStart != null;

  useAnimatedReaction(
    /* istanbul ignore next -- Reanimated reaction worklet; runs on the UI thread, not in Jest */
    () => {
      if (!active) return ""; // inert — never changes, so the reaction never fires
      const end = engine.timestamp.value;
      const win = engine.displayWindow.value;
      const start = end - win;
      return rangeSignature(
        start,
        end,
        engine.viewEnd.value == null,
        isNearStart(start, minTime.value, win),
      );
    },
    /* istanbul ignore next -- Reanimated reaction; dispatches on the JS thread, not exercised under Jest */
    (curr, prev) => {
      if (!active || curr === "" || curr === prev) return;
      const end = engine.timestamp.value;
      const win = engine.displayWindow.value;
      const start = end - win;
      const following = engine.viewEnd.value == null;
      const near = isNearStart(start, minTime.value, win);
      const wasNear = typeof prev === "string" && prev.endsWith("|1");
      scheduleOnRN(emitRange, start, end, following);
      if (near && !wasNear) scheduleOnRN(emitReachStart);
    },
    [active, emitRange, emitReachStart],
  );
}
