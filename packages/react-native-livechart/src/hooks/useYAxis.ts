import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import type { SkFont } from "../tgfx";
import { GRID_METRICS_DEFAULTS, MS_PER_FRAME_60FPS } from "../constants";
import type { ChartEngineLayout } from "../core/useLiveChartEngine";
import { computeGridEntries } from "../draw/grid";
import type { ChartPadding } from "../draw/line";
import type { GridMetrics } from "../types";

/**
 * Compute Y-axis grid entries (values + labels) with animated fade-in/out.
 * Uses `computeGridEntries` to pick nice intervals and track label alpha for
 * smooth transitions when the value range changes.
 */
export function useYAxis(
  engine: ChartEngineLayout,
  padding: ChartPadding,
  formatValue: (v: number) => string,
  font: SkFont,
  minGap = 36,
  gridMetrics: GridMetrics = GRID_METRICS_DEFAULTS,
  count = 0,
  intervalScale = 1,
) {
  const prevInterval = useSharedValue(0);
  const labelAlphas = useSharedValue<Record<number, number>>({});

  const yAxisEntries = useDerivedValue(() => {
    const dt = MS_PER_FRAME_60FPS;

    const previousAlphas = labelAlphas.get();
    const alphas = { ...previousAlphas };
    const result = computeGridEntries(
      engine.displayMin.get(),
      engine.displayMax.get(),
      engine.canvasHeight.get(),
      padding.top,
      padding.bottom,
      prevInterval.get(),
      alphas,
      formatValue,
      dt,
      minGap,
      gridMetrics,
      count,
      intervalScale,
    );

    prevInterval.set(result.interval);
    // Writing the SharedValue every frame — even to the same values — fans
    // out a reactivity cascade to every derived value reading it. Only write
    // back when something actually changed.
    const alphaKeys = Object.keys(alphas);
    let cacheChanged = alphaKeys.length !== Object.keys(previousAlphas).length;
    for (let i = 0; !cacheChanged && i < alphaKeys.length; i++) {
      const key = Number(alphaKeys[i]);
      cacheChanged = alphas[key] !== previousAlphas[key];
    }
    if (cacheChanged) labelAlphas.set(alphas);

    return result.entries;
  });

  return { yAxisEntries, font };
}
