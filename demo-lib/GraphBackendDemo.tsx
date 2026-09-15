import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  GRAPH_BACKEND,
  LineGraph,
  type GraphPoint,
} from "react-native-graph";

import { DemoScreen } from "./DemoScreen";
import { APP_FONT_FAMILY, APP_FONT_FAMILY_MEDIUM } from "./fonts";
import { colors } from "./theme";

type GraphBackend = "skia" | "tgfx" | "thor";

const START_TIME = Date.UTC(2025, 5, 13, 9, 30);
const POINT_INTERVAL_MS = 5 * 60 * 1_000;

/** Fixed, renderer-agnostic price history shared by all three backend demos. */
const GRAPH_POINTS: GraphPoint[] = Array.from({ length: 72 }, (_, index) => {
  const trend = index * 0.19;
  const wave = Math.sin(index * 0.42) * 3.6 + Math.cos(index * 0.16) * 1.4;
  const dip = index > 35 && index < 49 ? -(49 - index) * 0.25 : 0;
  return {
    date: new Date(START_TIME + index * POINT_INTERVAL_MS),
    value: Number((146.8 + trend + wave + dip).toFixed(2)),
  };
});

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const BACKEND_DETAIL: Record<GraphBackend, string> = {
  skia: "Skia canvas — the default renderer.",
  tgfx: "Tencent tGFX GPU canvas.",
  thor: "ThorVG canvas running from the UI thread.",
};

export function GraphBackendDemo({ backend }: { backend: GraphBackend }) {
  const [selectedPoint, setSelectedPoint] = useState<GraphPoint | null>(null);
  const resolvedBackend = GRAPH_BACKEND as GraphBackend;
  const resolved = resolvedBackend === backend;

  return (
    <DemoScreen
      title={`react-native-graph · ${backend}`}
      description={`The same 72-point price chart and LineGraph props rendered with ${backend}. ${BACKEND_DETAIL[backend]}`}
      chart={
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>BUILD BACKEND</Text>
            <Text style={[styles.statusValue, !resolved && styles.statusWarning]}>
              {resolvedBackend.toUpperCase()}
            </Text>
          </View>
          <LineGraph
            animated
            color="#3323E6"
            enableIndicator
            indicatorPulsating
            enablePanGesture
            gradientFillColors={["rgba(51,35,230,0.28)", "rgba(51,35,230,0)"]}
            lineThickness={4}
            onPointSelected={setSelectedPoint}
            panGestureDelay={0}
            points={GRAPH_POINTS}
            style={styles.graph}
          />
          <Text style={styles.hint}>Press and drag to inspect the same data.</Text>
        </View>
      }
    >
      <Text style={styles.readout}>
        {selectedPoint
          ? `${selectedPoint.date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}  ${formatPrice(selectedPoint.value)}`
          : `Latest  ${formatPrice(GRAPH_POINTS[GRAPH_POINTS.length - 1]!.value)}`}
      </Text>
      {!resolved ? (
        <Text style={styles.note}>
          This route is shared across builds. Start the app with the {backend} script to render it through {backend}; this build resolved {resolvedBackend}.
        </Text>
      ) : null}
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FAFAFF",
    padding: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    color: colors.textFaint,
    fontFamily: APP_FONT_FAMILY_MEDIUM,
    fontSize: 10,
    letterSpacing: 0.9,
  },
  statusValue: {
    color: "#3323E6",
    fontFamily: APP_FONT_FAMILY_MEDIUM,
    fontSize: 11,
    letterSpacing: 0.7,
  },
  statusWarning: {
    color: "#B45309",
  },
  graph: {
    flex: 1,
    marginTop: 10,
  },
  hint: {
    color: colors.textFaint,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  readout: {
    color: colors.textMuted,
    fontFamily: APP_FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  note: {
    color: "#92400E",
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
