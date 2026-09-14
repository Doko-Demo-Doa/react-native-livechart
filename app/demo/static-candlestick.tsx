import { useState } from "react";
import {
  LiveChart,
  type CandlePoint,
  type LiveChartPoint,
} from "react-native-livechart";
import { useSharedValue } from "react-native-reanimated";

import { ControlRow, ToggleChip } from "../../demo-lib/ChipRow";
import { DemoScreen } from "../../demo-lib/DemoScreen";
import { ACCENT } from "../../demo-lib/shared";
import { APP_THEME } from "../../demo-lib/theme";

export const options = { title: "Static candlestick" };

const CANDLE_WIDTH_SECONDS = 15 * 60;
const CHART_END_TIME = Date.UTC(2025, 5, 13, 16, 0, 0) / 1_000;

/** A fixed six-hour OHLCV snapshot: no simulator, network, or live candle. */
const OHLCV = [
  [418.2, 419.6, 417.5, 418.8, 4_180],
  [418.8, 420.1, 418.3, 419.7, 5_240],
  [419.7, 420.4, 418.9, 419.2, 3_860],
  [419.2, 421.5, 418.6, 421.1, 6_480],
  [421.1, 422.3, 420.4, 420.8, 5_910],
  [420.8, 421.2, 419.1, 419.6, 4_720],
  [419.6, 420.2, 418.2, 418.7, 5_630],
  [418.7, 419.4, 417.8, 418.9, 3_940],
  [418.9, 421.8, 418.5, 421.4, 7_260],
  [421.4, 422.6, 420.8, 422.1, 6_850],
  [422.1, 422.7, 420.5, 421.0, 4_960],
  [421.0, 421.6, 419.8, 420.2, 4_310],
  [420.2, 421.0, 419.4, 420.7, 3_790],
  [420.7, 423.4, 420.2, 422.9, 8_420],
  [422.9, 424.1, 422.0, 423.6, 7_780],
  [423.6, 424.3, 422.7, 423.0, 5_120],
  [423.0, 423.5, 421.3, 421.8, 6_040],
  [421.8, 422.4, 420.9, 421.5, 4_580],
  [421.5, 423.2, 421.0, 422.8, 5_940],
  [422.8, 424.8, 422.2, 424.2, 8_960],
  [424.2, 425.0, 423.4, 424.0, 6_710],
  [424.0, 424.6, 422.8, 423.1, 5_380],
  [423.1, 424.4, 422.6, 423.8, 4_870],
  [423.8, 425.6, 423.3, 425.1, 7_940],
] as const;

const STATIC_CANDLES: CandlePoint[] = OHLCV.map(
  ([open, high, low, close, volume], index) => ({
    time: CHART_END_TIME - (OHLCV.length - index) * CANDLE_WIDTH_SECONDS,
    open,
    high,
    low,
    close,
    volume,
  }),
);

// Candle mode still uses data/value for fitting and momentum detection.
const STATIC_DATA: LiveChartPoint[] = STATIC_CANDLES.map(({ time, close }) => ({
  time: time + CANDLE_WIDTH_SECONDS,
  value: close,
}));

const CUSTOM_CANDLE_PALETTE = {
  candleUp: "#14b8a6",
  candleDown: "#f97316",
  wickUp: "#0d9488",
  wickDown: "#ea580c",
};

export default function StaticCandlestickScreen() {
  const [volume, setVolume] = useState(true);
  const [customColors, setCustomColors] = useState(false);
  const data = useSharedValue(STATIC_DATA);
  const value = useSharedValue(STATIC_DATA[STATIC_DATA.length - 1].value);
  const candles = useSharedValue(STATIC_CANDLES);

  return (
    <DemoScreen
      title="Static candlestick"
      docs="guides/candlestick"
      description="A fixed six-hour OHLCV snapshot. Static mode renders without a live feed or animation loop; press and drag to inspect committed candles."
      chart={
        <LiveChart
          data={data}
          value={value}
          mode="candle"
          candles={candles}
          candleWidth={CANDLE_WIDTH_SECONDS}
          static
          nowOverride={CHART_END_TIME}
          accentColor={ACCENT}
          theme={APP_THEME}
          timeWindow={OHLCV.length * CANDLE_WIDTH_SECONDS}
          palette={customColors ? CUSTOM_CANDLE_PALETTE : undefined}
          metrics={{ candle: { bodyRadius: 3, wickWidth: 1 } }}
          volume={volume ? { maxHeight: 48, radius: 2 } : false}
          scrub={{ tooltip: true, snapToCandles: true }}
          yAxis={false}
          badge={false}
        />
      }
    >
      <ControlRow label="Static snapshot display">
        <ToggleChip label="Show volume" value={volume} onChange={setVolume} />
        <ToggleChip
          label="Teal / orange palette"
          value={customColors}
          onChange={setCustomColors}
        />
      </ControlRow>
    </DemoScreen>
  );
}
